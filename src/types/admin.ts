import type { Database } from '@/lib/database.types';

type CaseStatus = Database['public']['Enums']['case_status'];
type CaseType = Database['public']['Enums']['case_type'];
type PaymentStatus = Database['public']['Enums']['payment_status'];
type UserRole = Database['public']['Enums']['user_role'];

export interface AdminUserReference {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
}

export interface AdminUserListItem extends Pick<
  Database['public']['Tables']['users']['Row'],
  | 'id'
  | 'full_name'
  | 'email'
  | 'role'
  | 'is_active'
  | 'is_verified'
  | 'last_seen_at'
  | 'created_at'
  | 'city'
  | 'country'
> {
  designer_available: boolean | null;
}

export interface AdminCaseListItem {
  id: string;
  title: string;
  status: CaseStatus;
  case_type: CaseType;
  created_at: string;
  updated_at: string;
  deadline: string | null;
  budget_min: number | null;
  budget_max: number | null;
  agreed_price: number | null;
  revision_count: number;
  client: AdminUserReference | null;
  designer: AdminUserReference | null;
  payment_status: PaymentStatus | null;
}

export interface AdminPaymentListItem extends Pick<
  Database['public']['Tables']['payments']['Row'],
  | 'id'
  | 'amount'
  | 'currency'
  | 'status'
  | 'platform_fee'
  | 'designer_payout'
  | 'created_at'
  | 'held_at'
  | 'released_at'
  | 'refunded_at'
  | 'stripe_payment_intent_id'
  | 'stripe_refund_id'
  | 'stripe_transfer_id'
> {
  client: AdminUserReference | null;
  designer: AdminUserReference | null;
  case: {
    id: string;
    title: string;
    status: CaseStatus;
  } | null;
}

export interface AdminAuditLogItem extends Pick<
  Database['public']['Tables']['audit_log']['Row'],
  | 'id'
  | 'action'
  | 'entity_type'
  | 'entity_id'
  | 'created_at'
  | 'new_data'
  | 'old_data'
  | 'ip_address'
  | 'user_agent'
> {
  actor: AdminUserReference | null;
}

export interface AdminDashboardSummary {
  total_users: number;
  suspended_users: number;
  active_cases: number;
  disputed_cases: number;
  held_payments: number;
  disputed_payments: number;
  held_payment_value: number;
  recent_audit_entries: AdminAuditLogItem[];
}

export interface PaginatedAdminResult<T> {
  data: T[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}
