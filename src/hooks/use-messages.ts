'use client';

import { useCallback, useEffect, useState } from 'react';

import type { Database } from '@/lib/database.types';
import { useRealtime } from './use-realtime';

type MessageRow = Database['public']['Tables']['messages']['Row'];

interface UseMessagesOptions {
  caseId: string;
}

/**
 * Hook to manage case messages with realtime updates.
 *
 * @param options - Case ID to subscribe to
 * @returns Messages, loading state, error, and send function
 */
export function useMessages({ caseId }: UseMessagesOptions) {
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/v1/cases/${caseId}/messages?per_page=100`);
      if (!res.ok) throw new Error('Failed to load messages');
      const json = await res.json();
      // Reverse so oldest first for chat display
      setMessages((json.data as MessageRow[]).reverse());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [caseId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Subscribe to new messages via Realtime
  useRealtime({
    table: 'messages',
    filter: `case_id=eq.${caseId}`,
    event: 'INSERT',
    onEvent: (payload) => {
      const newMsg = payload.new as unknown as MessageRow;
      setMessages((prev) => [...prev, newMsg]);
    },
  });

  const sendMessage = useCallback(
    async (content: string, attachmentUrls: string[] = []) => {
      const res = await fetch(`/api/v1/cases/${caseId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, attachment_urls: attachmentUrls }),
      });
      if (!res.ok) throw new Error('Failed to send message');
      return res.json();
    },
    [caseId],
  );

  return { messages, isLoading, error, sendMessage, refetch: fetchMessages };
}
