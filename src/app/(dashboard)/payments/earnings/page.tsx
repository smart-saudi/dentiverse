'use client';

import { useCallback, useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Wallet, Clock } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import type { Database } from '@/lib/database.types';

type PaymentRow = Database['public']['Tables']['payments']['Row'];

interface EarningsSummary {
  totalEarnings: number;
  pendingPayouts: number;
  releasedPayouts: number;
  totalCases: number;
}

/**
 * Designer earnings & payout dashboard.
 * Shows earnings summary and payout history for the current designer.
 */
export default function EarningsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<EarningsSummary>({
    totalEarnings: 0,
    pendingPayouts: 0,
    releasedPayouts: 0,
    totalCases: 0,
  });

  const fetchEarnings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/payments?per_page=100');
      if (!res.ok) throw new Error('Failed to load earnings');

      const json = await res.json();
      const data: PaymentRow[] = json.data;
      setPayments(data);

      const totals = data.reduce(
        (acc, p) => {
          acc.totalCases++;
          acc.totalEarnings += Number(p.designer_payout);
          if (p.status === 'HELD') acc.pendingPayouts += Number(p.designer_payout);
          if (p.status === 'RELEASED') acc.releasedPayouts += Number(p.designer_payout);
          return acc;
        },
        { totalEarnings: 0, pendingPayouts: 0, releasedPayouts: 0, totalCases: 0 },
      );
      setSummary(totals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEarnings();
  }, [fetchEarnings]);

  const statCards = [
    { title: 'Total Earnings', value: summary.totalEarnings, icon: TrendingUp, color: 'text-green-600' },
    { title: 'Pending Payouts', value: summary.pendingPayouts, icon: Clock, color: 'text-yellow-600' },
    { title: 'Released Payouts', value: summary.releasedPayouts, icon: Wallet, color: 'text-blue-600' },
    { title: 'Total Cases', value: summary.totalCases, icon: DollarSign, color: 'text-muted-foreground', isCurrency: false },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Earnings & Payouts</h1>
        <p className="text-muted-foreground">
          Track your designer earnings, pending payouts, and payment history
        </p>
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Summary cards */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="text-sm font-medium">{stat.title}</CardDescription>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stat.isCurrency === false ? stat.value : `$${stat.value.toFixed(2)}`}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Payout history */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>Your recent designer payouts</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          )}

          {!isLoading && payments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8">
              <Wallet className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No earnings yet</p>
            </div>
          )}

          {!isLoading && payments.length > 0 && (
            <div className="space-y-3">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">${payment.designer_payout}</span>
                      <Badge
                        variant={
                          payment.status === 'RELEASED'
                            ? 'default'
                            : payment.status === 'HELD'
                              ? 'secondary'
                              : payment.status === 'REFUNDED'
                                ? 'destructive'
                                : 'outline'
                        }
                      >
                        {payment.status === 'HELD' ? 'In Escrow' : payment.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Case total: ${payment.amount} · Platform fee: ${payment.platform_fee}
                    </div>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    <div>{new Date(payment.created_at).toLocaleDateString()}</div>
                    {payment.released_at && (
                      <div className="text-green-600">
                        Paid {new Date(payment.released_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
