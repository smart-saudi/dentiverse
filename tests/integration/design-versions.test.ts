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
const mockOrderFn = vi
  .fn()
  .mockReturnValue({
    range: mockRangeFn,
    limit: vi.fn().mockReturnValue({ single: mockSingleFn }),
  });
const mockEqFn = vi.fn().mockImplementation(() => ({
  single: mockSingleFn,
  order: mockOrderFn,
}));
const mockSelectFn = vi.fn().mockImplementation(() => ({
  eq: mockEqFn,
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
  url = 'http://localhost:3000/api/v1/cases/c-1/design-versions',
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
const mockVersion = {
  id: 'dv-1',
  case_id: 'c-1',
  designer_id: 'user-1',
  version_number: 1,
  file_urls: ['https://example.com/file.stl'],
  status: 'SUBMITTED',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/v1/cases/[id]/design-versions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a design version (201)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    // getLatestVersion returns null (first version)
    mockSingleFn.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
    // createVersion returns the new version
    mockSingleFn.mockResolvedValueOnce({ data: mockVersion, error: null });

    const { POST } = await import('@/app/api/v1/cases/[id]/design-versions/route');
    const req = buildRequest({
      file_urls: ['https://example.com/file.stl'],
      notes: 'First version',
    });
    const res = await POST(req, { params: Promise.resolve({ id: 'c-1' }) });
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.status).toBe('SUBMITTED');
  });

  it('should return 401 for unauthenticated users', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'No session' },
    });

    const { POST } = await import('@/app/api/v1/cases/[id]/design-versions/route');
    const req = buildRequest({ file_urls: ['https://example.com/file.stl'] });
    const res = await POST(req, { params: Promise.resolve({ id: 'c-1' }) });

    expect(res.status).toBe(401);
  });

  it('should return 400 for invalid input', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const { POST } = await import('@/app/api/v1/cases/[id]/design-versions/route');
    const req = buildRequest({ file_urls: [] });
    const res = await POST(req, { params: Promise.resolve({ id: 'c-1' }) });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/v1/cases/[id]/design-versions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should list design versions (200)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockRangeFn.mockResolvedValue({ data: [mockVersion], error: null, count: 1 });

    const { GET } = await import('@/app/api/v1/cases/[id]/design-versions/route');
    const req = buildRequest(null, 'GET');
    const res = await GET(req, { params: Promise.resolve({ id: 'c-1' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeDefined();
    expect(json.meta).toBeDefined();
  });
});

describe('POST /api/v1/design-versions/[id]/review', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should approve a design version (200)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingleFn.mockResolvedValue({
      data: { ...mockVersion, status: 'APPROVED' },
      error: null,
    });

    const { POST } = await import('@/app/api/v1/design-versions/[id]/review/route');
    const req = buildRequest({ status: 'APPROVED' });
    const res = await POST(req, { params: Promise.resolve({ id: 'dv-1' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.status).toBe('APPROVED');
  });

  it('should request revision with feedback (200)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockSingleFn.mockResolvedValue({
      data: {
        ...mockVersion,
        status: 'REVISION_REQUESTED',
        revision_feedback: 'Fix contacts',
      },
      error: null,
    });

    const { POST } = await import('@/app/api/v1/design-versions/[id]/review/route');
    const req = buildRequest({
      status: 'REVISION_REQUESTED',
      revision_feedback: 'Fix contacts',
    });
    const res = await POST(req, { params: Promise.resolve({ id: 'dv-1' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.status).toBe('REVISION_REQUESTED');
  });

  it('should return 400 for invalid review status', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const { POST } = await import('@/app/api/v1/design-versions/[id]/review/route');
    const req = buildRequest({ status: 'SUBMITTED' });
    const res = await POST(req, { params: Promise.resolve({ id: 'dv-1' }) });

    expect(res.status).toBe(400);
  });
});
