import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockAuth = {
  getUser: vi.fn(),
};

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
const mockUpdateFn = vi.fn().mockReturnValue({
  eq: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({ single: mockSingleFn }),
    eq: vi.fn(),
  }),
});

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: mockAuth,
    from: vi.fn(() => ({
      select: mockSelectFn,
      update: mockUpdateFn,
    })),
  })),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockUser = { id: 'user-1', email: 'client@test.com' };
const mockNotification = {
  id: 'n-1',
  user_id: 'user-1',
  type: 'NEW_PROPOSAL',
  title: 'New proposal received',
  body: null,
  case_id: 'c-1',
  action_url: null,
  is_read: false,
  is_emailed: false,
  created_at: '2026-03-23T00:00:00Z',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/v1/notifications', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return paginated notifications (200)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockRangeFn.mockResolvedValue({ data: [mockNotification], error: null, count: 1 });

    const { GET } = await import('@/app/api/v1/notifications/route');
    const req = new NextRequest('http://localhost:3000/api/v1/notifications');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeDefined();
    expect(json.meta).toBeDefined();
  });

  it('should return 401 for unauthenticated users', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'No session' } });

    const { GET } = await import('@/app/api/v1/notifications/route');
    const req = new NextRequest('http://localhost:3000/api/v1/notifications');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/notifications/[id]/read', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should mark notification as read', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingleFn.mockResolvedValue({ data: { ...mockNotification, is_read: true }, error: null });

    const { POST } = await import('@/app/api/v1/notifications/[id]/read/route');
    const req = new NextRequest('http://localhost:3000/api/v1/notifications/n-1/read', { method: 'POST' });
    const res = await POST(req, { params: Promise.resolve({ id: 'n-1' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.is_read).toBe(true);
  });

  it('should return 401 for unauthenticated users', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'No session' } });

    const { POST } = await import('@/app/api/v1/notifications/[id]/read/route');
    const req = new NextRequest('http://localhost:3000/api/v1/notifications/n-1/read', { method: 'POST' });
    const res = await POST(req, { params: Promise.resolve({ id: 'n-1' }) });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/v1/notifications/read-all', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should mark all notifications as read', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const { POST } = await import('@/app/api/v1/notifications/read-all/route');
    const req = new NextRequest('http://localhost:3000/api/v1/notifications/read-all', { method: 'POST' });
    const res = await POST(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.success).toBe(true);
  });
});
