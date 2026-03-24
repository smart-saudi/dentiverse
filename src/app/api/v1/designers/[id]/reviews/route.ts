import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { reviewListQuerySchema } from '@/lib/validations/review';
import { ReviewService } from '@/services/review.service';

const reviewService = new ReviewService();

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/designers/[id]/reviews — List reviews for a designer.
 *
 * Designer reviews are publicly viewable. Supports pagination via
 * `page` and `per_page` query parameters.
 *
 * @param req - Next.js request with optional query params
 * @param context - Route context with designer ID
 * @returns Paginated list of reviews
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  // Public endpoint — no auth required, but initialise client for RLS
  await supabase.auth.getUser();

  const { id: designerId } = await context.params;
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = reviewListQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      {
        code: 'VALIDATION_ERROR',
        message: 'Invalid query',
        details: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  try {
    const result = await reviewService.listReviewsForDesigner(
      supabase,
      designerId,
      parsed.data,
    );
    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (err) {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to list reviews',
      },
      { status: 500 },
    );
  }
}
