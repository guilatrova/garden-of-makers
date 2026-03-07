/**
 * CacheService
 * Simple in-memory cache for individual items (startup detail, etc.)
 * Forest/startup list data now lives in Supabase tables directly.
 */

import { CacheEntry } from "./types";

const memoryCache = new Map<string, CacheEntry<unknown>>();

export class CacheService {
  async get<T>(key: string): Promise<T | null> {
    const entry = memoryCache.get(key);

    if (!entry) {
      return null;
    }

    const expiresAt = new Date(entry.expiresAt);
    if (expiresAt < new Date()) {
      memoryCache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  async set<T>(key: string, data: T, ttlMinutes: number): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

    memoryCache.set(key, {
      data,
      expiresAt: expiresAt.toISOString(),
    });
  }

  async invalidate(key: string): Promise<void> {
    memoryCache.delete(key);
  }
}

export const cacheService = new CacheService();
