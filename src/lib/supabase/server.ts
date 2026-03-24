import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

import type { Database } from '@/lib/database.types';
import type { AppSupabaseClient, SupabaseCookieToSet } from '@/lib/supabase/types';

/**
 * Create a Supabase client for use in Server Components, Server Actions,
 * and Route Handlers. Reads auth cookies from the incoming request.
 *
 * @returns Supabase server client instance
 */
export async function createServerSupabaseClient(): Promise<AppSupabaseClient> {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: SupabaseCookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // setAll is called from a Server Component where cookies
            // cannot be set. This is safe to ignore when the middleware
            // is refreshing the session.
          }
        },
      },
    },
  ) as unknown as AppSupabaseClient;
}
