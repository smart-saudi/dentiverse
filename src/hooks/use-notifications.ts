'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Database } from '@/lib/database.types';
import { useRealtime } from './use-realtime';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];

/**
 * Hook to manage notifications with realtime updates.
 *
 * @returns Notifications, unread count, loading state, and actions
 */
export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/v1/notifications?per_page=20');
      if (!res.ok) return;
      const json = await res.json();
      setNotifications(json.data);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/notifications/unread-count');
      if (!res.ok) return;
      const json = await res.json();
      setUnreadCount(json.data.count);
    } catch {
      // Silently ignore
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  // Subscribe to new notifications via Realtime
  useRealtime({
    table: 'notifications',
    event: 'INSERT',
    onEvent: (payload) => {
      const newNotif = payload.new as unknown as NotificationRow;
      setNotifications((prev) => [newNotif, ...prev]);
      setUnreadCount((c) => c + 1);
    },
  });

  const markAsRead = useCallback(async (id: string) => {
    await fetch(`/api/v1/notifications/${id}/read`, { method: 'POST' });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }, []);

  const markAllAsRead = useCallback(async () => {
    await fetch('/api/v1/notifications/read-all', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}
