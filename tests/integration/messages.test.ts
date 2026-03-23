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
const mockNeqFn = vi.fn().mockReturnValue({ eq: vi.fn() });
const mockEqFn = vi.fn().mockImplementation(() => ({
  single: mockSingleFn,
  order: mockOrderFn,
  neq: mockNeqFn,
}));
const mockSelectFn = vi.fn().mockImplementation(() => ({
  eq: mockEqFn,
  single: mockSingleFn,
}));
const mockInsertFn = vi.fn().mockReturnValue({ select: mockSelectFn });
const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockEqFn });

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: mockAuth,
    from: vi.fn(() => ({
      insert: mockInsertFn,
      select: mockSelectFn,
      update: mockUpdateFn,
    })),
  })),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const mockUser = { id: 'user-1', email: 'client@test.com' };
const mockMessage = {
  id: 'msg-1',
  case_id: 'c-1',
  sender_id: 'user-1',
  content: 'Hello designer!',
  attachment_urls: [],
  is_read: false,
  is_system: false,
  created_at: '2026-03-23T00:00:00Z',
};

function buildRequest(body: unknown, method = 'POST', url = 'http://localhost:3000/api/v1/cases/c-1/messages'): NextRequest {
  if (method === 'GET') return new NextRequest(url, { method });
  return new NextRequest(url, {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const mockContext = { params: Promise.resolve({ id: 'c-1' }) };

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/v1/cases/[id]/messages', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should create a message (201)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingleFn.mockResolvedValue({ data: mockMessage, error: null });

    const { POST } = await import('@/app/api/v1/cases/[id]/messages/route');
    const req = buildRequest({ content: 'Hello designer!' });
    const res = await POST(req, mockContext);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.content).toBe('Hello designer!');
  });

  it('should return 401 for unauthenticated users', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'No session' } });

    const { POST } = await import('@/app/api/v1/cases/[id]/messages/route');
    const req = buildRequest({ content: 'Hello' });
    const res = await POST(req, mockContext);

    expect(res.status).toBe(401);
  });

  it('should return 400 for empty content', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const { POST } = await import('@/app/api/v1/cases/[id]/messages/route');
    const req = buildRequest({ content: '' });
    const res = await POST(req, mockContext);

    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/cases/[id]/messages', () => {
  beforeEach(() => vi.clearAllMocks());

  it('should return paginated messages (200)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockRangeFn.mockResolvedValue({ data: [mockMessage], error: null, count: 1 });

    const { GET } = await import('@/app/api/v1/cases/[id]/messages/route');
    const req = buildRequest(null, 'GET');
    const res = await GET(req, mockContext);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeDefined();
    expect(json.meta).toBeDefined();
  });

  it('should return 401 for unauthenticated users', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: null }, error: { message: 'No session' } });

    const { GET } = await import('@/app/api/v1/cases/[id]/messages/route');
    const req = buildRequest(null, 'GET');
    const res = await GET(req, mockContext);

    expect(res.status).toBe(401);
  });
});
