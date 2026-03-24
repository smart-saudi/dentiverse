import { NextRequest, NextResponse } from 'next/server';

import {
  buildRequestLogContext,
  captureServerException,
} from '@/lib/observability/server';
import { resetPasswordSchema } from '@/lib/validations/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/v1/auth/reset-password
 *
 * Reset user password using a token from the reset email.
 * The Supabase client must have an active session from the token exchange.
 * No authentication required (token-based).
 *
 * @param request - Incoming request with { token, password }
 * @returns 200 on success
 */
export async function POST(request: NextRequest) {
  const requestContext = buildRequestLogContext(request, '/api/v1/auth/reset-password');

  try {
    const body = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { password } = parsed.data;
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return NextResponse.json(
        { code: 'RESET_ERROR', message: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { data: { message: 'Password updated successfully' } },
      { status: 200 },
    );
  } catch (error) {
    captureServerException(error, 'Unhandled reset-password route error', {
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
