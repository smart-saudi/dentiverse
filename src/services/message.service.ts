import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';
import type { CreateMessageInput, MessageListQuery } from '@/lib/validations/message';

type MessageRow = Database['public']['Tables']['messages']['Row'];

/**
 * Service for managing case messages / chat threads.
 */
export class MessageService {
  /**
   * Send a message in a case thread.
   *
   * @param supabase - Authenticated Supabase client
   * @param caseId - The case to post in
   * @param senderId - The authenticated user's ID
   * @param input - Message content and optional attachments
   * @returns The created message row
   * @throws Error if insert fails
   */
  async sendMessage(
    supabase: SupabaseClient<Database>,
    caseId: string,
    senderId: string,
    input: CreateMessageInput,
  ): Promise<MessageRow> {
    const { data, error } = await supabase
      .from('messages')
      .insert({
        case_id: caseId,
        sender_id: senderId,
        content: input.content,
        attachment_urls: input.attachment_urls,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * List messages for a case thread, ordered newest-first.
   *
   * @param supabase - Authenticated Supabase client
   * @param caseId - The case to list messages for
   * @param query - Pagination params
   * @returns Paginated messages and meta
   */
  async listMessages(
    supabase: SupabaseClient<Database>,
    caseId: string,
    query: MessageListQuery,
  ): Promise<{
    data: MessageRow[];
    meta: { page: number; per_page: number; total: number; total_pages: number };
  }> {
    const { page, per_page } = query;
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;

    const { data, error, count } = await supabase
      .from('messages')
      .select('*', { count: 'exact' })
      .eq('case_id', caseId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw new Error(error.message);

    const total = count ?? 0;
    return {
      data: data ?? [],
      meta: { page, per_page, total, total_pages: Math.ceil(total / per_page) },
    };
  }

  /**
   * Mark all messages in a case as read for the current user.
   *
   * @param supabase - Authenticated Supabase client
   * @param caseId - The case whose messages to mark read
   * @param userId - The current user (only marks messages NOT sent by them)
   */
  async markAsRead(
    supabase: SupabaseClient<Database>,
    caseId: string,
    userId: string,
  ): Promise<void> {
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('case_id', caseId)
      .neq('sender_id', userId)
      .eq('is_read', false);
  }
}
