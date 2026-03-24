import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AuditService, extractRequestMeta } from '@/services/audit.service';

// Mock the admin client module
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(),
}));

import { createAdminClient } from '@/lib/supabase/admin';

function createMockAdminClient() {
  const insertFn = vi.fn().mockResolvedValue({ data: null, error: null });
  const fromFn = vi.fn().mockReturnValue({ insert: insertFn });
  return { from: fromFn, _insert: insertFn };
}

describe('AuditService', () => {
  let service: AuditService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new AuditService();
  });

  describe('log', () => {
    it('should insert an audit log entry via admin client', async () => {
      const mock = createMockAdminClient();
      vi.mocked(createAdminClient).mockReturnValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mock admin client for testing
        mock as any,
      );

      await service.log({
        userId: 'user-123',
        action: 'case.published',
        entityType: 'case',
        entityId: 'case-456',
        oldData: { status: 'DRAFT' },
        newData: { status: 'OPEN' },
        ipAddress: '192.168.1.1',
        userAgent: 'TestAgent/1.0',
      });

      expect(mock.from).toHaveBeenCalledWith('audit_log');
      expect(mock._insert).toHaveBeenCalledWith({
        user_id: 'user-123',
        action: 'case.published',
        entity_type: 'case',
        entity_id: 'case-456',
        old_data: { status: 'DRAFT' },
        new_data: { status: 'OPEN' },
        ip_address: '192.168.1.1',
        user_agent: 'TestAgent/1.0',
      });
    });

    it('should default optional fields to null', async () => {
      const mock = createMockAdminClient();
      vi.mocked(createAdminClient).mockReturnValue(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- mock admin client for testing
        mock as any,
      );

      await service.log({
        userId: null,
        action: 'payment.webhook_received',
        entityType: 'payment',
        entityId: 'pay-789',
      });

      expect(mock._insert).toHaveBeenCalledWith({
        user_id: null,
        action: 'payment.webhook_received',
        entity_type: 'payment',
        entity_id: 'pay-789',
        old_data: null,
        new_data: null,
        ip_address: null,
        user_agent: null,
      });
    });

    it('should not throw when the insert fails', async () => {
      vi.mocked(createAdminClient).mockImplementation(() => {
        throw new Error('Connection failed');
      });

      // Should not throw — audit failures are silently caught
      await expect(
        service.log({
          userId: 'user-1',
          action: 'case.cancelled',
          entityType: 'case',
          entityId: 'case-1',
        }),
      ).resolves.toBeUndefined();
    });
  });
});

describe('extractRequestMeta', () => {
  it('should extract IP from x-forwarded-for and user-agent', () => {
    const headers = new Headers({
      'x-forwarded-for': '10.0.0.1, 10.0.0.2',
      'user-agent': 'Mozilla/5.0',
    });
    const req = { headers, ip: undefined } as unknown as import('next/server').NextRequest;

    const meta = extractRequestMeta(req);
    expect(meta.ipAddress).toBe('10.0.0.1');
    expect(meta.userAgent).toBe('Mozilla/5.0');
  });

  it('should fall back to x-real-ip when x-forwarded-for is missing', () => {
    const headers = new Headers({
      'x-real-ip': '127.0.0.1',
      'user-agent': 'Bot/1.0',
    });
    const req = { headers } as unknown as import('next/server').NextRequest;

    const meta = extractRequestMeta(req);
    expect(meta.ipAddress).toBe('127.0.0.1');
  });

  it('should return null when no IP or UA is available', () => {
    const headers = new Headers();
    const req = { headers, ip: undefined } as unknown as import('next/server').NextRequest;

    const meta = extractRequestMeta(req);
    expect(meta.ipAddress).toBeNull();
    expect(meta.userAgent).toBeNull();
  });
});
