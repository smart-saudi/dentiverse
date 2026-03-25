'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowUpRight, ShieldAlert, Undo2 } from 'lucide-react';

import type { AdminPaymentListItem, PaginatedAdminResult } from '@/types/admin';
import { AdminActionDialog } from '@/components/admin/admin-action-dialog';
import { AdminPagination } from '@/components/admin/admin-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

type PaymentActionType = 'MARK_DISPUTED' | 'RELEASE' | 'REFUND';

const statusOptions = [
  '',
  'PENDING',
  'HELD',
  'RELEASED',
  'REFUNDED',
  'DISPUTED',
] as const;

/**
 * Payments tab for the admin workspace.
 *
 * @returns Payment-support table with manual release, dispute, and refund controls
 */
export function AdminPaymentsTab() {
  const [payments, setPayments] = useState<AdminPaymentListItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AdminPaymentListItem | null>(
    null,
  );
  const [selectedAction, setSelectedAction] =
    useState<PaymentActionType>('MARK_DISPUTED');

  const loadPayments = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: String(page),
      });

      if (statusFilter) {
        params.set('status', statusFilter);
      }

      const response = await fetch(`/api/v1/admin/payments?${params.toString()}`);
      const json =
        (await response.json()) as PaginatedAdminResult<AdminPaymentListItem> & {
          message?: string;
        };

      if (!response.ok) {
        throw new Error(json.message ?? 'Failed to load payments');
      }

      setPayments(json.data);
      setTotalPages(json.meta.total_pages);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Failed to load payments',
      );
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  function openActionDialog(payment: AdminPaymentListItem, action: PaymentActionType) {
    setSelectedPayment(payment);
    setSelectedAction(action);
    setDialogError(null);
  }

  async function handleConfirmAction(payload: {
    ticket_reference: string;
    reason: string;
  }) {
    if (!selectedPayment) {
      return;
    }

    setIsSubmitting(true);
    setDialogError(null);

    try {
      const response = await fetch(`/api/v1/admin/payments/${selectedPayment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: selectedAction,
          ...payload,
        }),
      });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.message ?? 'Failed to update the payment');
      }

      setSelectedPayment(null);
      await loadPayments();
    } catch (submitError) {
      setDialogError(
        submitError instanceof Error
          ? submitError.message
          : 'Failed to update the payment',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const actionLabelMap: Record<PaymentActionType, string> = {
    MARK_DISPUTED: 'Mark disputed',
    RELEASE: 'Release payment',
    REFUND: 'Issue refund',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <label htmlFor="admin-payment-status" className="text-sm font-medium">
            Status
          </label>
          <select
            id="admin-payment-status"
            value={statusFilter}
            onChange={(event) => {
              setPage(1);
              setStatusFilter(event.target.value as (typeof statusOptions)[number]);
            }}
            className="border-input focus-visible:ring-ring h-9 w-full rounded-md border bg-transparent px-3 text-sm focus-visible:ring-1 focus-visible:outline-none md:max-w-xs"
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
          ) : payments.length === 0 ? (
            <div className="text-muted-foreground p-6 text-sm">No payments found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Designer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Stripe</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {payment.case ? (
                        <div className="space-y-1">
                          <p className="font-medium">{payment.case.title}</p>
                          <p className="text-muted-foreground text-xs">
                            {payment.case.status}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">
                          Unknown case
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          payment.status === 'DISPUTED'
                            ? 'destructive'
                            : payment.status === 'RELEASED'
                              ? 'success'
                              : payment.status === 'HELD'
                                ? 'secondary'
                                : 'outline'
                        }
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.client ? (
                        <div className="space-y-1">
                          <p className="font-medium">{payment.client.full_name}</p>
                          <p className="text-muted-foreground text-xs">
                            {payment.client.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {payment.designer ? (
                        <div className="space-y-1">
                          <p className="font-medium">{payment.designer.full_name}</p>
                          <p className="text-muted-foreground text-xs">
                            {payment.designer.email}
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground text-xs">Unknown</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">${payment.amount}</p>
                        <p className="text-muted-foreground text-xs">
                          Fee ${payment.platform_fee} · Payout ${payment.designer_payout}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {payment.stripe_payment_intent_id ?? 'No intent'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openActionDialog(payment, 'MARK_DISPUTED')}
                        >
                          <ShieldAlert className="mr-2 h-4 w-4" />
                          Dispute
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={payment.status !== 'HELD'}
                          onClick={() => openActionDialog(payment, 'RELEASE')}
                        >
                          <ArrowUpRight className="mr-2 h-4 w-4" />
                          Release
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={
                            payment.status === 'REFUNDED' ||
                            !payment.stripe_payment_intent_id
                          }
                          onClick={() => openActionDialog(payment, 'REFUND')}
                        >
                          <Undo2 className="mr-2 h-4 w-4" />
                          Refund
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
        open={selectedPayment !== null}
        title={
          selectedPayment ? `${actionLabelMap[selectedAction]} payment` : 'Update payment'
        }
        description="Payment support actions are sensitive and must always reference a support or finance ticket."
        confirmLabel={actionLabelMap[selectedAction]}
        isSubmitting={isSubmitting}
        error={dialogError}
        onConfirm={handleConfirmAction}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedPayment(null);
          }
        }}
      />
    </div>
  );
}
