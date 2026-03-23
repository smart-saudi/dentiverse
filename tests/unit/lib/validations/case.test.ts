import { describe, it, expect } from 'vitest';

import {
  createCaseSchema,
  updateCaseSchema,
  caseListQuerySchema,
} from '@/lib/validations/case';

describe('Case Validation Schemas', () => {
  describe('createCaseSchema', () => {
    const validData = {
      case_type: 'CROWN' as const,
      title: 'Full Zirconia Crown #14',
      tooth_numbers: [14],
    };

    it('should accept valid minimal case data', () => {
      const result = createCaseSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should accept all valid case types', () => {
      const types = [
        'CROWN',
        'BRIDGE',
        'IMPLANT',
        'VENEER',
        'INLAY',
        'ONLAY',
        'DENTURE',
        'OTHER',
      ] as const;
      for (const case_type of types) {
        const result = createCaseSchema.safeParse({ ...validData, case_type });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid case type', () => {
      const result = createCaseSchema.safeParse({
        ...validData,
        case_type: 'INVALID',
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty title', () => {
      const result = createCaseSchema.safeParse({ ...validData, title: '' });
      expect(result.success).toBe(false);
    });

    it('should reject title longer than 255 characters', () => {
      const result = createCaseSchema.safeParse({
        ...validData,
        title: 'A'.repeat(256),
      });
      expect(result.success).toBe(false);
    });

    it('should reject empty tooth_numbers array', () => {
      const result = createCaseSchema.safeParse({
        ...validData,
        tooth_numbers: [],
      });
      expect(result.success).toBe(false);
    });

    it('should reject tooth numbers outside FDI range (11-48)', () => {
      const result = createCaseSchema.safeParse({
        ...validData,
        tooth_numbers: [10],
      });
      expect(result.success).toBe(false);

      const result2 = createCaseSchema.safeParse({
        ...validData,
        tooth_numbers: [49],
      });
      expect(result2.success).toBe(false);
    });

    it('should accept valid FDI tooth numbers', () => {
      const result = createCaseSchema.safeParse({
        ...validData,
        tooth_numbers: [11, 21, 36, 48],
      });
      expect(result.success).toBe(true);
    });

    it('should accept optional fields when provided', () => {
      const result = createCaseSchema.safeParse({
        ...validData,
        description: 'Full contour zirconia crown',
        material_preference: 'Zirconia',
        shade: 'A2',
        budget_min: 50,
        budget_max: 150,
        deadline: '2026-04-15T00:00:00Z',
        urgency: 'urgent',
        special_instructions: 'Please match adjacent tooth anatomy',
        software_required: 'exocad',
        output_format: 'STL',
        max_revisions: 3,
      });
      expect(result.success).toBe(true);
    });

    it('should reject negative budget_min', () => {
      const result = createCaseSchema.safeParse({
        ...validData,
        budget_min: -10,
      });
      expect(result.success).toBe(false);
    });

    it('should accept valid urgency values', () => {
      for (const urgency of ['normal', 'urgent', 'rush']) {
        const result = createCaseSchema.safeParse({
          ...validData,
          urgency,
        });
        expect(result.success).toBe(true);
      }
    });

    it('should reject invalid urgency value', () => {
      const result = createCaseSchema.safeParse({
        ...validData,
        urgency: 'ASAP',
      });
      expect(result.success).toBe(false);
    });

    it('should default urgency to normal', () => {
      const result = createCaseSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.urgency).toBe('normal');
      }
    });

    it('should default output_format to STL', () => {
      const result = createCaseSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.output_format).toBe('STL');
      }
    });

    it('should default max_revisions to 2', () => {
      const result = createCaseSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.max_revisions).toBe(2);
      }
    });

    it('should reject missing required fields', () => {
      const result = createCaseSchema.safeParse({});
      expect(result.success).toBe(false);
    });

    it('should trim title whitespace', () => {
      const result = createCaseSchema.safeParse({
        ...validData,
        title: '  Full Zirconia Crown  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.title).toBe('Full Zirconia Crown');
      }
    });
  });

  describe('updateCaseSchema', () => {
    it('should accept partial update with title only', () => {
      const result = updateCaseSchema.safeParse({ title: 'Updated title' });
      expect(result.success).toBe(true);
    });

    it('should accept partial update with budget', () => {
      const result = updateCaseSchema.safeParse({
        budget_min: 100,
        budget_max: 300,
      });
      expect(result.success).toBe(true);
    });

    it('should accept empty object (no changes)', () => {
      const result = updateCaseSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('should reject negative budget', () => {
      const result = updateCaseSchema.safeParse({ budget_min: -5 });
      expect(result.success).toBe(false);
    });

    it('should accept description and special_instructions', () => {
      const result = updateCaseSchema.safeParse({
        description: 'Updated description',
        special_instructions: 'Handle with care',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('caseListQuerySchema', () => {
    it('should accept empty query (defaults)', () => {
      const result = caseListQuerySchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(1);
        expect(result.data.per_page).toBe(20);
        expect(result.data.sort_by).toBe('created_at');
      }
    });

    it('should accept valid status filter', () => {
      const result = caseListQuerySchema.safeParse({ status: 'OPEN' });
      expect(result.success).toBe(true);
    });

    it('should reject invalid status', () => {
      const result = caseListQuerySchema.safeParse({ status: 'INVALID' });
      expect(result.success).toBe(false);
    });

    it('should accept valid sort_by values', () => {
      for (const sort_by of ['created_at', 'deadline', 'budget_max']) {
        const result = caseListQuerySchema.safeParse({ sort_by });
        expect(result.success).toBe(true);
      }
    });

    it('should coerce string page to number', () => {
      const result = caseListQuerySchema.safeParse({ page: '3' });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.page).toBe(3);
      }
    });

    it('should accept case_type filter', () => {
      const result = caseListQuerySchema.safeParse({ case_type: 'CROWN' });
      expect(result.success).toBe(true);
    });
  });
});
