'use client';

import { useCallback, useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DesignerCard } from '@/components/designers/designer-card';
import { DesignerSearchFilters } from '@/components/designers/designer-search-filters';
import type { Database } from '@/lib/database.types';

type DesignerProfileRow = Database['public']['Tables']['designer_profiles']['Row'];

/**
 * Designer browse/search page with filters, search, and pagination.
 */
export default function DesignersPage() {
  const [designers, setDesigners] = useState<DesignerProfileRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Filters
  const [query, setQuery] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [software, setSoftware] = useState('');
  const [sortBy, setSortBy] = useState('avg_rating');

  const fetchDesigners = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (specialization) params.set('specialization', specialization);
      if (software) params.set('software', software);
      params.set('sort_by', sortBy);
      params.set('page', String(page));

      const res = await fetch(`/api/v1/designers?${params.toString()}`);
      const json = (await res.json().catch(() => null)) as {
        data?: DesignerProfileRow[];
        meta?: { total_pages: number };
        message?: string;
      } | null;

      if (!res.ok) {
        throw new Error(
          json?.message ?? 'The designer directory is temporarily unavailable.',
        );
      }

      if (!json?.data || !json.meta) {
        throw new Error('Received an invalid designer directory response.');
      }

      setDesigners(json.data);
      setTotalPages(json.meta.total_pages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setIsLoading(false);
    }
  }, [query, specialization, software, sortBy, page]);

  useEffect(() => {
    fetchDesigners();
  }, [fetchDesigners]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Find Designers</h1>
        <p className="text-muted-foreground">
          Browse and search dental design professionals
        </p>
      </div>

      <DesignerSearchFilters
        query={query}
        specialization={specialization}
        software={software}
        sortBy={sortBy}
        onQueryChange={setQuery}
        onSpecializationChange={setSpecialization}
        onSoftwareChange={setSoftware}
        onSortByChange={setSortBy}
      />

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && designers.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
          <p className="text-muted-foreground">
            No designers found matching your criteria
          </p>
        </div>
      )}

      {/* Designer grid */}
      {!isLoading && designers.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {designers.map((d) => (
            <DesignerCard key={d.id} designer={d} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-muted-foreground text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
