import { NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAuthenticatedAdminContext } from '@/lib/user-access';
import { createAdminErrorResponse } from '@/app/api/v1/admin/_shared';
import { AdminService } from '@/services/admin.service';

const adminService = new AdminService();

/**
 * GET /api/v1/admin/dashboard
 *
 * Return the admin dashboard summary.
 *
 * @returns Dashboard counts and recent audit activity
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    await getAuthenticatedAdminContext(supabase);

    const adminClient = createAdminClient();
    const data = await adminService.getDashboardSummary(adminClient);

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return createAdminErrorResponse(error, 'Failed to load the admin dashboard');
  }
}
