import { describe, it, expect } from 'vitest';

import { createNotificationSchema, notificationListQuerySchema } from '@/lib/validations/notification';

describe('createNotificationSchema', () => {
  it('should accept valid notification', () => {
    const result = createNotificationSchema.safeParse({
      user_id: 'user-1',
      type: 'NEW_PROPOSAL',
      title: 'New proposal received',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.body).toBeNull();
      expect(result.data.case_id).toBeNull();
      expect(result.data.action_url).toBeNull();
    }
  });

  it('should accept notification with all fields', () => {
    const result = createNotificationSchema.safeParse({
      user_id: 'user-1',
      type: 'PAYMENT_RELEASED',
      title: 'Payment released',
      body: 'Your payment of $150 has been released',
      case_id: 'case-1',
      action_url: 'https://app.dentiverse.com/payments/pay-1',
    });
    expect(result.success).toBe(true);
  });

  it('should reject missing user_id', () => {
    const result = createNotificationSchema.safeParse({
      type: 'NEW_PROPOSAL',
      title: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid type', () => {
    const result = createNotificationSchema.safeParse({
      user_id: 'user-1',
      type: 'INVALID_TYPE',
      title: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty title', () => {
    const result = createNotificationSchema.safeParse({
      user_id: 'user-1',
      type: 'NEW_MESSAGE',
      title: '',
    });
    expect(result.success).toBe(false);
  });

  it('should reject title over 200 chars', () => {
    const result = createNotificationSchema.safeParse({
      user_id: 'user-1',
      type: 'NEW_MESSAGE',
      title: 'a'.repeat(201),
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid action_url', () => {
    const result = createNotificationSchema.safeParse({
      user_id: 'user-1',
      type: 'NEW_MESSAGE',
      title: 'Test',
      action_url: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('should accept all valid notification types', () => {
    const types = [
      'NEW_PROPOSAL', 'DESIGN_SUBMITTED', 'REVISION_REQUESTED',
      'PAYMENT_RELEASED', 'NEW_MESSAGE', 'CASE_ASSIGNED',
      'CASE_COMPLETED', 'REVIEW_RECEIVED',
    ];
    for (const type of types) {
      const result = createNotificationSchema.safeParse({
        user_id: 'user-1',
        type,
        title: 'Test',
      });
      expect(result.success).toBe(true);
    }
  });
});

describe('notificationListQuerySchema', () => {
  it('should apply defaults', () => {
    const result = notificationListQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.per_page).toBe(20);
      expect(result.data.is_read).toBeUndefined();
    }
  });

  it('should accept is_read filter', () => {
    const result = notificationListQuerySchema.safeParse({ is_read: 'false' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.is_read).toBe('false');
  });

  it('should coerce page', () => {
    const result = notificationListQuerySchema.safeParse({ page: '2' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.page).toBe(2);
  });
});
