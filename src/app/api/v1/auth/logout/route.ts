import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/v1/auth/logout
 *
 * Sign out the current user and invalidate the session.
 *
 * @returns 200 on success
 */
export async function POST(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return NextResponse.json(
        { code: 'LOGOUT_ERROR', message: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { data: { message: 'Logged out successfully' } },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
