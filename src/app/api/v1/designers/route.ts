import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { designerSearchQuerySchema } from '@/lib/validations/designer';
import { DesignerService } from '@/services/designer.service';

const designerService = new DesignerService();

/**
 * GET /api/v1/designers — Browse/search designers with filters and pagination.
 *
 * @param req - Next.js request with optional query params
 * @returns Paginated list of designer profiles
 */
export async function GET(req: NextRequest) {
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

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = designerSearchQuerySchema.safeParse(params);
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

  try {
    const result = await designerService.listDesigners(supabase, parsed.data);
    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (err) {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to list designers',
      },
      { status: 500 },
    );
  }
}
