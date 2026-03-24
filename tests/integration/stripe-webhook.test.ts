import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockConstructWebhookEvent = vi.fn();
const mockSendPaymentConfirmedEmail = vi.fn();
const mockSendPaymentReleasedEmail = vi.fn();
const paymentState = new Map<
  string,
  { stripe_charge_id: string | null; stripe_transfer_id: string | null }
>();

vi.mock('@/lib/stripe/webhooks', () => ({
  constructWebhookEvent: mockConstructWebhookEvent,
}));

vi.mock('@/services/email.service', () => ({
  EmailService: vi.fn().mockImplementation(() => ({
    sendPaymentConfirmedEmail: mockSendPaymentConfirmedEmail,
    sendPaymentReleasedEmail: mockSendPaymentReleasedEmail,
  })),
}));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: vi.fn((table: string) => {
      if (table !== 'payments') {
        throw new Error(`Unexpected table: ${table}`);
      }

      return {
        select: vi.fn(() => ({
          eq: vi.fn((_column: string, paymentId: string) => ({
            single: vi.fn().mockResolvedValue({
              data: paymentState.get(paymentId) ?? null,
              error: paymentState.has(paymentId)
                ? null
                : { message: 'Payment not found' },
            }),
          })),
        })),
        update: vi.fn((payload: Record<string, unknown>) => ({
          eq: vi.fn((_column: string, paymentId: string) => {
            paymentState.set(paymentId, {
              stripe_charge_id:
                typeof payload.stripe_charge_id === 'string'
                  ? payload.stripe_charge_id
                  : (paymentState.get(paymentId)?.stripe_charge_id ?? null),
              stripe_transfer_id:
                typeof payload.stripe_transfer_id === 'string'
                  ? payload.stripe_transfer_id
                  : (paymentState.get(paymentId)?.stripe_transfer_id ?? null),
            });

            return Promise.resolve({ error: null });
          }),
        })),
      };
    }),
  })),
}));

function buildRequest() {
  return new NextRequest('http://localhost:3000/api/v1/webhooks/stripe', {
    method: 'POST',
    body: JSON.stringify({ id: 'evt_123' }),
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': 'test-signature',
    },
  });
}

describe('POST /api/v1/webhooks/stripe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    paymentState.clear();
    mockSendPaymentConfirmedEmail.mockResolvedValue({ status: 'sent' });
    mockSendPaymentReleasedEmail.mockResolvedValue({ status: 'sent' });
  });

  it('should send a payment confirmed email on first successful charge confirmation', async () => {
    paymentState.set('pay-1', {
      stripe_charge_id: null,
      stripe_transfer_id: null,
    });
    mockConstructWebhookEvent.mockReturnValue({
      id: 'evt_confirm_1',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          latest_charge: 'ch_123',
          metadata: { payment_id: 'pay-1' },
        },
      },
    });

    const { POST } = await import('@/app/api/v1/webhooks/stripe/route');
    const res = await POST(buildRequest());

    expect(res.status).toBe(200);
    expect(mockSendPaymentConfirmedEmail).toHaveBeenCalledWith({ paymentId: 'pay-1' });
  });

  it('should skip duplicate payment confirmed emails when the charge is already recorded', async () => {
    paymentState.set('pay-1', {
      stripe_charge_id: 'ch_existing',
      stripe_transfer_id: null,
    });
    mockConstructWebhookEvent.mockReturnValue({
      id: 'evt_confirm_2',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          latest_charge: 'ch_existing',
          metadata: { payment_id: 'pay-1' },
        },
      },
    });

    const { POST } = await import('@/app/api/v1/webhooks/stripe/route');
    const res = await POST(buildRequest());

    expect(res.status).toBe(200);
    expect(mockSendPaymentConfirmedEmail).not.toHaveBeenCalled();
  });

  it('should send a payment released email on first transfer creation', async () => {
    paymentState.set('pay-2', {
      stripe_charge_id: 'ch_456',
      stripe_transfer_id: null,
    });
    mockConstructWebhookEvent.mockReturnValue({
      id: 'evt_release_1',
      type: 'transfer.created',
      data: {
        object: {
          id: 'tr_123',
          metadata: { payment_id: 'pay-2' },
        },
      },
    });

    const { POST } = await import('@/app/api/v1/webhooks/stripe/route');
    const res = await POST(buildRequest());

    expect(res.status).toBe(200);
    expect(mockSendPaymentReleasedEmail).toHaveBeenCalledWith({ paymentId: 'pay-2' });
  });
});
