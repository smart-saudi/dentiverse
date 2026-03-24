import { NextRequest, NextResponse } from 'next/server';

import {
  buildRequestLogContext,
  captureServerException,
} from '@/lib/observability/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/v1/auth/logout
 *
 * Sign out the current user and invalidate the session.
 *
 * @returns 200 on success
 */
export async function POST(request: NextRequest) {
  const requestContext = buildRequestLogContext(request, '/api/v1/auth/logout');

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      captureServerException(error, 'Logout route sign-out failed', {
        request: requestContext,
        context: {
          provider: 'supabase-auth',
        },
      });

      return NextResponse.json(
        { code: 'LOGOUT_ERROR', message: error.message },
        {
          status: 500,
          headers: {
            'X-Request-Id': requestContext.requestId,
          },
        },
      );
    }

    return NextResponse.json(
      { data: { message: 'Logged out successfully' } },
      { status: 200 },
    );
  } catch (error) {
    captureServerException(error, 'Unhandled logout route error', {
      request: requestContext,
    });

    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      {
        status: 500,
        headers: {
          'X-Request-Id': requestContext.requestId,
        },
      },
    );
  }
}
