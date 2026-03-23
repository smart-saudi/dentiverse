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
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="bg-destructive text-destructive-foreground absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
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
          <div className="text-muted-foreground p-4 text-center text-sm">Loading...</div>
        )}

        {!isLoading && notifications.length === 0 && (
          <div className="text-muted-foreground p-4 text-center text-sm">
            No notifications
          </div>
        )}

        {notifications.slice(0, 8).map((notif) => (
          <DropdownMenuItem
            key={notif.id}
            className={cn(
              'flex cursor-pointer flex-col items-start gap-1',
              !notif.is_read && 'bg-primary/5',
            )}
            onClick={() => {
              if (!notif.is_read) markAsRead(notif.id);
            }}
          >
            <div className="flex items-center gap-2">
              {!notif.is_read && <span className="bg-primary h-2 w-2 rounded-full" />}
              <span className="text-sm font-medium">{notif.title}</span>
            </div>
            {notif.body && (
              <p className="text-muted-foreground line-clamp-2 text-xs">{notif.body}</p>
            )}
            <span className="text-muted-foreground text-[10px]">
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
