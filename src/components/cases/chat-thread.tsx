'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useMessages } from '@/hooks/use-messages';

interface ChatThreadProps {
  caseId: string;
  currentUserId: string;
}

/**
 * Real-time chat thread for a case.
 * Messages are displayed oldest-first with auto-scroll to bottom.
 *
 * @param props - Case ID and current user ID
 */
export function ChatThread({ caseId, currentUserId }: ChatThreadProps) {
  const { messages, isLoading, error, sendMessage } = useMessages({ caseId });
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await sendMessage(trimmed);
      setInput('');
    } catch {
      // Error handled by hook
    } finally {
      setIsSending(false);
    }
  }, [input, isSending, sendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  if (error) {
    return (
      <div role="alert" className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border">
      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex flex-col gap-2 overflow-y-auto p-4"
        style={{ maxHeight: '400px', minHeight: '200px' }}
      >
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-3/4" />
            ))}
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isOwn = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={cn('flex', isOwn ? 'justify-end' : 'justify-start')}
            >
              <div
                className={cn(
                  'max-w-[70%] rounded-lg px-3 py-2 text-sm',
                  isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted',
                  msg.is_system && 'bg-yellow-50 text-yellow-800 italic',
                )}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <span className={cn(
                  'mt-1 block text-[10px]',
                  isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground',
                )}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input area */}
      <div className="flex gap-2 border-t p-3">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          disabled={isSending}
          aria-label="Message input"
        />
        <Button
          size="icon"
          onClick={handleSend}
          disabled={!input.trim() || isSending}
          aria-label="Send message"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
