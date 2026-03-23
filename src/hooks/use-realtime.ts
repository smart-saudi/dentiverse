'use client';

import { useEffect, useRef } from 'react';

import { createClient } from '@/lib/supabase/client';

interface UseRealtimeOptions {
  table: string;
  filter?: string;
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  onEvent: (payload: {
    new: Record<string, unknown>;
    old: Record<string, unknown>;
    eventType: string;
  }) => void;
}

/**
 * Hook to subscribe to Supabase Realtime changes on a table.
 *
 * @param options - Table, filter, event type, and callback
 */
export function useRealtime({ table, filter, event = '*', onEvent }: UseRealtimeOptions) {
  const callbackRef = useRef(onEvent);
  callbackRef.current = onEvent;

  useEffect(() => {
    const supabase = createClient();
    const channelName = `realtime-${table}-${filter ?? 'all'}`;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const channel = (supabase.channel(channelName) as any)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
          ...(filter ? { filter } : {}),
        },
        (payload: {
          new: Record<string, unknown>;
          old: Record<string, unknown>;
          eventType: string;
        }) => {
          callbackRef.current({
            new: payload.new,
            old: payload.old,
            eventType: payload.eventType,
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, event]);
}
