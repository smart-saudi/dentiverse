import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NotificationService } from '@/services/notification.service';

const notificationService = new NotificationService();

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/notifications/[id]/read — Mark a notification as read.
 *
 * @param _req - Next.js request
 * @param context - Route context with notification ID
 * @returns The updated notification
 */
export async function POST(_req: NextRequest, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await context.params;

  try {
    const notification = await notificationService.markAsRead(supabase, id);
    return NextResponse.json({ data: notification });
  } catch (err) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Failed to mark as read' },
      { status: 500 },
    );
  }
}
