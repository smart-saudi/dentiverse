import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { reviewDesignVersionSchema } from '@/lib/validations/design-version';
import { DesignVersionService } from '@/services/design-version.service';

const designVersionService = new DesignVersionService();

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/design-versions/[id]/review — Review a design version (approve or request revision).
 *
 * @param req - Next.js request with review body
 * @param context - Route context with design version ID
 * @returns The updated design version
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Not authenticated' }, { status: 401 });
  }

  const { id: versionId } = await context.params;
  const body = await req.json();
  const parsed = reviewDesignVersionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const version = await designVersionService.reviewVersion(supabase, versionId, parsed.data);
    return NextResponse.json({ data: version });
  } catch (err) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Failed to review version' },
      { status: 500 },
    );
  }
}
