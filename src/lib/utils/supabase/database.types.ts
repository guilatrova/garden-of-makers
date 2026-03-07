export { createClient as createBrowserClient } from "./client";
export { createClient as createServerClient, createServiceClient } from "./server";
export { updateSession } from "./middleware";

/**
 * Database schema types for Supabase
 * Based on migration 002_startups_relational_cache.sql
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
      startups: {
        Row: {
          id: string;
          slug: string;
          name: string;
          icon: string | null;
          description: string | null;
          website: string | null;
          country: string | null;
          founded_date: string | null;
          category: string | null;
          payment_provider: string;
          target_audience: string | null;
          mrr_cents: number;
          revenue_last_30d_cents: number;
          revenue_total_cents: number;
          customers: number;
          active_subscriptions: number;
          growth_30d: number | null;
          profit_margin_last_30d: number | null;
          multiple: number | null;
          on_sale: boolean;
          asking_price_cents: number | null;
          first_listed_for_sale_at: string | null;
          x_handle: string | null;
          _last_fetch_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          icon?: string | null;
          description?: string | null;
          website?: string | null;
          country?: string | null;
          founded_date?: string | null;
          category?: string | null;
          payment_provider: string;
          target_audience?: string | null;
          mrr_cents?: number;
          revenue_last_30d_cents?: number;
          revenue_total_cents?: number;
          customers?: number;
          active_subscriptions?: number;
          growth_30d?: number | null;
          profit_margin_last_30d?: number | null;
          multiple?: number | null;
          on_sale?: boolean;
          asking_price_cents?: number | null;
          first_listed_for_sale_at?: string | null;
          x_handle?: string | null;
          _last_fetch_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          icon?: string | null;
          description?: string | null;
          website?: string | null;
          country?: string | null;
          founded_date?: string | null;
          category?: string | null;
          payment_provider?: string;
          target_audience?: string | null;
          mrr_cents?: number;
          revenue_last_30d_cents?: number;
          revenue_total_cents?: number;
          customers?: number;
          active_subscriptions?: number;
          growth_30d?: number | null;
          profit_margin_last_30d?: number | null;
          multiple?: number | null;
          on_sale?: boolean;
          asking_price_cents?: number | null;
          first_listed_for_sale_at?: string | null;
          x_handle?: string | null;
          _last_fetch_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      startup_details: {
        Row: {
          id: string;
          startup_id: string;
          x_follower_count: number | null;
          is_merchant_of_record: boolean;
          _last_fetch_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          startup_id: string;
          x_follower_count?: number | null;
          is_merchant_of_record?: boolean;
          _last_fetch_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          startup_id?: string;
          x_follower_count?: number | null;
          is_merchant_of_record?: boolean;
          _last_fetch_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      startup_tech_stack: {
        Row: {
          id: string;
          startup_id: string;
          tech_slug: string;
          tech_category: string;
        };
        Insert: {
          id?: string;
          startup_id: string;
          tech_slug: string;
          tech_category: string;
        };
        Update: {
          id?: string;
          startup_id?: string;
          tech_slug?: string;
          tech_category?: string;
        };
      };
      startup_cofounders: {
        Row: {
          id: string;
          startup_id: string;
          x_handle: string;
          x_name: string | null;
        };
        Insert: {
          id?: string;
          startup_id: string;
          x_handle: string;
          x_name?: string | null;
        };
        Update: {
          id?: string;
          startup_id?: string;
          x_handle?: string;
          x_name?: string | null;
        };
      };
      sync_state: {
        Row: {
          id: string;
          sync_key: string;
          last_page: number;
          total_pages: number | null;
          total_startups: number;
          is_complete: boolean;
          started_at: string;
          last_run_at: string;
        };
        Insert: {
          id?: string;
          sync_key?: string;
          last_page?: number;
          total_pages?: number | null;
          total_startups?: number;
          is_complete?: boolean;
          started_at?: string;
          last_run_at?: string;
        };
        Update: {
          id?: string;
          sync_key?: string;
          last_page?: number;
          total_pages?: number | null;
          total_startups?: number;
          is_complete?: boolean;
          started_at?: string;
          last_run_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
