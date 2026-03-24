import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockAuth = {
  getUser: vi.fn(),
};

const mockMarkAsRead = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: mockAuth,
  })),
}));

vi.mock('@/services/message.service', () => ({
  MessageService: vi.fn().mockImplementation(() => ({
    markAsRead: mockMarkAsRead,
  })),
}));

const mockContext = {
  params: Promise.resolve({ id: 'case-1' }),
};

describe('POST /api/v1/cases/[id]/messages/read', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should mark case messages as read (200)', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
      error: null,
    });
    mockMarkAsRead.mockResolvedValue(undefined);

    const { POST } = await import('@/app/api/v1/cases/[id]/messages/read/route');
    const req = new NextRequest(
      'http://localhost:3000/api/v1/cases/case-1/messages/read',
      {
        method: 'POST',
      },
    );
    const res = await POST(req, mockContext);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.success).toBe(true);
    expect(mockMarkAsRead).toHaveBeenCalledWith(expect.anything(), 'case-1', 'user-1');
  });

  it('should return 401 for unauthenticated users', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'No session' },
    });

    const { POST } = await import('@/app/api/v1/cases/[id]/messages/read/route');
    const req = new NextRequest(
      'http://localhost:3000/api/v1/cases/case-1/messages/read',
      {
        method: 'POST',
      },
    );
    const res = await POST(req, mockContext);

    expect(res.status).toBe(401);
  });
});
