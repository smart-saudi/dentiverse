import { NextRequest, NextResponse } from 'next/server';

import {
  consumeAuthRateLimit,
  createAuthAbuseResponse,
  getLoginLockout,
  recordFailedLoginAttempt,
  resetLoginFailures,
} from '@/lib/auth-abuse';
import { loginSchema } from '@/lib/validations/auth';
import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * POST /api/v1/auth/login
 *
 * Authenticate with email and password.
 * No authentication required.
 *
 * @param request - Incoming request with { email, password }
 * @returns 200 with user, access_token, refresh_token, expires_at
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

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

    const { email, password } = parsed.data;
    const rateLimitDecision = consumeAuthRateLimit(request, 'login', email);

    if (!rateLimitDecision.allowed) {
      return createAuthAbuseResponse(rateLimitDecision);
    }

    const lockoutDecision = getLoginLockout(email);

    if (lockoutDecision) {
      return createAuthAbuseResponse(lockoutDecision);
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      const isCredentialError =
        error.status === 400 ||
        error.status === 401 ||
        /invalid login credentials/i.test(error.message);

      if (!isCredentialError) {
        return NextResponse.json(
          { code: 'INTERNAL_ERROR', message: 'Authentication service unavailable' },
          { status: 500 },
        );
      }

      const updatedLockoutDecision = recordFailedLoginAttempt(email);

      if (updatedLockoutDecision) {
        return createAuthAbuseResponse(updatedLockoutDecision);
      }

      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: 'Invalid login credentials' },
        { status: 401 },
      );
    }

    resetLoginFailures(email);

    return NextResponse.json(
      {
        data: {
          user: data.user,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
