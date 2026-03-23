import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockAuth = {
  getUser: vi.fn(),
};

const mockPaymentSingleFn = vi.fn();
const mockRangeFn = vi.fn();
const mockOrderFn = vi.fn().mockReturnValue({ range: mockRangeFn });
const mockOrFn = vi
  .fn()
  .mockReturnValue({
    order: mockOrderFn,
    eq: vi.fn().mockReturnValue({ order: mockOrderFn }),
  });
const mockEqFn = vi.fn().mockImplementation(() => ({
  single: mockPaymentSingleFn,
  order: mockOrderFn,
  or: mockOrFn,
}));
const mockSelectFn = vi.fn().mockImplementation(() => ({
  eq: mockEqFn,
  or: mockOrFn,
  single: mockPaymentSingleFn,
}));
const mockInsertFn = vi.fn().mockReturnValue({ select: mockSelectFn });
const mockUpdateFn = vi
  .fn()
  .mockReturnValue({
    eq: vi
      .fn()
      .mockReturnValue({
        select: vi.fn().mockReturnValue({ single: mockPaymentSingleFn }),
      }),
  });

// Proposal cross-validation mock chain
const mockProposalSingleFn = vi.fn();
const mockProposalEq3 = vi.fn().mockReturnValue({ single: mockProposalSingleFn });
const mockProposalEq2 = vi.fn().mockReturnValue({ eq: mockProposalEq3 });
const mockProposalEq1 = vi.fn().mockReturnValue({ eq: mockProposalEq2 });
const mockProposalSelectFn = vi.fn().mockReturnValue({ eq: mockProposalEq1 });

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: mockAuth,
    from: vi.fn((table: string) => {
      if (table === 'proposals') {
        return { select: mockProposalSelectFn };
      }
      return {
        insert: mockInsertFn,
        update: mockUpdateFn,
        select: mockSelectFn,
      };
    }),
  })),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildRequest(
  body: unknown,
  method = 'POST',
  url = 'http://localhost:3000/api/v1/payments',
): NextRequest {
  if (method === 'GET') {
    return new NextRequest(url, { method });
  }
  return new NextRequest(url, {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const mockUser = { id: 'user-1', email: 'client@test.com' };
const mockPayment = {
  id: 'pay-1',
  case_id: 'c-1',
  client_id: 'user-1',
  designer_id: 'user-2',
  amount: 150,
  platform_fee: 18,
  designer_payout: 132,
  status: 'PENDING',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/v1/payments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a payment (201)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockProposalSingleFn.mockResolvedValue({
      data: { price: 150, status: 'ACCEPTED', designer_id: 'user-2', case_id: 'c-1' },
      error: null,
    });
    mockPaymentSingleFn.mockResolvedValue({ data: mockPayment, error: null });

    const { POST } = await import('@/app/api/v1/payments/route');
    const req = buildRequest({ case_id: 'c-1', designer_id: 'user-2', amount: 150 });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.status).toBe('PENDING');
  });

  it('should return 401 for unauthenticated users', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'No session' },
    });

    const { POST } = await import('@/app/api/v1/payments/route');
    const req = buildRequest({ case_id: 'c-1', designer_id: 'user-2', amount: 150 });
    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it('should return 400 for invalid input', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const { POST } = await import('@/app/api/v1/payments/route');
    const req = buildRequest({ amount: -10 });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/payments', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return paginated payments (200)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockRangeFn.mockResolvedValue({ data: [mockPayment], error: null, count: 1 });

    const { GET } = await import('@/app/api/v1/payments/route');
    const req = buildRequest(null, 'GET');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeDefined();
    expect(json.meta).toBeDefined();
  });

  it('should return 401 for unauthenticated users', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'No session' },
    });

    const { GET } = await import('@/app/api/v1/payments/route');
    const req = buildRequest(null, 'GET');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });
});
