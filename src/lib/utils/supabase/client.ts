import { createBrowserClient } from "@supabase/ssr";
import { Database } from "./database.types";

/**
 * Browser Supabase client
 * For use in client components only
 * Respects RLS policies
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
