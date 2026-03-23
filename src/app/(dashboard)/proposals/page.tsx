'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ProposalCard } from '@/components/proposals/proposal-card';
import type { Database } from '@/lib/database.types';

type ProposalRow = Database['public']['Tables']['proposals']['Row'];

const STATUSES = ['', 'PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'] as const;

/**
 * My Proposals page — shows all proposals submitted by the current designer.
 */
export default function MyProposalsPage() {
  const [proposals, setProposals] = useState<ProposalRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [meta, setMeta] = useState({ page: 1, per_page: 20, total: 0, total_pages: 0 });

  const fetchProposals = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(meta.page));

      const res = await fetch(`/api/v1/proposals/me?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load proposals');

      const json = await res.json();
      setProposals(json.data);
      setMeta(json.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, meta.page]);

  useEffect(() => {
    fetchProposals();
  }, [fetchProposals]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Proposals</h1>
        <p className="text-muted-foreground">
          Track your proposals and their status
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
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && proposals.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="mb-4 text-muted-foreground">No proposals found</p>
          <Link href="/designers">
            <Button variant="outline">Browse cases</Button>
          </Link>
        </div>
      )}

      {/* Proposal list */}
      {!isLoading && proposals.length > 0 && (
        <div className="space-y-4">
          {proposals.map((p) => (
            <Link key={p.id} href={`/cases/${p.case_id}`}>
              <ProposalCard proposal={p} />
            </Link>
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
