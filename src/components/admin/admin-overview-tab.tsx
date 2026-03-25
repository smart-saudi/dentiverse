'use client';

import { useCallback, useEffect, useState } from 'react';
import { ShieldAlert, Wallet, Users, Workflow } from 'lucide-react';

import type { AdminDashboardSummary } from '@/types/admin';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const overviewCards = [
  {
    key: 'total_users',
    label: 'Users',
    icon: Users,
  },
  {
    key: 'active_cases',
    label: 'Active Cases',
    icon: Workflow,
  },
  {
    key: 'disputed_cases',
    label: 'Disputed Cases',
    icon: ShieldAlert,
  },
  {
    key: 'held_payment_value',
    label: 'Held Value',
    icon: Wallet,
  },
] as const;

/**
 * Overview tab for the admin workspace.
 *
 * @returns Operational summary cards and recent audit activity
 */
export function AdminOverviewTab() {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/admin/dashboard');
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message ?? 'Failed to load admin dashboard');
      }

      setSummary(json.data);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Failed to load admin data',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  return (
    <div className="space-y-6">
      {error && (
        <div
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(isLoading ? overviewCards : overviewCards).map(({ key, label, icon: Icon }) => (
          <Card key={key}>
            <CardContent className="flex items-start justify-between gap-4 p-6">
              <div className="space-y-2">
                <p className="text-muted-foreground text-sm">{label}</p>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <p className="text-3xl font-semibold">
                    {key === 'held_payment_value'
                      ? `$${summary?.held_payment_value ?? 0}`
                      : (summary?.[key] ?? 0)}
                  </p>
                )}
              </div>
              <div className="bg-brand-50 text-brand-700 rounded-full p-3">
                <Icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Operational risk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {isLoading ? (
              <>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-6 w-44" />
              </>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Suspended users</span>
                  <Badge variant="outline">{summary?.suspended_users ?? 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Held payments</span>
                  <Badge variant="secondary">{summary?.held_payments ?? 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Disputed payments</span>
                  <Badge variant="destructive">{summary?.disputed_payments ?? 0}</Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent audit activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading && (
              <>
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </>
            )}

            {!isLoading && summary && summary.recent_audit_entries.length === 0 && (
              <p className="text-muted-foreground text-sm">
                No recent admin audit activity.
              </p>
            )}

            {!isLoading &&
              summary?.recent_audit_entries.map((entry) => (
                <div
                  key={entry.id}
                  className="border-border flex items-start justify-between gap-4 rounded-lg border p-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{entry.action}</p>
                    <p className="text-muted-foreground text-xs">
                      {entry.entity_type} · {entry.entity_id}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {entry.actor
                        ? `${entry.actor.full_name} (${entry.actor.email})`
                        : 'System'}
                    </p>
                  </div>
                  <span className="text-muted-foreground shrink-0 text-xs">
                    {new Date(entry.created_at).toLocaleString()}
                  </span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
