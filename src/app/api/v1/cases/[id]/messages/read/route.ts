import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { MessageService } from '@/services/message.service';

const messageService = new MessageService();

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/cases/[id]/messages/read — Mark all messages in a case as read.
 *
 * Marks all messages not sent by the current user as read.
 *
 * @param _req - Next.js request
 * @param context - Route context with case ID
 * @returns Confirmation of messages marked as read
 */
export async function POST(_req: NextRequest, context: RouteContext) {
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

  try {
    await messageService.markAsRead(supabase, caseId, user.id);
    return NextResponse.json({ data: { success: true } });
  } catch (err) {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to mark messages as read',
      },
      { status: 500 },
    );
  }
}
