import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockAuth = {
  getUser: vi.fn(),
};
const mockCreateSignedUrl = vi.fn();
const mockSendDesignSubmittedEmail = vi.fn();

const mockSingleFn = vi.fn();
const mockRangeFn = vi.fn();
const mockOrderFn = vi.fn().mockReturnValue({
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
const mockUpdateFn = vi.fn().mockReturnValue({
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
    storage: {
      from: vi.fn(() => ({
        createSignedUrl: mockCreateSignedUrl,
      })),
    },
  })),
}));

vi.mock('@/services/email.service', () => ({
  EmailService: vi.fn().mockImplementation(() => ({
    sendDesignSubmittedEmail: mockSendDesignSubmittedEmail,
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
  file_urls: [
    {
      bucket: 'design-files',
      path: 'user-1/file.stl',
      name: 'file.stl',
      size: 2048,
      type: 'model/stl',
    },
  ],
  status: 'SUBMITTED',
  thumbnail_url: null,
  preview_model_url: null,
  notes: null,
  revision_feedback: null,
  reviewed_at: null,
  created_at: '2026-03-24T00:00:00.000Z',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/v1/cases/[id]/design-versions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendDesignSubmittedEmail.mockResolvedValue({ status: 'sent' });
  });

  it('should create a design version (201)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    // getLatestVersion returns null (first version)
    mockSingleFn.mockResolvedValueOnce({ data: null, error: { code: 'PGRST116' } });
    // createVersion returns the new version
    mockSingleFn.mockResolvedValueOnce({ data: mockVersion, error: null });

    const { POST } = await import('@/app/api/v1/cases/[id]/design-versions/route');
    const req = buildRequest({
      files: [
        {
          bucket: 'design-files',
          path: 'user-1/file.stl',
          name: 'file.stl',
          size: 2048,
          type: 'model/stl',
        },
      ],
      notes: 'First version',
    });
    const res = await POST(req, { params: Promise.resolve({ id: 'c-1' }) });
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.status).toBe('SUBMITTED');
    expect(mockSendDesignSubmittedEmail).toHaveBeenCalledWith({
      caseId: 'c-1',
      designVersionId: 'dv-1',
      designerId: 'user-1',
      versionNumber: 1,
    });
  });

  it('should return 401 for unauthenticated users', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'No session' },
    });

    const { POST } = await import('@/app/api/v1/cases/[id]/design-versions/route');
    const req = buildRequest({
      files: [
        {
          bucket: 'design-files',
          path: 'user-1/file.stl',
          name: 'file.stl',
          size: 2048,
          type: 'model/stl',
        },
      ],
    });
    const res = await POST(req, { params: Promise.resolve({ id: 'c-1' }) });

    expect(res.status).toBe(401);
  });

  it('should return 400 for invalid input', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });

    const { POST } = await import('@/app/api/v1/cases/[id]/design-versions/route');
    const req = buildRequest({ files: [] });
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
    mockCreateSignedUrl.mockResolvedValue({
      data: { signedUrl: 'https://example.com/file.stl?token=123' },
      error: null,
    });

    const { GET } = await import('@/app/api/v1/cases/[id]/design-versions/route');
    const req = buildRequest(null, 'GET');
    const res = await GET(req, { params: Promise.resolve({ id: 'c-1' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeDefined();
    expect(json.meta).toBeDefined();
    expect(json.data[0].file_urls).toEqual(['https://example.com/file.stl?token=123']);
    expect(json.data[0].files[0].name).toBe('file.stl');
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
