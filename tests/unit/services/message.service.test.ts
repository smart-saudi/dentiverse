import { describe, it, expect, vi, beforeEach } from 'vitest';

import { MessageService } from '@/services/message.service';

const mockSingleFn = vi.fn();
const mockRangeFn = vi.fn();
const mockOrderFn = vi.fn().mockReturnValue({ range: mockRangeFn });
const mockEqFn = vi.fn().mockImplementation(() => ({
  single: mockSingleFn,
  order: mockOrderFn,
  neq: vi.fn().mockReturnValue({ eq: vi.fn() }),
}));
const mockSelectFn = vi.fn().mockImplementation(() => ({
  eq: mockEqFn,
  single: mockSingleFn,
}));
const mockInsertFn = vi.fn().mockReturnValue({ select: mockSelectFn });
const mockUpdateFn = vi.fn().mockReturnValue({
  eq: mockEqFn,
});

const mockSupabase = {
  from: vi.fn(() => ({
    insert: mockInsertFn,
    select: mockSelectFn,
    update: mockUpdateFn,
  })),
} as unknown as Parameters<MessageService['sendMessage']>[0];

const service = new MessageService();

describe('MessageService', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('sendMessage', () => {
    it('should insert a message and return it', async () => {
      const mockMsg = { id: 'msg-1', case_id: 'c-1', sender_id: 'u-1', content: 'Hello' };
      mockSingleFn.mockResolvedValue({ data: mockMsg, error: null });

      const result = await service.sendMessage(mockSupabase, 'c-1', 'u-1', {
        content: 'Hello',
        attachment_urls: [],
      });

      expect(result).toEqual(mockMsg);
      expect(mockSupabase.from).toHaveBeenCalledWith('messages');
    });

    it('should throw on insert error', async () => {
      mockSingleFn.mockResolvedValue({ data: null, error: { message: 'Insert failed' } });

      await expect(
        service.sendMessage(mockSupabase, 'c-1', 'u-1', {
          content: 'Hello',
          attachment_urls: [],
        }),
      ).rejects.toThrow('Insert failed');
    });
  });

  describe('listMessages', () => {
    it('should return paginated messages', async () => {
      mockRangeFn.mockResolvedValue({ data: [{ id: 'msg-1' }], error: null, count: 1 });

      const result = await service.listMessages(mockSupabase, 'c-1', {
        page: 1,
        per_page: 50,
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.total_pages).toBe(1);
    });

    it('should throw on query error', async () => {
      mockRangeFn.mockResolvedValue({
        data: null,
        error: { message: 'Query failed' },
        count: 0,
      });

      await expect(
        service.listMessages(mockSupabase, 'c-1', { page: 1, per_page: 50 }),
      ).rejects.toThrow('Query failed');
    });
  });

  describe('markAsRead', () => {
    it('should update unread messages not sent by user', async () => {
      await service.markAsRead(mockSupabase, 'c-1', 'u-1');
      expect(mockSupabase.from).toHaveBeenCalledWith('messages');
    });
  });
});
