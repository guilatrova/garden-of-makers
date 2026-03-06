export { createClient as createBrowserClient } from "./client";
export { createClient as createServerClient, createServiceClient } from "./server";
export { updateSession } from "./middleware";

/**
 * Database schema types for Supabase
 * Generated types based on schema in migrations
 */
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          avatar_url: string | null;
          favorite_startups: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          avatar_url?: string | null;
          favorite_startups?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          avatar_url?: string | null;
          favorite_startups?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };
      forest_cache: {
        Row: {
          id: string;
          cache_key: string;
          data: unknown;
          expires_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          cache_key: string;
          data: unknown;
          expires_at: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          cache_key?: string;
          data?: unknown;
          expires_at?: string;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
