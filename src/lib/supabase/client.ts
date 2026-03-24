import { createBrowserClient } from '@supabase/ssr';

import type { Database } from '@/lib/database.types';
import type { AppSupabaseClient } from '@/lib/supabase/types';

/**
 * Create a Supabase client for use in browser (Client Components).
 * Uses the public anon key — all queries go through RLS.
 *
 * @returns Supabase browser client instance
 */
export function createClient(): AppSupabaseClient {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  ) as unknown as AppSupabaseClient;
}
