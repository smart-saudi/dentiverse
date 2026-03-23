import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NotificationService } from '@/services/notification.service';

const notificationService = new NotificationService();

/**
 * GET /api/v1/notifications/unread-count — Get unread notification count.
 *
 * @param _req - Next.js request
 * @returns The unread count
 */
export async function GET(_req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const count = await notificationService.getUnreadCount(supabase, user.id);
    return NextResponse.json({ data: { count } });
  } catch (err) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Failed to get count' },
      { status: 500 },
    );
  }
}
