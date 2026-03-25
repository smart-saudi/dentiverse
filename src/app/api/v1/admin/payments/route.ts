import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAuthenticatedAdminContext } from '@/lib/user-access';
import { adminPaymentListQuerySchema } from '@/lib/validations/admin';
import { createAdminErrorResponse } from '@/app/api/v1/admin/_shared';
import { AdminService } from '@/services/admin.service';

const adminService = new AdminService();

/**
 * GET /api/v1/admin/payments
 *
 * Return paginated payment support data for admins.
 *
 * @param request - Incoming request with query params
 * @returns Paginated payment list
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    await getAuthenticatedAdminContext(supabase);

    const parsed = adminPaymentListQuerySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries()),
    );

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

    const adminClient = createAdminClient();
    const result = await adminService.listPayments(adminClient, parsed.data);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return createAdminErrorResponse(error, 'Failed to load admin payments');
  }
}
