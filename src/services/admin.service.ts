import type Stripe from 'stripe';

import type { Database } from '@/lib/database.types';
import {
  AdminPaymentAction,
  type AdminAuditLogQuery,
  type AdminCaseActionInput,
  type AdminCaseListQuery,
  type AdminPaymentActionInput,
  type AdminPaymentListQuery,
  type AdminUserListQuery,
} from '@/lib/validations/admin';
import type { AppSupabaseClient } from '@/lib/supabase/types';
import { ConflictError, ForbiddenError, NotFoundError } from '@/lib/errors';
import type {
  AdminAuditLogItem,
  AdminCaseListItem,
  AdminDashboardSummary,
  AdminPaymentListItem,
  AdminUserListItem,
  AdminUserReference,
  PaginatedAdminResult,
} from '@/types/admin';
import { PaymentService } from '@/services/payment.service';

type Client = AppSupabaseClient;
type UserRow = Database['public']['Tables']['users']['Row'];
type CaseRow = Database['public']['Tables']['cases']['Row'];
type PaymentRow = Database['public']['Tables']['payments']['Row'];
type AuditLogRow = Database['public']['Tables']['audit_log']['Row'];

interface CountQueryResult {
  count: number | null;
  error: { message: string } | null;
}

/**
 * Administrative service layer for support, moderation, and finance operations.
 */
export class AdminService {
  private readonly paymentService = new PaymentService();

  /**
   * Build the high-level operational dashboard summary for admins.
   *
   * @param client - Service-role Supabase client
   * @returns Summary counts and recent audit activity
   */
  async getDashboardSummary(client: Client): Promise<AdminDashboardSummary> {
    const [
      totalUsers,
      suspendedUsers,
      activeCases,
      disputedCases,
      heldPayments,
      disputedPayments,
      heldPaymentRows,
      recentAuditEntries,
    ] = await Promise.all([
      this.countRows(() =>
        client.from('users').select('*', { count: 'exact', head: true }),
      ),
      this.countRows(() =>
        client
          .from('users')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', false),
      ),
      this.countRows(() =>
        client
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .in('status', [
            'OPEN',
            'ASSIGNED',
            'IN_PROGRESS',
            'REVIEW',
            'REVISION',
            'APPROVED',
            'DISPUTED',
          ]),
      ),
      this.countRows(() =>
        client
          .from('cases')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'DISPUTED'),
      ),
      this.countRows(() =>
        client
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'HELD'),
      ),
      this.countRows(() =>
        client
          .from('payments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'DISPUTED'),
      ),
      client.from('payments').select('amount').eq('status', 'HELD'),
      this.listAuditLog(client, { page: 1, per_page: 5 }),
    ]);

    const heldPaymentValue = (heldPaymentRows.data ?? []).reduce(
      (total, row) => total + row.amount,
      0,
    );

