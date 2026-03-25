import type { User } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';
import type { AppSupabaseClient } from '@/lib/supabase/types';
import {
  AccountDisabledError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '@/lib/errors';

export interface AuthenticatedUserContext {
  /** The Supabase auth user for the current request. */
  authUser: User;
  /** The matching public.users profile row. */
  profile: Database['public']['Tables']['users']['Row'];
}

/**
 * Load the current user's public profile row by ID.
 *
 * @param client - Authenticated Supabase client
 * @param userId - Supabase auth user ID
 * @returns The matching `public.users` row
 * @throws NotFoundError when the profile row does not exist
 */
export async function getUserProfileById(
  client: AppSupabaseClient,
  userId: string,
): Promise<Database['public']['Tables']['users']['Row']> {
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new NotFoundError('User profile not found');
  }

  return data;
}

/**
 * Resolve the authenticated auth user and matching profile row for the current request.
 *
 * @param client - Authenticated Supabase client
 * @returns Auth user and profile context
 * @throws UnauthorizedError when no authenticated user exists
 * @throws NotFoundError when the profile row does not exist
 * @throws AccountDisabledError when the account is inactive
 */
export async function getAuthenticatedUserContext(
  client: AppSupabaseClient,
): Promise<AuthenticatedUserContext> {
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    throw new UnauthorizedError('Not authenticated');
  }

  const profile = await getUserProfileById(client, user.id);

  if (!profile.is_active) {
    throw new AccountDisabledError();
  }

  return {
    authUser: user,
    profile,
  };
}

/**
 * Resolve the authenticated admin user for the current request.
 *
 * @param client - Authenticated Supabase client
 * @returns Auth user and profile context for an active admin user
 * @throws UnauthorizedError when no authenticated user exists
 * @throws AccountDisabledError when the account is inactive
 * @throws ForbiddenError when the account is not an admin
 * @throws NotFoundError when the profile row does not exist
 */
export async function getAuthenticatedAdminContext(
  client: AppSupabaseClient,
): Promise<AuthenticatedUserContext> {
  const context = await getAuthenticatedUserContext(client);

  if (context.profile.role !== 'ADMIN') {
    throw new ForbiddenError('Admin access is required for this resource.');
  }

  return context;
}
