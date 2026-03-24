import { describe, expect, it, vi, beforeEach } from 'vitest';

import { PaymentService } from '@/services/payment.service';

function createMockClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mock Supabase client for testing
  return { from: vi.fn() } as any;
}

function createMockStripe() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mock Stripe client for testing
  return {
    paymentIntents: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
    transfers: {
      create: vi.fn(),
    },
    refunds: {
      create: vi.fn(),
    },
  } as any;
}

describe('PaymentService', () => {
  let service: PaymentService;

  beforeEach(() => {
    service = new PaymentService();
  });

  describe('createPayment', () => {
    it('should create a payment record with PENDING status and calculated fees', async () => {
      const input = { case_id: 'c-1', designer_id: 'u-2', amount: 100, currency: 'USD' };
      const mockPayment = {
        id: 'pay-1',
        ...input,
        client_id: 'u-1',
        platform_fee: 12,
        designer_payout: 88,
        fee_percentage: 12,
        status: 'PENDING',
      };

      // Proposal cross-validation chain
      const proposalSingle = vi.fn().mockResolvedValue({
        data: { price: 100, status: 'ACCEPTED', designer_id: 'u-2', case_id: 'c-1' },
        error: null,
      });
      const proposalEq3 = vi.fn().mockReturnValue({ single: proposalSingle });
      const proposalEq2 = vi.fn().mockReturnValue({ eq: proposalEq3 });
      const proposalEq1 = vi.fn().mockReturnValue({ eq: proposalEq2 });
      const proposalSelect = vi.fn().mockReturnValue({ eq: proposalEq1 });

      // Payment insert chain
      const paymentSingle = vi.fn().mockResolvedValue({ data: mockPayment, error: null });
      const paymentSelectAfterInsert = vi.fn().mockReturnValue({ single: paymentSingle });
      const insert = vi.fn().mockReturnValue({ select: paymentSelectAfterInsert });

      const client = createMockClient();
      client.from.mockImplementation((table: string) => {
        if (table === 'proposals') return { select: proposalSelect };
        return { insert };
      });

      const result = await service.createPayment(client, 'u-1', input);
      expect(result.status).toBe('PENDING');
      expect(result.platform_fee).toBe(12);
      expect(result.designer_payout).toBe(88);
      expect(insert).toHaveBeenCalledWith(
        expect.objectContaining({
          client_id: 'u-1',
          amount: 100,
          platform_fee: 12,
          designer_payout: 88,
        }),
      );
    });
  });

  describe('holdPayment', () => {
    it('should create a Stripe PaymentIntent and update status to HELD', async () => {
      const mockStripe = createMockStripe();
      mockStripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_123',
        client_secret: 'cs_123',
      });

      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({
        data: { id: 'pay-1', status: 'HELD', stripe_payment_intent_id: 'pi_123' },
        error: null,
      });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ update });

      const result = await service.holdPayment(client, mockStripe, 'pay-1', 10000, 'USD');
      expect(result.status).toBe('HELD');
      expect(mockStripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 10000,
          currency: 'usd',
        }),
      );
    });
  });

  describe('releasePayment', () => {
    it('should create a Stripe Transfer and update status to RELEASED', async () => {
      const mockStripe = createMockStripe();
      mockStripe.transfers.create.mockResolvedValue({ id: 'tr_123' });

      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({
        data: { id: 'pay-1', status: 'RELEASED', stripe_transfer_id: 'tr_123' },
        error: null,
      });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ update });

      const result = await service.releasePayment(
        client,
        mockStripe,
        'pay-1',
        8800,
        'acct_designer',
        'USD',
      );
      expect(result.status).toBe('RELEASED');
      expect(mockStripe.transfers.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 8800,
          destination: 'acct_designer',
        }),
      );
    });
  });

  describe('refundPayment', () => {
    it('should create a Stripe Refund and update status to REFUNDED', async () => {
      const mockStripe = createMockStripe();
      mockStripe.refunds.create.mockResolvedValue({ id: 're_123' });

      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({
        data: { id: 'pay-1', status: 'REFUNDED', stripe_refund_id: 're_123' },
        error: null,
      });
      const select = vi.fn().mockReturnValue({ single });
      const eq = vi.fn().mockReturnValue({ select });
      const update = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ update });

      const result = await service.refundPayment(client, mockStripe, 'pay-1', 'pi_123');
      expect(result.status).toBe('REFUNDED');
      expect(mockStripe.refunds.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_intent: 'pi_123',
        }),
      );
    });
  });

  describe('getPayment', () => {
    it('should fetch a payment by ID', async () => {
      const mockPayment = { id: 'pay-1', status: 'HELD' };
      const client = createMockClient();
      const single = vi.fn().mockResolvedValue({ data: mockPayment, error: null });
      const eq = vi.fn().mockReturnValue({ single });
      const select = vi.fn().mockReturnValue({ eq });
      client.from.mockReturnValue({ select });

      const result = await service.getPayment(client, 'pay-1');
      expect(result).toEqual(mockPayment);
    });
  });

  describe('listPaymentsByUser', () => {
    it('should return paginated payments for a user', async () => {
      const mockData = [{ id: 'pay-1' }, { id: 'pay-2' }];
      const client = createMockClient();
      const range = vi.fn().mockResolvedValue({ data: mockData, error: null, count: 2 });
      const order = vi.fn().mockReturnValue({ range });
      const or = vi.fn().mockReturnValue({ order });
      const select = vi.fn().mockReturnValue({ or });
      client.from.mockReturnValue({ select });

      const result = await service.listPaymentsByUser(client, 'u-1', {
        page: 1,
        per_page: 20,
      });
      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(2);
    });
  });
});
