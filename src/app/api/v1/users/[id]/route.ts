import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/users/[id] — Get a public user profile by ID.
 *
 * Returns limited public profile data (no email, no private settings).
 *
 * @param _req - Next.js request
 * @param context - Route context with user ID
 * @returns Public user profile
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json(
      { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      { status: 401 },
    );
  }

  const { id } = await context.params;

  const { data: profile, error } = await supabase
    .from('users')
    .select('id, full_name, avatar_url, role, created_at')
    .eq('id', id)
    .single();

  if (error || !profile) {
    return NextResponse.json(
      { code: 'NOT_FOUND', message: 'User not found' },
      { status: 404 },
    );
  }

  return NextResponse.json({ data: profile });
}
