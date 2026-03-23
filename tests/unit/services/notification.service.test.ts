import { describe, it, expect, vi, beforeEach } from 'vitest';

import { NotificationService } from '@/services/notification.service';

const mockSingleFn = vi.fn();
const mockRangeFn = vi.fn();
const mockOrderFn = vi.fn().mockReturnValue({ range: mockRangeFn });
const mockEqFn = vi.fn().mockImplementation(() => ({
  single: mockSingleFn,
  order: mockOrderFn,
  eq: vi.fn().mockImplementation(() => ({
    order: mockOrderFn,
    single: mockSingleFn,
  })),
}));
const mockSelectFn = vi.fn().mockImplementation(() => ({
  eq: mockEqFn,
  single: mockSingleFn,
}));
const mockInsertFn = vi.fn().mockReturnValue({ select: mockSelectFn });
const mockUpdateFn = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({ single: mockSingleFn }),
    }),
    select: vi.fn().mockReturnValue({ single: mockSingleFn }),
  }),
});

const mockSupabase = {
  from: vi.fn(() => ({
    insert: mockInsertFn,
    select: mockSelectFn,
    update: mockUpdateFn,
  })),
} as unknown as Parameters<NotificationService['createNotification']>[0];

const service = new NotificationService();

describe('NotificationService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('createNotification', () => {
    it('should insert and return a notification', async () => {
      const mockNotif = { id: 'n-1', user_id: 'u-1', type: 'NEW_PROPOSAL', title: 'Test' };
      mockSingleFn.mockResolvedValue({ data: mockNotif, error: null });

      const result = await service.createNotification(mockSupabase, {
        user_id: 'u-1',
        type: 'NEW_PROPOSAL',
        title: 'Test',
        body: null,
        case_id: null,
        action_url: null,
      });

      expect(result).toEqual(mockNotif);
      expect(mockSupabase.from).toHaveBeenCalledWith('notifications');
    });

    it('should throw on insert error', async () => {
      mockSingleFn.mockResolvedValue({ data: null, error: { message: 'Insert failed' } });

      await expect(
        service.createNotification(mockSupabase, {
          user_id: 'u-1',
          type: 'NEW_PROPOSAL',
          title: 'Test',
          body: null,
          case_id: null,
          action_url: null,
        }),
      ).rejects.toThrow('Insert failed');
    });
  });

  describe('listNotifications', () => {
    it('should return paginated notifications', async () => {
      mockRangeFn.mockResolvedValue({ data: [{ id: 'n-1' }], error: null, count: 1 });

      const result = await service.listNotifications(mockSupabase, 'u-1', { page: 1, per_page: 20 });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });

    it('should throw on query error', async () => {
      mockRangeFn.mockResolvedValue({ data: null, error: { message: 'Query failed' }, count: 0 });

      await expect(
        service.listNotifications(mockSupabase, 'u-1', { page: 1, per_page: 20 }),
      ).rejects.toThrow('Query failed');
    });
  });

  describe('markAsRead', () => {
    it('should update and return the notification', async () => {
      const mockNotif = { id: 'n-1', is_read: true };
      mockSingleFn.mockResolvedValue({ data: mockNotif, error: null });

      const result = await service.markAsRead(mockSupabase, 'n-1', 'user-1');
      expect(result.is_read).toBe(true);
    });
  });

  describe('getUnreadCount', () => {
    it('should return the count', async () => {
      // getUnreadCount uses select with head:true, which returns count directly
      mockEqFn.mockReturnValueOnce({ eq: vi.fn().mockResolvedValue({ count: 5, error: null }) });

      const count = await service.getUnreadCount(mockSupabase, 'u-1');
      expect(count).toBe(5);
    });
  });
});
