'use client';

import { useCallback, useEffect, useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import type { Database } from '@/lib/database.types';

type NotificationRow = Database['public']['Tables']['notifications']['Row'];

const TYPE_LABELS: Record<string, string> = {
  NEW_PROPOSAL: 'Proposal',
  DESIGN_SUBMITTED: 'Design',
  REVISION_REQUESTED: 'Revision',
  PAYMENT_RELEASED: 'Payment',
  NEW_MESSAGE: 'Message',
  CASE_ASSIGNED: 'Case',
  CASE_COMPLETED: 'Case',
  REVIEW_RECEIVED: 'Review',
};

/**
 * Full notifications page showing all user notifications.
 */
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [meta, setMeta] = useState({ page: 1, per_page: 20, total: 0, total_pages: 0 });

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filter === 'unread') params.set('is_read', 'false');
      params.set('page', String(meta.page));

      const res = await fetch(`/api/v1/notifications?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load notifications');
      const json = await res.json();
      setNotifications(json.data);
      setMeta(json.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [filter, meta.page]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = useCallback(async (id: string) => {
    await fetch(`/api/v1/notifications/${id}/read`, { method: 'POST' });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  }, []);

  const markAllAsRead = useCallback(async () => {
    await fetch('/api/v1/notifications/read-all', { method: 'POST' });
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">
            Stay up to date with your cases and activity
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead}>
          <CheckCheck className="mr-2 h-4 w-4" />
          Mark all read
        </Button>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('all')}
        >
          All
        </Button>
        <Button
          variant={filter === 'unread' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setFilter('unread')}
        >
          Unread
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <Bell className="text-muted-foreground mb-2 h-8 w-8" />
          <p className="text-muted-foreground">
            {filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
          </p>
        </div>
      )}

      {/* Notification list */}
      {!isLoading && notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                'flex items-start gap-4 rounded-lg border p-4 transition-colors',
                !notif.is_read && 'bg-primary/5 border-primary/20',
              )}
            >
              <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-full">
                <Bell className="text-muted-foreground h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className={cn('text-sm', !notif.is_read && 'font-semibold')}>
                    {notif.title}
                  </span>
                  <Badge variant="outline" className="text-[10px]">
                    {TYPE_LABELS[notif.type] ?? notif.type}
                  </Badge>
                  {!notif.is_read && <span className="bg-primary h-2 w-2 rounded-full" />}
                </div>
                {notif.body && (
                  <p className="text-muted-foreground mt-1 text-sm">{notif.body}</p>
                )}
                <span className="text-muted-foreground mt-1 block text-xs">
                  {new Date(notif.created_at).toLocaleString()}
                </span>
              </div>
              {!notif.is_read && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => markAsRead(notif.id)}
                  aria-label="Mark as read"
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page <= 1}
            onClick={() => setMeta((m) => ({ ...m, page: m.page - 1 }))}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {meta.page} of {meta.total_pages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={meta.page >= meta.total_pages}
            onClick={() => setMeta((m) => ({ ...m, page: m.page + 1 }))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
