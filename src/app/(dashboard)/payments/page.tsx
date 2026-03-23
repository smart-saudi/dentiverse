'use client';

import { useCallback, useEffect, useState } from 'react';
import { DollarSign, ArrowUpRight, Clock, RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Database } from '@/lib/database.types';

type PaymentRow = Database['public']['Tables']['payments']['Row'];

const STATUS_CONFIG: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; icon: typeof Clock }> = {
  PENDING: { variant: 'outline', label: 'Pending', icon: Clock },
  HELD: { variant: 'secondary', label: 'In Escrow', icon: DollarSign },
  RELEASED: { variant: 'default', label: 'Released', icon: ArrowUpRight },
  REFUNDED: { variant: 'destructive', label: 'Refunded', icon: RefreshCw },
};

const STATUSES = ['', 'PENDING', 'HELD', 'RELEASED', 'REFUNDED'] as const;

/**
 * Payment history page showing all payments for the current user.
 */
export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [meta, setMeta] = useState({ page: 1, per_page: 20, total: 0, total_pages: 0 });

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(meta.page));

      const res = await fetch(`/api/v1/payments?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load payments');

      const json = await res.json();
      setPayments(json.data);
      setMeta(json.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, meta.page]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="text-muted-foreground">
          View your payment history and escrow status
        </p>
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {STATUSES.map((status) => (
          <Button
            key={status || 'all'}
            variant={statusFilter === status ? 'default' : 'outline'}
            size="sm"
            onClick={() => setStatusFilter(status)}
          >
            {status || 'All'}
          </Button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && payments.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <DollarSign className="mb-2 h-8 w-8 text-muted-foreground" />
          <p className="text-muted-foreground">No payments found</p>
        </div>
      )}

      {/* Payment list */}
      {!isLoading && payments.length > 0 && (
        <div className="space-y-3">
          {payments.map((payment) => {
            const config = STATUS_CONFIG[payment.status] ?? { variant: 'outline' as const, label: 'Pending', icon: Clock };
            const StatusIcon = config.icon;

            return (
              <Card key={payment.id}>
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    <StatusIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${payment.amount}</span>
                      <Badge variant={config.variant}>{config.label}</Badge>
                    </div>
                    <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                      <span>Fee: ${payment.platform_fee}</span>
                      <span>Payout: ${payment.designer_payout}</span>
                      <span>{payment.currency}</span>
                      <span>{new Date(payment.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {payment.held_at && <div>Held: {new Date(payment.held_at).toLocaleDateString()}</div>}
                    {payment.released_at && <div>Released: {new Date(payment.released_at).toLocaleDateString()}</div>}
                    {payment.refunded_at && <div>Refunded: {new Date(payment.refunded_at).toLocaleDateString()}</div>}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
          <span className="text-sm text-muted-foreground">
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
