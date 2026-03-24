import type { CookieOptions } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';

export type AppSupabaseSchema = Database['public'];

/**
 * Shared Supabase client type used across routes, services, and helpers.
 *
 * `@supabase/ssr` currently returns a three-generic `SupabaseClient` shape,
 * while the installed `@supabase/supabase-js` client expects the schema name
 * and schema object as separate generic parameters. Normalizing on the fully
 * specified client type here keeps the app on a single contract.
 */
export type AppSupabaseClient = SupabaseClient<
  Database,
  'public',
  'public',
  AppSupabaseSchema
>;

export interface SupabaseCookieToSet {
  name: string;
  value: string;
  options: CookieOptions;
}
