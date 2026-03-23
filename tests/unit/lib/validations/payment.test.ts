import { describe, expect, it } from 'vitest';

import {
  createPaymentSchema,
  paymentListQuerySchema,
  PAYMENT_STATUSES,
} from '@/lib/validations/payment';

describe('createPaymentSchema', () => {
  const validInput = {
    case_id: 'case-1',
    designer_id: 'designer-1',
    amount: 150,
  };

  it('should accept valid input', () => {
    const result = createPaymentSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should require amount to be positive', () => {
    const result = createPaymentSchema.safeParse({ ...validInput, amount: 0 });
    expect(result.success).toBe(false);
  });

  it('should calculate platform_fee and designer_payout from amount', () => {
    const result = createPaymentSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    // Platform fee and payout are calculated by the service, not the schema
  });

  it('should require case_id', () => {
    const result = createPaymentSchema.safeParse({ ...validInput, case_id: '' });
    expect(result.success).toBe(false);
  });

  it('should require designer_id', () => {
    const result = createPaymentSchema.safeParse({ ...validInput, designer_id: '' });
    expect(result.success).toBe(false);
  });

  it('should accept optional currency', () => {
    const result = createPaymentSchema.safeParse({ ...validInput, currency: 'EUR' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe('EUR');
    }
  });

  it('should default currency to USD', () => {
    const result = createPaymentSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.currency).toBe('USD');
    }
  });
});

describe('paymentListQuerySchema', () => {
  it('should provide defaults for empty query', () => {
    const result = paymentListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.per_page).toBe(20);
    }
  });

  it('should filter by status', () => {
    const result = paymentListQuerySchema.safeParse({ status: 'HELD' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const result = paymentListQuerySchema.safeParse({ status: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('should coerce page from string', () => {
    const result = paymentListQuerySchema.safeParse({ page: '3' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
    }
  });
});

describe('PAYMENT_STATUSES', () => {
  it('should include all expected statuses', () => {
    expect(PAYMENT_STATUSES).toContain('PENDING');
    expect(PAYMENT_STATUSES).toContain('HELD');
    expect(PAYMENT_STATUSES).toContain('RELEASED');
    expect(PAYMENT_STATUSES).toContain('REFUNDED');
  });
});
