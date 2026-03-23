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
const mockGteFn = vi.fn().mockReturnValue({ order: mockOrderFn });
const mockContainsFn = vi.fn().mockImplementation(() => ({
  order: mockOrderFn,
  contains: mockContainsFn,
  gte: mockGteFn,
}));
const mockEqFn = vi.fn().mockImplementation(() => ({
  single: mockSingleFn,
  order: mockOrderFn,
  contains: mockContainsFn,
  gte: mockGteFn,
}));
const mockSelectFn = vi.fn().mockImplementation(() => ({
  eq: mockEqFn,
  order: mockOrderFn,
  single: mockSingleFn,
}));
const mockInsertFn = vi.fn().mockReturnValue({ select: mockSelectFn });
const mockUpdateFn = vi
  .fn()
  .mockReturnValue({
    eq: vi
      .fn()
      .mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockSingleFn }) }),
  });

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: mockAuth,
    from: vi.fn(() => ({
      insert: mockInsertFn,
      update: mockUpdateFn,
      select: mockSelectFn,
    })),
  })),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildRequest(
  body: unknown,
  method = 'POST',
  url = 'http://localhost:3000/api/v1/designers',
): NextRequest {
  if (method === 'GET') {
    return new NextRequest(url, { method });
  }
  return new NextRequest(url, {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const mockUser = { id: 'user-1', email: 'designer@test.com' };
const mockDesignerProfile = {
  id: 'dp-1',
  user_id: 'user-1',
  bio: 'Expert designer',
  software_skills: ['Exocad'],
  specializations: ['CROWN'],
  years_experience: 5,
  avg_rating: 4.5,
  total_reviews: 10,
  is_available: true,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GET /api/v1/designers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return paginated designers (200)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockRangeFn.mockResolvedValue({ data: [mockDesignerProfile], error: null, count: 1 });

    const { GET } = await import('@/app/api/v1/designers/route');
    const req = buildRequest(
      null,
      'GET',
      'http://localhost:3000/api/v1/designers?page=1',
    );
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeDefined();
    expect(json.meta).toBeDefined();
  });

  it('should return 401 for unauthenticated users', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'No session' },
    });

    const { GET } = await import('@/app/api/v1/designers/route');
    const req = buildRequest(null, 'GET');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/designers/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return designer profile (200)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingleFn.mockResolvedValue({ data: mockDesignerProfile, error: null });

    const { GET } = await import('@/app/api/v1/designers/[id]/route');
    const req = buildRequest(null, 'GET', 'http://localhost:3000/api/v1/designers/dp-1');
    const res = await GET(req, { params: Promise.resolve({ id: 'dp-1' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.id).toBe('dp-1');
  });

  it('should return 401 for unauthenticated users', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'No session' },
    });

    const { GET } = await import('@/app/api/v1/designers/[id]/route');
    const req = buildRequest(null, 'GET', 'http://localhost:3000/api/v1/designers/dp-1');
    const res = await GET(req, { params: Promise.resolve({ id: 'dp-1' }) });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/designers/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return the current user designer profile (200)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingleFn.mockResolvedValue({ data: mockDesignerProfile, error: null });

    const { GET } = await import('@/app/api/v1/designers/me/route');
    const req = buildRequest(null, 'GET', 'http://localhost:3000/api/v1/designers/me');
    const res = await GET(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.user_id).toBe('user-1');
  });

  it('should return 401 for unauthenticated users', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'No session' },
    });

    const { GET } = await import('@/app/api/v1/designers/me/route');
    const req = buildRequest(null, 'GET', 'http://localhost:3000/api/v1/designers/me');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });
});

describe('PATCH /api/v1/designers/me', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update designer profile (200)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingleFn.mockResolvedValue({
      data: { ...mockDesignerProfile, bio: 'Updated bio' },
      error: null,
    });

    const { PATCH } = await import('@/app/api/v1/designers/me/route');
    const req = buildRequest(
      { bio: 'Updated bio' },
      'PATCH',
      'http://localhost:3000/api/v1/designers/me',
    );
    const res = await PATCH(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.bio).toBe('Updated bio');
  });

  it('should return 400 for invalid update data', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const { PATCH } = await import('@/app/api/v1/designers/me/route');
    const req = buildRequest(
      { hourly_rate: -10 },
      'PATCH',
      'http://localhost:3000/api/v1/designers/me',
    );
    const res = await PATCH(req);

    expect(res.status).toBe(400);
  });
});
