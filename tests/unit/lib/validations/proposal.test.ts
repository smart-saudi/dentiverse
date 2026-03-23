import { describe, expect, it } from 'vitest';

import {
  createProposalSchema,
  proposalListQuerySchema,
  PROPOSAL_STATUSES,
} from '@/lib/validations/proposal';

describe('createProposalSchema', () => {
  const validInput = {
    price: 150,
    estimated_hours: 8,
    message: 'I can deliver this crown within 3 days.',
  };

  it('should accept valid input', () => {
    const result = createProposalSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it('should require price to be positive', () => {
    const result = createProposalSchema.safeParse({ ...validInput, price: -10 });
    expect(result.success).toBe(false);
  });

  it('should require price to be a number', () => {
    const result = createProposalSchema.safeParse({ ...validInput, price: 'abc' });
    expect(result.success).toBe(false);
  });

  it('should require estimated_hours to be positive', () => {
    const result = createProposalSchema.safeParse({ ...validInput, estimated_hours: 0 });
    expect(result.success).toBe(false);
  });

  it('should require message to be non-empty', () => {
    const result = createProposalSchema.safeParse({ ...validInput, message: '' });
    expect(result.success).toBe(false);
  });

  it('should trim message', () => {
    const result = createProposalSchema.safeParse({ ...validInput, message: '  trimmed  ' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.message).toBe('trimmed');
    }
  });

  it('should reject message longer than 2000 characters', () => {
    const result = createProposalSchema.safeParse({ ...validInput, message: 'x'.repeat(2001) });
    expect(result.success).toBe(false);
  });

  it('should require all fields', () => {
    const result = createProposalSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('proposalListQuerySchema', () => {
  it('should provide defaults for empty query', () => {
    const result = proposalListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.per_page).toBe(20);
    }
  });

  it('should filter by status', () => {
    const result = proposalListQuerySchema.safeParse({ status: 'PENDING' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const result = proposalListQuerySchema.safeParse({ status: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('should coerce page and per_page from strings', () => {
    const result = proposalListQuerySchema.safeParse({ page: '2', per_page: '10' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.per_page).toBe(10);
    }
  });
});

describe('PROPOSAL_STATUSES', () => {
  it('should include all expected statuses', () => {
    expect(PROPOSAL_STATUSES).toContain('PENDING');
    expect(PROPOSAL_STATUSES).toContain('ACCEPTED');
    expect(PROPOSAL_STATUSES).toContain('REJECTED');
    expect(PROPOSAL_STATUSES).toContain('WITHDRAWN');
  });
});
