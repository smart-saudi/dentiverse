import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  createDesignVersionSchema,
  designVersionListQuerySchema,
} from '@/lib/validations/design-version';
import { AuditService, extractRequestMeta } from '@/services/audit.service';
import { DesignVersionService } from '@/services/design-version.service';

const designVersionService = new DesignVersionService();
const audit = new AuditService();

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/cases/[id]/design-versions — Submit a new design version.
 *
 * @param req - Next.js request with design version body
 * @param context - Route context with case ID
 * @returns The created design version
 */
export async function POST(req: NextRequest, context: RouteContext) {
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

  const { id: caseId } = await context.params;
  const body = await req.json();
  const parsed = createDesignVersionSchema.safeParse(body);
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

  try {
    // Determine next version number
    const latest = await designVersionService.getLatestVersion(supabase, caseId);
    const nextVersion = latest ? latest.version_number + 1 : 1;

    const version = await designVersionService.createVersion(
      supabase,
      caseId,
      user.id,
      nextVersion,
      parsed.data,
    );
    const meta = extractRequestMeta(req);
    audit.log({
      userId: user.id,
      action: 'design_version.submitted',
      entityType: 'design_version',
      entityId: version.id,
      newData: { case_id: caseId, version_number: nextVersion },
      ...meta,
    });

    return NextResponse.json({ data: version }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to create version',
      },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/cases/[id]/design-versions — List design versions for a case.
 *
 * @param req - Next.js request with optional query params
 * @param context - Route context with case ID
 * @returns Paginated list of design versions
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

  const { id: caseId } = await context.params;
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = designVersionListQuerySchema.safeParse(params);
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
    const result = await designVersionService.listVersionsForCase(
      supabase,
      caseId,
      parsed.data,
    );
    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (err) {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to list versions',
      },
      { status: 500 },
    );
  }
}