    return {
      total_users: totalUsers,
      suspended_users: suspendedUsers,
      active_cases: activeCases,
      disputed_cases: disputedCases,
      held_payments: heldPayments,
      disputed_payments: disputedPayments,
      held_payment_value: heldPaymentValue,
      recent_audit_entries: recentAuditEntries.data,
    };
  }

  /**
   * List users for the admin directory.
   *
   * @param client - Service-role Supabase client
   * @param query - Validated list query
   * @returns Paginated admin user list
   */
  async listUsers(
    client: Client,
    query: AdminUserListQuery,
  ): Promise<PaginatedAdminResult<AdminUserListItem>> {
    const offset = (query.page - 1) * query.per_page;
    let builder = client.from('users').select('*', { count: 'exact' });

    if (query.role) {
      builder = builder.eq('role', query.role);
    }

    if (query.is_active !== undefined) {
      builder = builder.eq('is_active', query.is_active);
    }

    if (query.q) {
      const term = this.sanitizeSearchTerm(query.q);
      builder = builder.or(`full_name.ilike.%${term}%,email.ilike.%${term}%`);
    }

    const { data, error, count } = await builder
      .order('created_at', { ascending: false })
      .range(offset, offset + query.per_page - 1);

    if (error) {
      throw new Error(error.message);
    }

    const rows = data ?? [];
    const profileMap = await this.getDesignerAvailabilityMap(
      client,
      rows.map((row) => row.id),
    );

    return {
      data: rows.map((row) => ({
        id: row.id,
        full_name: row.full_name,
        email: row.email,
        role: row.role,
        is_active: row.is_active,
        is_verified: row.is_verified,
        last_seen_at: row.last_seen_at,
        created_at: row.created_at,
        city: row.city,
        country: row.country,
        designer_available: profileMap.get(row.id) ?? null,
      })),
      meta: this.buildMeta(query.page, query.per_page, count ?? 0),
    };
  }

  /**
   * Update the active state for a user.
   *
   * @param client - Service-role Supabase client
   * @param actorUserId - Acting admin user ID
   * @param targetUserId - Target user ID
   * @param isActive - Whether the user should remain active
   * @returns Updated admin user list item
   * @throws ForbiddenError when an admin attempts to deactivate themselves
   */
  async setUserActiveState(
    client: Client,
    actorUserId: string,
    targetUserId: string,
    isActive: boolean,
  ): Promise<AdminUserListItem> {
    if (actorUserId === targetUserId && !isActive) {
      throw new ForbiddenError('Admins cannot deactivate their own account.');
    }

    const existing = await this.getUserRow(client, targetUserId);

    const { data, error } = await client
      .from('users')
      .update({
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq('id', targetUserId)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to update the user');
    }

    if (existing.role === 'DESIGNER') {
      const { error: designerProfileError } = await client
        .from('designer_profiles')
        .update({
          is_available: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', targetUserId);

      if (designerProfileError) {
        throw new Error(designerProfileError.message);
      }
    }

    return {
      id: data.id,
      full_name: data.full_name,
      email: data.email,
      role: data.role,
      is_active: data.is_active,
      is_verified: data.is_verified,
      last_seen_at: data.last_seen_at,
      created_at: data.created_at,
      city: data.city,
      country: data.country,
      designer_available: existing.role === 'DESIGNER' ? isActive : null,
    };
  }

  /**
   * List cases for admin review.
   *
   * @param client - Service-role Supabase client
   * @param query - Validated case list query
   * @returns Paginated case list with related user/payment summaries
   */
  async listCases(
    client: Client,
    query: AdminCaseListQuery,
  ): Promise<PaginatedAdminResult<AdminCaseListItem>> {
    const offset = (query.page - 1) * query.per_page;
    let builder = client.from('cases').select('*', { count: 'exact' });

    if (query.status) {
      builder = builder.eq('status', query.status);
    }

    if (query.q) {
      builder = builder.ilike('title', `%${this.sanitizeSearchTerm(query.q)}%`);
    }

    const { data, error, count } = await builder
      .order('created_at', { ascending: false })
      .range(offset, offset + query.per_page - 1);

    if (error) {
      throw new Error(error.message);
    }

    const rows = data ?? [];
    const userMap = await this.getUserReferenceMap(client, [
      ...rows.map((row) => row.client_id),
      ...rows
        .map((row) => row.designer_id)
        .filter((value): value is string => Boolean(value)),
    ]);
    const paymentStatusMap = await this.getPaymentStatusMap(
      client,
      rows.map((row) => row.id),
    );

    return {
      data: rows.map((row) => ({
        id: row.id,
        title: row.title,
        status: row.status,
        case_type: row.case_type,
        created_at: row.created_at,
        updated_at: row.updated_at,
        deadline: row.deadline,
        budget_min: row.budget_min,
        budget_max: row.budget_max,
        agreed_price: row.agreed_price,
        revision_count: row.revision_count,
        client: userMap.get(row.client_id) ?? null,
        designer: row.designer_id ? (userMap.get(row.designer_id) ?? null) : null,
        payment_status: paymentStatusMap.get(row.id) ?? null,
      })),
      meta: this.buildMeta(query.page, query.per_page, count ?? 0),
    };
  }

  /**
   * Apply an admin case support transition.
   *
   * @param client - Service-role Supabase client
   * @param caseId - Target case ID
   * @param input - Validated case action payload
   * @returns Updated case row
   */
  async updateCaseStatus(
    client: Client,
    caseId: string,
    input: AdminCaseActionInput,
  ): Promise<CaseRow> {
    const existing = await this.getCaseRow(client, caseId);
    const now = new Date().toISOString();
    const nextMetadata = this.mergeAdminSupportMetadata(existing.metadata, {
      last_ticket_reference: input.ticket_reference,
      last_reason: input.reason,
      last_updated_at: now,
    });

    const patch: Database['public']['Tables']['cases']['Update'] = {
      status: input.target_status,
      metadata: nextMetadata,
      updated_at: now,
    };

    if (input.target_status === 'REVISION') {
      patch.revision_count = (existing.revision_count ?? 0) + 1;

      await client
        .from('design_versions')
        .update({
          status: 'REVISION_REQUESTED',
          revision_feedback: input.reason,
          reviewed_at: now,
        })
        .eq('case_id', caseId)
        .eq('status', 'SUBMITTED');
    }

    if (input.target_status === 'CANCELLED') {
      patch.cancelled_at = now;
      patch.cancellation_reason = input.reason;
    }

    const { data, error } = await client
      .from('cases')
      .update(patch)
      .eq('id', caseId)
      .select('*')
      .single();

    if (error || !data) {
      throw new Error(error?.message ?? 'Failed to update the case');
    }

    if (input.target_status === 'DISPUTED' || input.target_status === 'CANCELLED') {
      const { error: paymentError } = await client
        .from('payments')
        .update({
          status: 'DISPUTED',
          updated_at: now,
        })
        .eq('case_id', caseId);

      if (paymentError) {
        throw new Error(paymentError.message);
      }
    }

    return data;
  }

  /**
   * List payments for admin review and support.
   *
   * @param client - Service-role Supabase client
   * @param query - Validated payment query
   * @returns Paginated payment list
   */
  async listPayments(
    client: Client,
    query: AdminPaymentListQuery,
  ): Promise<PaginatedAdminResult<AdminPaymentListItem>> {
    const offset = (query.page - 1) * query.per_page;
    let builder = client.from('payments').select('*', { count: 'exact' });

    if (query.status) {
      builder = builder.eq('status', query.status);
    }

    const { data, error, count } = await builder
      .order('created_at', { ascending: false })
      .range(offset, offset + query.per_page - 1);

    if (error) {
      throw new Error(error.message);
    }

    const rows = data ?? [];
    const userMap = await this.getUserReferenceMap(client, [
      ...rows.map((row) => row.client_id),
      ...rows.map((row) => row.designer_id),
    ]);
    const caseMap = await this.getCaseSummaryMap(
      client,
      rows.map((row) => row.case_id),
    );

    return {
      data: rows.map((row) => ({
        id: row.id,
        amount: row.amount,
        currency: row.currency,
        status: row.status,
        platform_fee: row.platform_fee,
        designer_payout: row.designer_payout,
        created_at: row.created_at,
        held_at: row.held_at,
        released_at: row.released_at,
        refunded_at: row.refunded_at,
        stripe_payment_intent_id: row.stripe_payment_intent_id,
        stripe_refund_id: row.stripe_refund_id,
        stripe_transfer_id: row.stripe_transfer_id,
        client: userMap.get(row.client_id) ?? null,
        designer: userMap.get(row.designer_id) ?? null,
        case: caseMap.get(row.case_id) ?? null,
      })),
      meta: this.buildMeta(query.page, query.per_page, count ?? 0),
    };
  }

  /**
   * Apply an admin payment action.
   *
   * @param client - Service-role Supabase client
   * @param stripe - Stripe client
   * @param paymentId - Target payment ID
   * @param input - Validated payment action payload
   * @returns Updated payment row
   */
  async applyPaymentAction(
    client: Client,
    stripe: Stripe,
    paymentId: string,
    input: AdminPaymentActionInput,
  ): Promise<PaymentRow> {
    const payment = await this.getPaymentRow(client, paymentId);

    if (input.action === AdminPaymentAction.MARK_DISPUTED) {
      const { data, error } = await client
        .from('payments')
        .update({
          status: 'DISPUTED',
          failure_reason: input.reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', paymentId)
        .select('*')
        .single();

      if (error || !data) {
        throw new Error(error?.message ?? 'Failed to update the payment');
      }

      return data;
    }

    if (input.action === AdminPaymentAction.REFUND) {
      if (!payment.stripe_payment_intent_id) {
        throw new ConflictError(
          'Payment cannot be refunded without a Stripe payment intent.',
        );
      }

      return this.paymentService.refundPayment(
        client,
        stripe,
        paymentId,
        payment.stripe_payment_intent_id,
      );
    }

    if (payment.status !== 'HELD') {
      throw new ConflictError('Only held payments can be released manually.');
    }

    const designer = await this.getUserRow(client, payment.designer_id);
    if (!designer.stripe_account_id) {
      throw new ConflictError('Designer is missing a connected Stripe account.');
    }

    return this.paymentService.releasePayment(
      client,
      stripe,
      paymentId,
      Math.round(payment.designer_payout * 100),
      designer.stripe_account_id,
      payment.currency,
    );
  }

  /**
   * List audit-log entries for admin review.
   *
   * @param client - Service-role Supabase client
   * @param query - Validated audit-log query
   * @returns Paginated audit-log result
   */
  async listAuditLog(
    client: Client,
    query: AdminAuditLogQuery,
  ): Promise<PaginatedAdminResult<AdminAuditLogItem>> {
    const offset = (query.page - 1) * query.per_page;
    let builder = client.from('audit_log').select('*', { count: 'exact' });

    if (query.entity_type) {
      builder = builder.eq('entity_type', query.entity_type);
    }

    if (query.action) {
      builder = builder.eq('action', query.action);
    }

    if (query.q) {
      const term = this.sanitizeSearchTerm(query.q);
      builder = builder.or(`action.ilike.%${term}%,entity_id.ilike.%${term}%`);
    }

    const { data, error, count } = await builder
      .order('created_at', { ascending: false })
      .range(offset, offset + query.per_page - 1);

    if (error) {
      throw new Error(error.message);
    }

    const rows = data ?? [];
    const userMap = await this.getUserReferenceMap(
      client,
      rows.map((row) => row.user_id).filter((value): value is string => Boolean(value)),
    );

    return {
      data: rows.map((row) => this.mapAuditRow(row, userMap)),
      meta: this.buildMeta(query.page, query.per_page, count ?? 0),
    };
  }

  private async getUserRow(client: Client, userId: string): Promise<UserRow> {
    const { data, error } = await client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      throw new NotFoundError('User not found');
    }

    return data;
  }

  private async getCaseRow(client: Client, caseId: string): Promise<CaseRow> {
    const { data, error } = await client
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .single();

    if (error || !data) {
      throw new NotFoundError('Case not found');
    }

    return data;
  }

  private async getPaymentRow(client: Client, paymentId: string): Promise<PaymentRow> {
    const { data, error } = await client
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (error || !data) {
      throw new NotFoundError('Payment not found');
    }

    return data;
  }

  private async countRows(execute: () => PromiseLike<CountQueryResult>): Promise<number> {
    const { count, error } = await execute();

    if (error) {
      throw new Error(error.message);
    }

    return count ?? 0;
  }

  private sanitizeSearchTerm(value: string): string {
    return value.replace(/[%,()]/g, ' ').trim();
  }

  private buildMeta(page: number, perPage: number, total: number) {
    return {
      page,
      per_page: perPage,
      total,
      total_pages: Math.max(1, Math.ceil(total / perPage)),
    };
  }

  private async getDesignerAvailabilityMap(
    client: Client,
    userIds: string[],
  ): Promise<Map<string, boolean>> {
    const ids = [...new Set(userIds.filter(Boolean))];
    if (ids.length === 0) {
      return new Map();
    }

    const { data, error } = await client
      .from('designer_profiles')
      .select('user_id, is_available')
      .in('user_id', ids);

    if (error) {
      throw new Error(error.message);
    }

    return new Map((data ?? []).map((row) => [row.user_id, row.is_available] as const));
  }

  private async getUserReferenceMap(
    client: Client,
    userIds: Array<string | null>,
  ): Promise<Map<string, AdminUserReference>> {
    const ids = [...new Set(userIds.filter((value): value is string => Boolean(value)))];
    if (ids.length === 0) {
      return new Map();
    }

    const { data, error } = await client
      .from('users')
      .select('id, full_name, email, role')
      .in('id', ids);

    if (error) {
      throw new Error(error.message);
    }

    return new Map((data ?? []).map((row) => [row.id, row]));
  }

  private async getPaymentStatusMap(
    client: Client,
    caseIds: string[],
  ): Promise<Map<string, Database['public']['Enums']['payment_status']>> {
    const ids = [...new Set(caseIds.filter(Boolean))];
    if (ids.length === 0) {
      return new Map();
    }

    const { data, error } = await client
      .from('payments')
      .select('case_id, status')
      .in('case_id', ids);

    if (error) {
      throw new Error(error.message);
    }

    return new Map((data ?? []).map((row) => [row.case_id, row.status]));
  }

  private async getCaseSummaryMap(
    client: Client,
    caseIds: string[],
  ): Promise<Map<string, { id: string; title: string; status: CaseRow['status'] }>> {
    const ids = [...new Set(caseIds.filter(Boolean))];
    if (ids.length === 0) {
      return new Map();
    }

    const { data, error } = await client
      .from('cases')
      .select('id, title, status')
      .in('id', ids);

    if (error) {
      throw new Error(error.message);
    }

    return new Map((data ?? []).map((row) => [row.id, row]));
  }

  private mapAuditRow(
    row: AuditLogRow,
    userMap: Map<string, AdminUserReference>,
  ): AdminAuditLogItem {
    return {
      id: row.id,
      action: row.action,
      entity_type: row.entity_type,
      entity_id: row.entity_id,
      created_at: row.created_at,
      new_data: row.new_data,
      old_data: row.old_data,
      ip_address: row.ip_address,
      user_agent: row.user_agent,
      actor: row.user_id ? (userMap.get(row.user_id) ?? null) : null,
    };
  }

  private mergeAdminSupportMetadata(
    metadata: CaseRow['metadata'],
    nextSupportMetadata: {
      last_ticket_reference: string;
      last_reason: string;
      last_updated_at: string;
    },
  ): CaseRow['metadata'] {
    const existingMetadata =
      metadata && typeof metadata === 'object' && !Array.isArray(metadata)
        ? metadata
        : {};

    return {
      ...existingMetadata,
      admin_support: {
        last_ticket_reference: nextSupportMetadata.last_ticket_reference,
        last_reason: nextSupportMetadata.last_reason,
        last_updated_at: nextSupportMetadata.last_updated_at,
      },
    };
  }
}
