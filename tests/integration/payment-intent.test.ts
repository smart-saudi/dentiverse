import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockAuth = {
  getUser: vi.fn(),
};

const mockAuditLog = vi.fn();
const mockCreatePayment = vi.fn();
const mockHoldPayment = vi.fn();
const mockStripeConstructor = vi.fn();

const mockProposalSingle = vi.fn();
const mockProposalEqThird = vi.fn().mockReturnValue({ single: mockProposalSingle });
const mockProposalEqSecond = vi.fn().mockReturnValue({ eq: mockProposalEqThird });
const mockProposalEqFirst = vi.fn().mockReturnValue({ eq: mockProposalEqSecond });
const mockProposalSelect = vi.fn().mockReturnValue({ eq: mockProposalEqFirst });

const mockCaseSingle = vi.fn();
const mockCaseEq = vi.fn().mockReturnValue({ single: mockCaseSingle });
const mockCaseSelect = vi.fn().mockReturnValue({ eq: mockCaseEq });

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: mockAuth,
    from: vi.fn((table: string) => {
      if (table === 'proposals') {
        return { select: mockProposalSelect };
      }

      return { select: mockCaseSelect };
    }),
  })),
}));

vi.mock('@/services/payment.service', () => ({
  PaymentService: vi.fn().mockImplementation(() => ({
    createPayment: mockCreatePayment,
    holdPayment: mockHoldPayment,
  })),
}));

vi.mock('@/services/audit.service', () => ({
  AuditService: vi.fn().mockImplementation(() => ({
    log: mockAuditLog,
  })),
  extractRequestMeta: vi.fn(() => ({
    ip_address: null,
    user_agent: null,
  })),
}));

vi.mock('stripe', () => ({
  default: mockStripeConstructor,
}));

function buildRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/v1/payments/create-intent', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/v1/payments/create-intent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStripeConstructor.mockImplementation(() => ({}));
  });

  it('should create a payment intent (200)', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: '11111111-1111-1111-1111-111111111111' } },
      error: null,
    });
    mockProposalSingle.mockResolvedValue({
      data: {
        id: '33333333-3333-3333-3333-333333333333',
        case_id: '22222222-2222-2222-2222-222222222222',
        designer_id: '44444444-4444-4444-4444-444444444444',
        price: 250,
        status: 'ACCEPTED',
      },
      error: null,
    });
    mockCaseSingle.mockResolvedValue({
      data: { client_id: '11111111-1111-1111-1111-111111111111' },
      error: null,
    });
    mockCreatePayment.mockResolvedValue({ id: 'pay-1' });
    mockHoldPayment.mockResolvedValue({
      id: 'pay-1',
      stripe_payment_intent_id: 'pi_123',
    });

    const { POST } = await import('@/app/api/v1/payments/create-intent/route');
    const res = await POST(
      buildRequest({
        case_id: '22222222-2222-2222-2222-222222222222',
        proposal_id: '33333333-3333-3333-3333-333333333333',
      }),
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.client_secret).toBe('pi_123');
    expect(json.data.payment_id).toBe('pay-1');
    expect(mockAuditLog).toHaveBeenCalled();
  });

  it('should return 403 when the user is not the case owner', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: '11111111-1111-1111-1111-111111111111' } },
      error: null,
    });
    mockProposalSingle.mockResolvedValue({
      data: {
        id: '33333333-3333-3333-3333-333333333333',
        case_id: '22222222-2222-2222-2222-222222222222',
        designer_id: '44444444-4444-4444-4444-444444444444',
        price: 250,
        status: 'ACCEPTED',
      },
      error: null,
    });
    mockCaseSingle.mockResolvedValue({
      data: { client_id: '99999999-9999-9999-9999-999999999999' },
      error: null,
    });

    const { POST } = await import('@/app/api/v1/payments/create-intent/route');
    const res = await POST(
      buildRequest({
        case_id: '22222222-2222-2222-2222-222222222222',
        proposal_id: '33333333-3333-3333-3333-333333333333',
      }),
    );

    expect(res.status).toBe(403);
  });
});
