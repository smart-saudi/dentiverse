import { NextResponse } from 'next/server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

/**
 * GET /api/v1/users/me/dashboard — Get dashboard statistics for the current user.
 *
 * Returns role-appropriate stats: active/completed cases, pending proposals,
 * total spent/earned, average rating, unread messages, and unread notifications.
 *
 * @returns Dashboard statistics object
 */
export async function GET() {
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

  try {
    // Active cases (client or designer)
    const { count: activeCases } = await supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .or(`client_id.eq.${user.id},designer_id.eq.${user.id}`)
      .in('status', ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'REVIEW', 'REVISION']);

    // Completed cases
    const { count: completedCases } = await supabase
      .from('cases')
      .select('*', { count: 'exact', head: true })
      .or(`client_id.eq.${user.id},designer_id.eq.${user.id}`)
      .eq('status', 'COMPLETED');

    // Pending proposals (for designers: proposals they submitted; for clients: proposals on their cases)
    const { count: pendingProposals } = await supabase
      .from('proposals')
      .select('*', { count: 'exact', head: true })
      .eq('designer_id', user.id)
      .eq('status', 'PENDING');

    // Total spent (as client)
    const { data: spentData } = await supabase
      .from('payments')
      .select('amount')
      .eq('client_id', user.id)
      .in('status', ['HELD', 'RELEASED']);

    const totalSpent = spentData?.reduce((sum, p) => sum + p.amount, 0) ?? 0;

    // Total earned (as designer)
    const { data: earnedData } = await supabase
      .from('payments')
      .select('designer_payout')
      .eq('designer_id', user.id)
      .eq('status', 'RELEASED');

    const totalEarned = earnedData?.reduce((sum, p) => sum + p.designer_payout, 0) ?? 0;

    // Average rating (as designer)
    const { data: ratingData } = await supabase
      .from('reviews')
      .select('overall_rating')
      .eq('designer_id', user.id);

    const avgRating =
      ratingData && ratingData.length > 0
        ? ratingData.reduce((sum, r) => sum + r.overall_rating, 0) / ratingData.length
        : null;

    // Unread messages
    const { count: unreadMessages } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .neq('sender_id', user.id)
      .eq('is_read', false);

    // Unread notifications
    const { count: unreadNotifications } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('is_read', false);

    return NextResponse.json({
      data: {
        active_cases: activeCases ?? 0,
        completed_cases: completedCases ?? 0,
        pending_proposals: pendingProposals ?? 0,
        total_spent: totalSpent,
        total_earned: totalEarned,
        avg_rating: avgRating,
        unread_messages: unreadMessages ?? 0,
        unread_notifications: unreadNotifications ?? 0,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        code: 'INTERNAL_ERROR',
        message: err instanceof Error ? err.message : 'Failed to fetch dashboard stats',
      },
      { status: 500 },
    );
  }
}
