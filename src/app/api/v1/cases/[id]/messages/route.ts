import { NextRequest, NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createMessageSchema, messageListQuerySchema } from '@/lib/validations/message';
import { MessageService } from '@/services/message.service';

const messageService = new MessageService();

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/v1/cases/[id]/messages — Send a message in a case thread.
 *
 * @param req - Next.js request with message body
 * @param context - Route context with case ID
 * @returns The created message
 */
export async function POST(req: NextRequest, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Not authenticated' }, { status: 401 });
  }

  const { id: caseId } = await context.params;

  const body = await req.json();
  const parsed = createMessageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const message = await messageService.sendMessage(supabase, caseId, user.id, parsed.data);
    return NextResponse.json({ data: message }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Failed to send message' },
      { status: 500 },
    );
  }
}

/**
 * GET /api/v1/cases/[id]/messages — List messages in a case thread.
 *
 * @param req - Next.js request with optional query params
 * @param context - Route context with case ID
 * @returns Paginated list of messages
 */
export async function GET(req: NextRequest, context: RouteContext) {
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ code: 'UNAUTHORIZED', message: 'Not authenticated' }, { status: 401 });
  }

  const { id: caseId } = await context.params;

  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  const parsed = messageListQuerySchema.safeParse(params);
  if (!parsed.success) {
    return NextResponse.json(
      { code: 'VALIDATION_ERROR', message: 'Invalid query', details: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    // Mark messages as read when listing
    await messageService.markAsRead(supabase, caseId, user.id);
    const result = await messageService.listMessages(supabase, caseId, parsed.data);
    return NextResponse.json({ data: result.data, meta: result.meta });
  } catch (err) {
    return NextResponse.json(
      { code: 'INTERNAL_ERROR', message: err instanceof Error ? err.message : 'Failed to list messages' },
      { status: 500 },
    );
  }
}
