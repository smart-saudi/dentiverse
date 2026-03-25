import { NextRequest, NextResponse } from 'next/server';

import { createAdminClient } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getAuthenticatedAdminContext } from '@/lib/user-access';
import { adminUserActionSchema } from '@/lib/validations/admin';
import { createAdminErrorResponse } from '@/app/api/v1/admin/_shared';
import { AuditService, extractRequestMeta } from '@/services/audit.service';
import { AdminService } from '@/services/admin.service';

const adminService = new AdminService();
const audit = new AuditService();

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * PATCH /api/v1/admin/users/[id]
 *
 * Apply an admin suspend/reactivate action to a user.
 *
 * @param request - Incoming request with action payload
 * @param context - Route context with user ID
 * @returns Updated user state
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const supabase = await createServerSupabaseClient();
    const adminContext = await getAuthenticatedAdminContext(supabase);
    const { id } = await context.params;
    const body = await request.json();
    const parsed = adminUserActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          code: 'VALIDATION_ERROR',
          message: 'Invalid action payload',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const adminClient = createAdminClient();
    const data = await adminService.setUserActiveState(
      adminClient,
      adminContext.authUser.id,
      id,
      parsed.data.action === 'REACTIVATE',
    );

    audit.log({
      userId: adminContext.authUser.id,
      action:
        parsed.data.action === 'REACTIVATE'
          ? 'admin.user.reactivated'
          : 'admin.user.deactivated',
      entityType: 'user',
      entityId: id,
      newData: {
        is_active: data.is_active,
        ticket_reference: parsed.data.ticket_reference,
        reason: parsed.data.reason,
      },
      ...extractRequestMeta(request),
    });

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    return createAdminErrorResponse(error, 'Failed to update the user');
  }
}
