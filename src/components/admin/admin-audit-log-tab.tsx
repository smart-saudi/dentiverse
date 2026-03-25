'use client';

import { useCallback, useEffect, useState } from 'react';

import type { AdminAuditLogItem, PaginatedAdminResult } from '@/types/admin';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface AuditMetadataPreviewProps {
  label: string;
  value: unknown;
}

/**
 * Compact JSON preview used inside audit-log rows.
 *
 * @param props - Component props
 * @param props.label - Label for the preview block
 * @param props.value - Arbitrary JSON-compatible value
 * @returns A collapsible metadata preview
 */
function AuditMetadataPreview({ label, value }: AuditMetadataPreviewProps) {
  if (value === null || value === undefined) {
    return null;
  }

  return (
    <details className="rounded-md border px-3 py-2">
      <summary className="cursor-pointer text-xs font-medium">{label}</summary>
      <pre className="text-muted-foreground mt-2 overflow-x-auto text-[11px] whitespace-pre-wrap">
        {JSON.stringify(value, null, 2)}
      </pre>
    </details>
  );
}

/**
 * Format an audit-log IP field for safe display.
 *
 * @param value - Stored audit-log IP value
 * @returns Human-readable IP string
 */
function formatAuditIpAddress(value: unknown): string {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value;
  }

  return 'Unknown';
}

/**
 * Audit-log tab for the admin workspace.
 *
 * @returns Audit-log table with filters and metadata previews
 */
export function AdminAuditLogTab() {
  const [entries, setEntries] = useState<AdminAuditLogItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [entityTypeFilter, setEntityTypeFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAuditLog = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
      });

      if (query.trim()) {
        params.set('q', query.trim());
      }

      if (actionFilter.trim()) {
        params.set('action', actionFilter.trim());
      }

      if (entityTypeFilter.trim()) {
        params.set('entity_type', entityTypeFilter.trim());
      }

      const response = await fetch(`/api/v1/admin/audit-log?${params.toString()}`);
      const json = (await response.json()) as PaginatedAdminResult<AdminAuditLogItem> & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(json.message ?? 'Failed to load audit activity');
      }

      setEntries(json.data);
      setTotalPages(json.meta.total_pages);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Failed to load audit activity',
      );
    } finally {
      setIsLoading(false);
    }
  }, [actionFilter, entityTypeFilter, page, query]);

  useEffect(() => {
    loadAuditLog();
  }, [loadAuditLog]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit log</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label htmlFor="admin-audit-search" className="text-sm font-medium">
              Search
            </label>
            <Input
              id="admin-audit-search"
              value={query}
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
              placeholder="Action or entity ID"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-audit-action" className="text-sm font-medium">
              Action
            </label>
            <Input
              id="admin-audit-action"
              value={actionFilter}
              onChange={(event) => {
                setPage(1);
                setActionFilter(event.target.value);
              }}
              placeholder="admin.payment.refunded"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-audit-entity" className="text-sm font-medium">
              Entity type
            </label>
            <Input
              id="admin-audit-entity"
              value={entityTypeFilter}
              onChange={(event) => {
                setPage(1);
                setEntityTypeFilter(event.target.value);
              }}
              placeholder="payment"
            />
          </div>
        </CardContent>
      </Card>

      {error && (
        <div
          role="alert"
          className="bg-destructive/10 text-destructive rounded-md px-4 py-3 text-sm"
        >
          {error}
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-muted-foreground p-6 text-sm">
              No audit entries match the current filters.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Actor</TableHead>
                  <TableHead>Context</TableHead>
                  <TableHead>Logged At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{entry.action}</p>
                        <p className="text-muted-foreground text-xs">{entry.id}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Badge variant="outline">{entry.entity_type}</Badge>
                        <p className="text-muted-foreground text-xs">{entry.entity_id}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {entry.actor ? (
                        <div className="space-y-1">
                          <p className="font-medium">{entry.actor.full_name}</p>
                          <p className="text-muted-foreground text-xs">
                            {entry.actor.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">System</span>
                      )}
                    </TableCell>
                    <TableCell className="space-y-2">
                      <div className="space-y-1 text-xs">
                        <p className="text-muted-foreground">
                          Ticket:{' '}
                          {typeof entry.new_data === 'object' &&
                          entry.new_data !== null &&
                          'ticket_reference' in entry.new_data &&
                          typeof entry.new_data.ticket_reference === 'string'
                            ? entry.new_data.ticket_reference
                            : 'N/A'}
                        </p>
                        <p className="text-muted-foreground">
                          IP: {formatAuditIpAddress(entry.ip_address)}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <AuditMetadataPreview label="New data" value={entry.new_data} />
                        <AuditMetadataPreview label="Old data" value={entry.old_data} />
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {new Date(entry.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
