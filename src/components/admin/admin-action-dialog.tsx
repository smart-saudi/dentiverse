'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export interface AdminActionDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  isSubmitting: boolean;
  error: string | null;
  initialReason?: string;
  onConfirm: (payload: { ticket_reference: string; reason: string }) => Promise<void>;
  onOpenChange: (open: boolean) => void;
}

/**
 * Shared confirmation dialog for audited admin actions.
 *
 * @param props - Component props
 * @returns Dialog with ticket and reason fields
 */
export function AdminActionDialog({
  open,
  title,
  description,
  confirmLabel,
  isSubmitting,
  error,
  initialReason,
  onConfirm,
  onOpenChange,
}: AdminActionDialogProps) {
  const [ticketReference, setTicketReference] = useState('');
  const [reason, setReason] = useState(initialReason ?? '');

  useEffect(() => {
    if (open) {
      setTicketReference('');
      setReason(initialReason ?? '');
    }
  }, [initialReason, open]);

  async function handleConfirm() {
    await onConfirm({
      ticket_reference: ticketReference.trim(),
      reason: reason.trim(),
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <div
              role="alert"
              className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm"
            >
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="admin-ticket-reference" className="text-sm font-medium">
              Ticket reference
            </label>
            <Input
              id="admin-ticket-reference"
              value={ticketReference}
              onChange={(event) => setTicketReference(event.target.value)}
              disabled={isSubmitting}
              autoComplete="off"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="admin-action-reason" className="text-sm font-medium">
              Reason
            </label>
            <textarea
              id="admin-action-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              disabled={isSubmitting}
              className="border-input focus-visible:ring-ring min-h-28 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={
              isSubmitting ||
              ticketReference.trim().length < 3 ||
              reason.trim().length < 12
            }
          >
            {isSubmitting ? 'Saving...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
