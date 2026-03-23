import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { updateDesignerProfileSchema } from '@/lib/validations/designer';
import { DesignerService } from '@/services/designer.service';

const designerService = new DesignerService();

/**
 * GET /api/v1/designers/me — Fetch the current user's designer profile.
 *
 * @param _req - Next.js request
 * @returns The authenticated user's designer profile
 */
export async function GET(_req: NextRequest) {
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

  try {
    const profile = await designerService.getProfileByUserId(supabase, user.id);
    return NextResponse.json({ data: profile });
  } catch (err) {
    if (err instanceof Error && err.message.includes('not found')) {
      return NextResponse.json(
        { code: 'NOT_FOUND', message: 'Designer profile not found' },
        { status: 404 },
      );
    }
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to fetch profile',
      },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/v1/designers/me — Update the current user's designer profile.
 *
 * @param req - Next.js request with update body
 * @returns The updated designer profile
 */
export async function PATCH(req: NextRequest) {
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

  const body = await req.json();
  const parsed = updateDesignerProfileSchema.safeParse(body);
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
    const profile = await designerService.updateProfile(supabase, user.id, parsed.data);
    return NextResponse.json({ data: profile });
  } catch (err) {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to update profile',
      },
      { status: 500 },
    );
  }
}
