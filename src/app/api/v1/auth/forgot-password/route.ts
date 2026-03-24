import { NextRequest, NextResponse } from 'next/server';

import { consumeAuthRateLimit, createAuthAbuseResponse } from '@/lib/auth-abuse';
import {
  buildRequestLogContext,
  captureServerException,
} from '@/lib/observability/server';
import { forgotPasswordSchema } from '@/lib/validations/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/v1/auth/forgot-password
 *
 * Send a password-reset email. Always returns 200 regardless of whether
 * the email exists (to prevent email enumeration).
 * No authentication required.
 *
 * @param request - Incoming request with { email }
 * @returns 200 always (except validation error)
 */
export async function POST(request: NextRequest) {
  const requestContext = buildRequestLogContext(request, '/api/v1/auth/forgot-password');

  try {
    const body = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

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

    const { email } = parsed.data;
    const rateLimitDecision = consumeAuthRateLimit(request, 'forgot-password', email);

    if (!rateLimitDecision.allowed) {
      return createAuthAbuseResponse(rateLimitDecision);
    }

    const supabase = await createServerSupabaseClient();
    const redirectTo = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`;

    await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    return NextResponse.json(
      { data: { message: 'If that email exists, a reset link has been sent' } },
      { status: 200 },
    );
  } catch (error) {
    captureServerException(error, 'Unhandled forgot-password route error', {
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
