import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createServerSupabaseClient } from '@/lib/supabase/server';

const ALLOWED_BUCKETS = new Set([
  'dental-scans',
  'design-files',
  'avatars',
  'portfolios',
]);

interface RouteContext {
  params: Promise<{ bucket: string; filename: string }>;
}

const querySchema = z.object({
  expires_in: z.coerce.number().int().min(60).max(86400).default(3600),
});

/**
 * GET /api/v1/files/[bucket]/[filename]/signed-url — Get a time-limited signed URL.
 *
 * Returns a signed URL for a private file in Supabase Storage.
 * Default expiry is 1 hour, max 24 hours.
 *
 * @param req - Next.js request with optional expires_in query param
 * @param context - Route context with bucket and filename
 * @returns Signed URL and expiration time
 */
export async function GET(req: NextRequest, context: RouteContext) {
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

  const { bucket, filename } = await context.params;

  if (!ALLOWED_BUCKETS.has(bucket)) {
    return NextResponse.json(
      {
        code: 'VALIDATION_ERROR',
        message: `Invalid bucket. Allowed: ${[...ALLOWED_BUCKETS].join(', ')}`,
      },
      { status: 400 },
    );
  }

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = querySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const expiresIn = parsed.data.expires_in;

  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filename, expiresIn);

    if (error || !data?.signedUrl) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'File not found or access denied' },
        { status: 404 },
      );
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    return NextResponse.json({
      data: {
        signed_url: data.signedUrl,
        expires_at: expiresAt,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to generate signed URL',
      },
      { status: 500 },
    );
  }
}
