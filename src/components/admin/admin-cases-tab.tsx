'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertTriangle, RotateCcw, ShieldAlert, XCircle } from 'lucide-react';

import type { AdminCaseListItem, PaginatedAdminResult } from '@/types/admin';
import { AdminActionDialog } from '@/components/admin/admin-action-dialog';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { CaseStatusBadge } from '@/components/cases/case-status-badge';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

type CaseTargetStatus = 'DISPUTED' | 'REVIEW' | 'REVISION' | 'CANCELLED';

const statusOptions = [
  '',
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'REVIEW',
  'REVISION',
  'APPROVED',
  'COMPLETED',
  'CANCELLED',
  'DISPUTED',
] as const;

/**
 * Cases tab for the admin workspace.
 *
 * @returns Case-support table with dispute and recovery controls
 */
export function AdminCasesTab() {
  const [cases, setCases] = useState<AdminCaseListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCase, setSelectedCase] = useState<AdminCaseListItem | null>(null);
  const [selectedTargetStatus, setSelectedTargetStatus] =
    useState<CaseTargetStatus>('DISPUTED');

  const loadCases = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
      });

      if (query.trim()) {
        params.set('q', query.trim());
      }

      if (statusFilter) {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/v1/admin/cases?${params.toString()}`);
      const json = (await response.json()) as PaginatedAdminResult<AdminCaseListItem> & {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(json.message ?? 'Failed to load cases');
      }

      setCases(json.data);
      setTotalPages(json.meta.total_pages);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Failed to load cases');
    } finally {
      setIsLoading(false);
    }
  }, [page, query, statusFilter]);

  useEffect(() => {
    loadCases();
  }, [loadCases]);

  function openActionDialog(caseRow: AdminCaseListItem, targetStatus: CaseTargetStatus) {
    setSelectedCase(caseRow);
    setSelectedTargetStatus(targetStatus);
    setDialogError(null);
  }

  async function handleConfirmAction(payload: {
    ticket_reference: string;
    reason: string;
  }) {
    if (!selectedCase) {
      return;
    }

    setIsSubmitting(true);
    setDialogError(null);

    try {
      const response = await fetch(`/api/v1/admin/cases/${selectedCase.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_status: selectedTargetStatus,
          ...payload,
        }),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message ?? 'Failed to update the case');
      }

      setSelectedCase(null);
      await loadCases();
    } catch (submitError) {
      setDialogError(
        submitError instanceof Error ? submitError.message : 'Failed to update the case',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const actionLabelMap: Record<CaseTargetStatus, string> = {
    DISPUTED: 'Mark disputed',
    REVIEW: 'Return to review',
    REVISION: 'Send to revision',
    CANCELLED: 'Cancel case',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Case controls</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="admin-case-search" className="text-sm font-medium">
              Search by title
            </label>
            <Input
              id="admin-case-search"
              value={query}
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="admin-case-status" className="text-sm font-medium">
              Status
            </label>
            <select
              id="admin-case-status"
              value={statusFilter}
              onChange={(event) => {
                setPage(1);
                setStatusFilter(event.target.value as (typeof statusOptions)[number]);
              }}
              className="border-input focus-visible:ring-ring h-9 w-full rounded-md border bg-transparent px-3 text-sm focus-visible:ring-1 focus-visible:outline-none"
            >
              <option value="">All statuses</option>
              {statusOptions
                .filter((value) => value)
                .map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
            </select>
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
          ) : cases.length === 0 ? (
            <div className="text-muted-foreground p-6 text-sm">No cases found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Designer</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cases.map((caseRow) => (
                  <TableRow key={caseRow.id}>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{caseRow.title}</p>
                        <p className="text-muted-foreground text-xs">
                          {caseRow.case_type}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <CaseStatusBadge status={caseRow.status} />
                        <p className="text-muted-foreground text-xs">
                          {caseRow.revision_count} revision
                          {caseRow.revision_count === 1 ? '' : 's'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {caseRow.client ? (
                        <div className="space-y-1">
                          <p className="font-medium">{caseRow.client.full_name}</p>
                          <p className="text-muted-foreground text-xs">
                            {caseRow.client.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {caseRow.designer ? (
                        <div className="space-y-1">
                          <p className="font-medium">{caseRow.designer.full_name}</p>
                          <p className="text-muted-foreground text-xs">
                            {caseRow.designer.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Unassigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {caseRow.payment_status ? (
                        <Badge
                          variant={
                            caseRow.payment_status === 'DISPUTED'
                              ? 'destructive'
                              : 'outline'
                          }
                        >
                          {caseRow.payment_status}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">No payment</span>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {caseRow.deadline
                        ? new Date(caseRow.deadline).toLocaleDateString()
                        : 'No deadline'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionDialog(caseRow, 'DISPUTED')}
                        >
                          <AlertTriangle className="mr-2 h-4 w-4" />
                          Dispute
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionDialog(caseRow, 'REVIEW')}
                        >
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          Review
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionDialog(caseRow, 'REVISION')}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" />
                          Revision
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => openActionDialog(caseRow, 'CANCELLED')}
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AdminPagination page={page} totalPages={totalPages} onPageChange={setPage} />

      <AdminActionDialog
        open={selectedCase !== null}
        title={
          selectedCase ? `${actionLabelMap[selectedTargetStatus]} case` : 'Update case'
        }
        description="Every admin case action is audit-logged and should reference a support or finance ticket."
        confirmLabel={actionLabelMap[selectedTargetStatus]}
        isSubmitting={isSubmitting}
        error={dialogError}
        onConfirm={handleConfirmAction}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCase(null);
          }
        }}
      />
    </div>
  );
}
