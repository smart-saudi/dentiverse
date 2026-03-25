import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAuthenticatedAdminContext } from '@/lib/user-access';
import { adminUserListQuerySchema } from '@/lib/validations/admin';
import { createAdminErrorResponse } from '@/app/api/v1/admin/_shared';
import { AdminService } from '@/services/admin.service';

const adminService = new AdminService();

/**
 * GET /api/v1/admin/users
 *
 * Return the paginated admin user list.
 *
 * @param request - Incoming request with list query params
 * @returns Paginated user list for admin operations
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    await getAuthenticatedAdminContext(supabase);

    const parsed = adminUserListQuerySchema.safeParse(
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
    const result = await adminService.listUsers(adminClient, parsed.data);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return createAdminErrorResponse(error, 'Failed to load admin users');
  }
}
