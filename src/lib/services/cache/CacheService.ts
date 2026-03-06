/**
 * Cache Service
 * Server-side caching using Supabase forest_cache table
 * Falls back to in-memory Map for local dev without Supabase
 */

import { createServiceClient } from "@/lib/utils/supabase/server";
import { Database } from "@/lib/utils/supabase/database.types";
import { CacheEntry } from "./types";

// In-memory fallback for local dev
const memoryCache = new Map<string, CacheEntry<unknown>>();

export class CacheService {
  private useSupabase: boolean;

  constructor() {
    // Check if Supabase is configured
    this.useSupabase = !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  }

  /**
   * Get cached data by key
   * Returns null if not found or expired
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      if (this.useSupabase) {
        return await this.getFromSupabase<T>(key);
      } else {
        return this.getFromMemory<T>(key);
      }
    } catch (error) {
      console.warn(`Cache get error for key "${key}":`, error);
      // Fallback to memory on error
      return this.getFromMemory<T>(key);
    }
  }

  /**
   * Set cached data with TTL
   */
  async set<T>(key: string, data: T, ttlMinutes: number): Promise<void> {
    try {
      if (this.useSupabase) {
        await this.setInSupabase(key, data, ttlMinutes);
      } else {
        this.setInMemory(key, data, ttlMinutes);
      }
    } catch (error) {
      console.warn(`Cache set error for key "${key}":`, error);
      // Fallback to memory on error
      this.setInMemory(key, data, ttlMinutes);
    }
  }

  /**
   * Invalidate cached data by key
   */
  async invalidate(key: string): Promise<void> {
    try {
      if (this.useSupabase) {
        await this.invalidateInSupabase(key);
      } else {
        memoryCache.delete(key);
      }
    } catch (error) {
      console.warn(`Cache invalidate error for key "${key}":`, error);
      memoryCache.delete(key);
    }
  }

  /**
   * Get from Supabase
   */
  private async getFromSupabase<T>(key: string): Promise<T | null> {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("forest_cache")
      .select("data, expires_at")
      .eq("cache_key", key)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No rows found - not an error
        return null;
      }
      throw error;
    }

    if (!data) {
      return null;
    }

    // Check if expired
    const cacheEntry = data as { data: unknown; expires_at: string };
    const expiresAt = new Date(cacheEntry.expires_at);
    if (expiresAt < new Date()) {
      // Expired - clean it up
      await this.invalidateInSupabase(key);
      return null;
    }

    return cacheEntry.data as T;
  }

  /**
   * Set in Supabase
   */
  private async setInSupabase<T>(
    key: string,
    data: T,
    ttlMinutes: number
  ): Promise<void> {
    const supabase = createServiceClient();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

    const { error } = await (
      supabase.from("forest_cache") as unknown as {
        upsert: (
          values: Database["public"]["Tables"]["forest_cache"]["Insert"],
          options?: { onConflict?: string }
        ) => Promise<{ error: Error | null }>;
      }
    ).upsert(
      {
        cache_key: key,
        data: data as unknown,
        expires_at: expiresAt.toISOString(),
      },
      {
        onConflict: "cache_key",
      }
    );

    if (error) {
      throw error;
    }
  }

  /**
   * Invalidate in Supabase
   */
  private async invalidateInSupabase(key: string): Promise<void> {
    const supabase = createServiceClient();

    const { error } = await supabase
      .from("forest_cache")
      .delete()
      .eq("cache_key", key);

    if (error) {
      throw error;
    }
  }

  /**
   * Get from in-memory cache
   */
  private getFromMemory<T>(key: string): T | null {
    const entry = memoryCache.get(key);

    if (!entry) {
      return null;
    }

    // Check if expired
    const expiresAt = new Date(entry.expiresAt);
    if (expiresAt < new Date()) {
      memoryCache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set in in-memory cache
   */
  private setInMemory<T>(key: string, data: T, ttlMinutes: number): void {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

    memoryCache.set(key, {
      data,
      expiresAt: expiresAt.toISOString(),
    });
  }
}

// Singleton instance for server-side use
export const cacheService = new CacheService();
