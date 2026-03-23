'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { CaseCard } from '@/components/cases/case-card';
import type { Database } from '@/lib/database.types';

type CaseRow = Database['public']['Tables']['cases']['Row'];

/**
 * Case list page with status and type filters.
 */
export default function CasesPage() {
  const [cases, setCases] = useState<CaseRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [meta, setMeta] = useState({ page: 1, per_page: 20, total: 0, total_pages: 0 });

  const fetchCases = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(meta.page));

      const res = await fetch(`/api/v1/cases?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load cases');

      const json = await res.json();
      setCases(json.data);
      setMeta(json.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, meta.page]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const statuses = ['', 'DRAFT', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'CANCELLED'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cases</h1>
          <p className="text-muted-foreground">
            Manage your dental design cases
          </p>
        </div>
        <Link href="/cases/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {statuses.map((status) => (
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

      {/* Case list */}
      {!isLoading && !error && cases.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="mb-4 text-muted-foreground">No cases found</p>
          <Link href="/cases/new">
            <Button variant="outline">Create your first case</Button>
          </Link>
        </div>
      )}

      {!isLoading && cases.length > 0 && (
        <div className="space-y-4">
          {cases.map((c) => (
            <CaseCard key={c.id} caseData={c} />
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
