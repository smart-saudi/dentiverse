import { createClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';
import type { AppSupabaseClient } from '@/lib/supabase/types';

/**
 * Create a Supabase admin client using the service role key.
 * This bypasses RLS — use ONLY in server-side code (webhooks, admin operations).
 *
 * WARNING: Never import this file from client components.
 *
 * @returns Supabase admin client instance
 */
export function createAdminClient(): AppSupabaseClient {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  ) as AppSupabaseClient;
}
