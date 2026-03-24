import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { consumeAuthRateLimit, createAuthAbuseResponse } from '@/lib/auth-abuse';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const refreshSchema = z.object({
  refresh_token: z.string().min(1, 'refresh_token is required'),
});

/**
 * POST /api/v1/auth/refresh — Refresh an access token using a refresh token.
 *
 * @param req - Next.js request with refresh_token body
 * @returns New session with access and refresh tokens
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = refreshSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const rateLimitDecision = consumeAuthRateLimit(
      req,
      'refresh',
      parsed.data.refresh_token,
    );

    if (!rateLimitDecision.allowed) {
      return createAuthAbuseResponse(rateLimitDecision);
    }

    const supabase = await createServerSupabaseClient();

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: parsed.data.refresh_token,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { code: 'UNAUTHORIZED', message: error?.message ?? 'Failed to refresh token' },
        { status: 401 },
      );
    }

    return NextResponse.json({
      data: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_in: data.session.expires_in,
        expires_at: data.session.expires_at,
      },
    });
  } catch {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}
