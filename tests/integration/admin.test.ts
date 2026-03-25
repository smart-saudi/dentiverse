import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { ForbiddenError } from '@/lib/errors';

const mockGetAuthenticatedAdminContext = vi.fn();
const mockAuditLog = vi.fn();
const mockGetDashboardSummary = vi.fn();
const mockListUsers = vi.fn();
const mockSetUserActiveState = vi.fn();
const mockListCases = vi.fn();
const mockUpdateCaseStatus = vi.fn();
const mockListPayments = vi.fn();
const mockApplyPaymentAction = vi.fn();
const mockListAuditLog = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({})),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({})),
}));

vi.mock('@/lib/stripe/client', () => ({
  getStripeClient: vi.fn(() => ({})),
}));

vi.mock('@/lib/user-access', () => ({
  getAuthenticatedAdminContext: mockGetAuthenticatedAdminContext,
}));

vi.mock('@/services/admin.service', () => ({
  AdminService: vi.fn().mockImplementation(() => ({
    getDashboardSummary: mockGetDashboardSummary,
    listUsers: mockListUsers,
    setUserActiveState: mockSetUserActiveState,
    listCases: mockListCases,
    updateCaseStatus: mockUpdateCaseStatus,
    listPayments: mockListPayments,
    applyPaymentAction: mockApplyPaymentAction,
    listAuditLog: mockListAuditLog,
  })),
}));

vi.mock('@/services/audit.service', () => ({
  AuditService: vi.fn().mockImplementation(() => ({
    log: mockAuditLog,
  })),
  extractRequestMeta: vi.fn(() => ({
    ipAddress: '198.51.100.40',
    userAgent: 'vitest',
  })),
}));

function buildRequest(pathname: string, method = 'GET', body?: unknown): NextRequest {
  return new NextRequest(`http://localhost:3000${pathname}`, {
    method,
    body: body ? JSON.stringify(body) : null,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
  });
}

describe('Admin API routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAuthenticatedAdminContext.mockResolvedValue({
      authUser: { id: 'admin-1', email: 'ops@test.com' },
      profile: {
        id: 'admin-1',
        role: 'ADMIN',
        is_active: true,
        email: 'ops@test.com',
        full_name: 'Ops Admin',
      },
    });
  });

  it('should return dashboard summary for admins', async () => {
    mockGetDashboardSummary.mockResolvedValue({
      total_users: 10,
      suspended_users: 2,
      active_cases: 4,
      disputed_cases: 1,
      held_payments: 3,
      disputed_payments: 1,
      held_payment_value: 450,
      recent_audit_entries: [],
    });

    const { GET } = await import('@/app/api/v1/admin/dashboard/route');
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.total_users).toBe(10);
  });

  it('should return 403 when admin access is denied', async () => {
    mockGetAuthenticatedAdminContext.mockRejectedValue(
      new ForbiddenError('Admin access is required for this resource.'),
    );

    const { GET } = await import('@/app/api/v1/admin/dashboard/route');
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.code).toBe('FORBIDDEN');
  });

  it('should update user status and write an audit log entry', async () => {
    mockSetUserActiveState.mockResolvedValue({
      id: 'user-2',
      role: 'DESIGNER',
      is_active: false,
      email: 'designer@test.com',
      full_name: 'Designer Two',
    });

    const { PATCH } = await import('@/app/api/v1/admin/users/[id]/route');
    const response = await PATCH(
      buildRequest('/api/v1/admin/users/user-2', 'PATCH', {
        action: 'SUSPEND',
        ticket_reference: 'SUP-101',
        reason: 'The account violated marketplace rules and requires suspension.',
      }),
      { params: Promise.resolve({ id: 'user-2' }) },
    );

    expect(response.status).toBe(200);
    expect(mockAuditLog).toHaveBeenCalledOnce();
  });

  it('should validate user action payloads', async () => {
    const { PATCH } = await import('@/app/api/v1/admin/users/[id]/route');
    const response = await PATCH(
      buildRequest('/api/v1/admin/users/user-2', 'PATCH', {
        action: 'SUSPEND',
        ticket_reference: '',
        reason: 'short',
      }),
      { params: Promise.resolve({ id: 'user-2' }) },
    );

    expect(response.status).toBe(400);
  });

  it('should update case status for admins', async () => {
    mockUpdateCaseStatus.mockResolvedValue({
      id: 'case-2',
      status: 'DISPUTED',
    });

    const { PATCH } = await import('@/app/api/v1/admin/cases/[id]/route');
    const response = await PATCH(
      buildRequest('/api/v1/admin/cases/case-2', 'PATCH', {
        target_status: 'DISPUTED',
        ticket_reference: 'SUP-201',
        reason: 'The delivery entered a formal dispute pending support review.',
      }),
      { params: Promise.resolve({ id: 'case-2' }) },
    );

    expect(response.status).toBe(200);
  });

  it('should apply payment support actions for admins', async () => {
    mockApplyPaymentAction.mockResolvedValue({
      id: 'payment-2',
      status: 'REFUNDED',
    });

    const { PATCH } = await import('@/app/api/v1/admin/payments/[id]/route');
    const response = await PATCH(
      buildRequest('/api/v1/admin/payments/payment-2', 'PATCH', {
        action: 'REFUND',
        ticket_reference: 'FIN-301',
        reason: 'Finance approved a full refund after reconciling the dispute.',
      }),
      { params: Promise.resolve({ id: 'payment-2' }) },
    );

    expect(response.status).toBe(200);
  });

  it('should return audit-log entries for admins', async () => {
    mockListAuditLog.mockResolvedValue({
      data: [
        {
          id: 'audit-1',
          action: 'admin.user.deactivated',
          entity_type: 'user',
          entity_id: 'user-2',
        },
      ],
      meta: { page: 1, per_page: 20, total: 1, total_pages: 1 },
    });

    const { GET } = await import('@/app/api/v1/admin/audit-log/route');
    const response = await GET(buildRequest('/api/v1/admin/audit-log'));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toHaveLength(1);
    expect(json.meta.total).toBe(1);
  });
});
