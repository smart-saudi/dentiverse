import type { SupabaseClient } from '@supabase/supabase-js';

import type { Database } from '@/lib/database.types';
import type { CreateNotificationInput, NotificationListQuery } from '@/lib/validations/notification';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];

/**
 * Service for managing user notifications.
 */
export class NotificationService {
  /**
   * Create a notification for a user.
   *
   * @param supabase - Supabase client (may be service role for server-side)
   * @param input - Notification data
   * @returns The created notification row
   * @throws Error if insert fails
   */
  async createNotification(
    supabase: SupabaseClient<Database>,
    input: CreateNotificationInput,
  ): Promise<NotificationRow> {
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: input.user_id,
        type: input.type,
        title: input.title,
        body: input.body,
        case_id: input.case_id,
        action_url: input.action_url,
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * List notifications for the current user.
   *
   * @param supabase - Authenticated Supabase client
   * @param userId - The user's ID
   * @param query - Pagination and filter params
   * @returns Paginated notifications and meta
   */
  async listNotifications(
    supabase: SupabaseClient<Database>,
    userId: string,
    query: NotificationListQuery,
  ): Promise<{ data: NotificationRow[]; meta: { page: number; per_page: number; total: number; total_pages: number } }> {
    const { page, per_page, is_read } = query;
    const from = (page - 1) * per_page;
    const to = from + per_page - 1;

    let builder = supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .eq('user_id', userId);

    if (is_read !== undefined) {
      builder = builder.eq('is_read', is_read === 'true');
    }

    const { data, error, count } = await builder
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
   * Mark a single notification as read.
   *
   * @param supabase - Authenticated Supabase client
   * @param notificationId - The notification to mark
   * @returns The updated notification
   * @throws Error if not found or update fails
   */
  async markAsRead(
    supabase: SupabaseClient<Database>,
    notificationId: string,
  ): Promise<NotificationRow> {
    const { data, error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  }

  /**
   * Mark all notifications as read for the current user.
   *
   * @param supabase - Authenticated Supabase client
   * @param userId - The user's ID
   */
  async markAllAsRead(
    supabase: SupabaseClient<Database>,
    userId: string,
  ): Promise<void> {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
  }

  /**
   * Get the count of unread notifications for a user.
   *
   * @param supabase - Authenticated Supabase client
   * @param userId - The user's ID
   * @returns The unread count
   */
  async getUnreadCount(
    supabase: SupabaseClient<Database>,
    userId: string,
  ): Promise<number> {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw new Error(error.message);
    return count ?? 0;
  }
}
