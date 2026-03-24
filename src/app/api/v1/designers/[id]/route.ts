import { NextRequest, NextResponse } from 'next/server';

import {
  isUpstreamServiceUnavailableError,
  NotFoundError,
  ServiceUnavailableError,
} from '@/lib/errors';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { DesignerService } from '@/services/designer.service';

const designerService = new DesignerService();

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/v1/designers/[id] — Fetch a designer's public profile.
 *
 * @param req - Next.js request
 * @param context - Route context with designer profile ID
 * @returns The designer profile
 */
export async function GET(_req: NextRequest, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const { id } = await context.params;

  try {
    const profile = await designerService.getProfile(supabase, id);
    return NextResponse.json({ data: profile });
  } catch (err) {
    if (err instanceof NotFoundError) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'Designer not found' },
        { status: 404 },
      );
    }

    if (
      err instanceof ServiceUnavailableError ||
      isUpstreamServiceUnavailableError(err)
    ) {
      return NextResponse.json(
        {
          code: 'SERVICE_UNAVAILABLE',
          message:
            'The designer profile service is temporarily unavailable. Please try again shortly.',
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to fetch designer',
      },
      { status: 500 },
    );
  }
}
