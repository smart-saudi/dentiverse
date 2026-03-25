import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockRefundPayment = vi.fn();
const mockReleasePayment = vi.fn();

vi.mock('@/services/payment.service', () => ({
  PaymentService: vi.fn().mockImplementation(() => ({
    refundPayment: mockRefundPayment,
    releasePayment: mockReleasePayment,
  })),
}));

import type { AppSupabaseClient } from '@/lib/supabase/types';
import { ForbiddenError } from '@/lib/errors';
import { AdminService } from '@/services/admin.service';

function createChainableClient(overrides: Record<string, unknown> = {}) {
  return {
    from: vi.fn((table: string) => {
      if (table in overrides) {
        return overrides[table];
      }

      throw new Error(`Unexpected table mock: ${table}`);
    }),
  } as unknown as AppSupabaseClient;
}

describe('AdminService', () => {
  let service: AdminService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AdminService();
  });

  describe('setUserActiveState', () => {
    it('should suspend a user and mark their designer profile unavailable', async () => {
      const userSingle = vi
        .fn()
        .mockResolvedValueOnce({
          data: {
            id: 'designer-1',
            role: 'DESIGNER',
            is_active: true,
            full_name: 'Amina',
            email: 'amina@test.com',
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: {
            id: 'designer-1',
            role: 'DESIGNER',
            is_active: false,
            full_name: 'Amina',
            email: 'amina@test.com',
          },
          error: null,
        });

      const userUpdate = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: userSingle,
          })),
        })),
      }));
      const profileUpdate = vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }));

      const client = createChainableClient({
        users: {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: userSingle,
            })),
          })),
          update: userUpdate,
        },
        designer_profiles: {
          update: profileUpdate,
        },
      });

      const result = await service.setUserActiveState(
        client,
        'admin-1',
        'designer-1',
        false,
      );

      expect(result.is_active).toBe(false);
      expect(profileUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ is_available: false }),
      );
    });

    it('should block self-suspension for the acting admin', async () => {
      await expect(
        service.setUserActiveState(createChainableClient(), 'admin-1', 'admin-1', false),
      ).rejects.toBeInstanceOf(ForbiddenError);
    });
  });

  describe('updateCaseStatus', () => {
    it('should mark a case and linked payment as disputed', async () => {
      const caseSingle = vi
        .fn()
        .mockResolvedValueOnce({
          data: {
            id: 'case-1',
            status: 'REVIEW',
            metadata: {},
            revision_count: 1,
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: {
            id: 'case-1',
            status: 'DISPUTED',
            metadata: {},
            revision_count: 1,
          },
          error: null,
        });

      const caseUpdate = vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: caseSingle,
          })),
        })),
      }));
      const paymentUpdate = vi.fn(() => ({
        eq: vi.fn().mockResolvedValue({ error: null }),
      }));

      const client = createChainableClient({
        cases: {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: caseSingle,
            })),
          })),
          update: caseUpdate,
        },
        payments: {
          update: paymentUpdate,
        },
      });

      const result = await service.updateCaseStatus(client, 'case-1', {
        target_status: 'DISPUTED',
        ticket_reference: 'SUP-201',
        reason: 'The client and designer both disputed the latest delivery outcome.',
      });

      expect(result.status).toBe('DISPUTED');
      expect(paymentUpdate).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'DISPUTED' }),
      );
    });
  });

  describe('applyPaymentAction', () => {
    it('should refund a payment through the payment service', async () => {
      const paymentSingle = vi.fn().mockResolvedValue({
        data: {
          id: 'payment-1',
          case_id: 'case-1',
          designer_id: 'designer-1',
          stripe_payment_intent_id: 'pi_123',
          status: 'HELD',
          currency: 'USD',
          designer_payout: 88,
        },
        error: null,
      });

      const client = createChainableClient({
        payments: {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: paymentSingle,
            })),
          })),
        },
      });

      mockRefundPayment.mockResolvedValue({
        id: 'payment-1',
        status: 'REFUNDED',
        stripe_refund_id: 're_123',
      });

      const result = await service.applyPaymentAction(client, {} as never, 'payment-1', {
        action: 'REFUND',
        ticket_reference: 'FIN-301',
        reason: 'Support approved a full refund after verifying the dispute outcome.',
      });

      expect(mockRefundPayment).toHaveBeenCalledOnce();
      expect(result.status).toBe('REFUNDED');
    });
  });
});
