'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/use-notifications';

/**
 * Bell icon with unread badge + dropdown showing recent notifications.
 */
export function NotificationBell() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <div className="flex items-center justify-between">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs" onClick={markAllAsRead}>
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />

        {isLoading && (
          <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="p-4 text-center text-sm text-muted-foreground">No notifications</div>
        )}

        {notifications.slice(0, 8).map((notif) => (
          <DropdownMenuItem
            key={notif.id}
            className={cn('flex flex-col items-start gap-1 cursor-pointer', !notif.is_read && 'bg-primary/5')}
            onClick={() => { if (!notif.is_read) markAsRead(notif.id); }}
          >
            <div className="flex items-center gap-2">
              {!notif.is_read && <span className="h-2 w-2 rounded-full bg-primary" />}
              <span className="text-sm font-medium">{notif.title}</span>
            </div>
            {notif.body && (
              <p className="text-xs text-muted-foreground line-clamp-2">{notif.body}</p>
            )}
            <span className="text-[10px] text-muted-foreground">
              {new Date(notif.created_at).toLocaleString()}
            </span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="w-full justify-center text-xs">
            View all notifications
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
