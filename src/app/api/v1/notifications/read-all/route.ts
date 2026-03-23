import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NotificationService } from '@/services/notification.service';

const notificationService = new NotificationService();

/**
 * POST /api/v1/notifications/read-all — Mark all notifications as read.
 *
 * @param _req - Next.js request
 * @returns Success acknowledgment
 */
export async function POST(_req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Not authenticated' }, { status: 401 });
  }

  try {
    await notificationService.markAllAsRead(supabase, user.id);
    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Failed to mark all as read' },
      { status: 500 },
    );
  }
}
