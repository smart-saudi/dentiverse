import { describe, expect, it } from 'vitest';

import {
  adminAuditLogQuerySchema,
  adminCaseActionSchema,
  adminCaseListQuerySchema,
  adminPaymentActionSchema,
  adminPaymentListQuerySchema,
  adminUserActionSchema,
  adminUserListQuerySchema,
} from '@/lib/validations/admin';

describe('admin validation schemas', () => {
  describe('adminUserListQuerySchema', () => {
    it('should parse defaults for an empty query', () => {
      const result = adminUserListQuerySchema.parse({});

      expect(result.page).toBe(1);
      expect(result.per_page).toBe(20);
      expect(result.role).toBeUndefined();
      expect(result.is_active).toBeUndefined();
    });

    it('should parse filters and booleans from query strings', () => {
      const result = adminUserListQuerySchema.parse({
        page: '2',
        per_page: '10',
        role: 'ADMIN',
        is_active: 'false',
        q: 'sarah',
      });

      expect(result.page).toBe(2);
      expect(result.per_page).toBe(10);
      expect(result.role).toBe('ADMIN');
      expect(result.is_active).toBe(false);
      expect(result.q).toBe('sarah');
    });
  });

  describe('adminUserActionSchema', () => {
    it('should accept suspend and reactivate actions', () => {
      expect(
        adminUserActionSchema.parse({
          action: 'SUSPEND',
          ticket_reference: 'SUP-101',
          reason: 'Confirmed abusive messaging toward another user.',
        }).action,
      ).toBe('SUSPEND');

      expect(
        adminUserActionSchema.parse({
          action: 'REACTIVATE',
          ticket_reference: 'SUP-102',
          reason: 'Appeal approved after support review and remediation.',
        }).action,
      ).toBe('REACTIVATE');
    });

    it('should reject short reasons', () => {
      expect(() =>
        adminUserActionSchema.parse({
          action: 'SUSPEND',
          ticket_reference: 'SUP-103',
          reason: 'Too short',
        }),
      ).toThrow();
    });
  });

  describe('adminCaseActionSchema', () => {
    it('should accept supported case transitions', () => {
      const result = adminCaseActionSchema.parse({
        target_status: 'DISPUTED',
        ticket_reference: 'SUP-201',
        reason: 'The client reported a delivery and pricing dispute requiring review.',
      });

      expect(result.target_status).toBe('DISPUTED');
    });
  });

  describe('adminPaymentActionSchema', () => {
    it('should accept a refund action with audit metadata', () => {
      const result = adminPaymentActionSchema.parse({
        action: 'REFUND',
        ticket_reference: 'FIN-301',
        reason: 'Operator approved a full refund after verifying the case dispute.',
      });

      expect(result.action).toBe('REFUND');
    });

    it('should reject unknown actions', () => {
      expect(() =>
        adminPaymentActionSchema.parse({
          action: 'CAPTURE',
          ticket_reference: 'FIN-302',
          reason: 'Not allowed',
        }),
      ).toThrow();
    });
  });

  describe('adminCaseListQuerySchema', () => {
    it('should parse case filters', () => {
      const result = adminCaseListQuerySchema.parse({
        page: '3',
        status: 'DISPUTED',
        q: 'implant',
      });

      expect(result.page).toBe(3);
      expect(result.status).toBe('DISPUTED');
      expect(result.q).toBe('implant');
    });
  });

  describe('adminPaymentListQuerySchema', () => {
    it('should parse payment filters', () => {
      const result = adminPaymentListQuerySchema.parse({
        status: 'HELD',
        page: '2',
      });

      expect(result.status).toBe('HELD');
      expect(result.page).toBe(2);
    });
  });

  describe('adminAuditLogQuerySchema', () => {
    it('should parse audit filters', () => {
      const result = adminAuditLogQuerySchema.parse({
        entity_type: 'payment',
        q: 'refund',
      });

      expect(result.entity_type).toBe('payment');
      expect(result.q).toBe('refund');
    });
  });
});
