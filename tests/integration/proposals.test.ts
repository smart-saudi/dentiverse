import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockAuth = {
  getUser: vi.fn(),
};

const mockProposalSingleFn = vi.fn();
const mockRangeFn = vi.fn();
const mockOrderFn = vi.fn().mockReturnValue({ range: mockRangeFn });
const mockEqFn = vi.fn().mockImplementation(() => ({
  single: mockProposalSingleFn,
  order: mockOrderFn,
  eq: mockEqFn,
  select: vi.fn().mockReturnValue({ single: mockProposalSingleFn }),
}));
const mockSelectFn = vi.fn().mockImplementation(() => ({
  eq: mockEqFn,
  order: mockOrderFn,
  single: mockProposalSingleFn,
}));
const mockInsertFn = vi.fn().mockReturnValue({ select: mockSelectFn });
const mockUpdateFn = vi
  .fn()
  .mockReturnValue({
    eq: vi
      .fn()
      .mockReturnValue({
        select: vi.fn().mockReturnValue({ single: mockProposalSingleFn }),
      }),
  });

// Users table mock (for role checks)
const mockUserSingleFn = vi.fn();
const mockUserEqFn = vi.fn().mockReturnValue({ single: mockUserSingleFn });
const mockUserSelectFn = vi.fn().mockReturnValue({ eq: mockUserEqFn });

// Cases table mock (for ownership checks in accept/reject)
const mockCaseSingleFn = vi.fn();
const mockCaseEqFn = vi.fn().mockReturnValue({ single: mockCaseSingleFn });
const mockCaseSelectFn = vi.fn().mockReturnValue({ eq: mockCaseEqFn });

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: mockAuth,
    from: vi.fn((table: string) => {
      if (table === 'users') {
        return { select: mockUserSelectFn };
      }
      if (table === 'cases') {
        return { select: mockCaseSelectFn };
      }
      // Default: proposals table
      return {
        insert: mockInsertFn,
        update: mockUpdateFn,
        select: mockSelectFn,
      };
    }),
  })),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function buildRequest(
  body: unknown,
  method = 'POST',
  url = 'http://localhost:3000/api/v1/cases/c-1/proposals',
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
const mockProposal = {
  id: 'p-1',
  case_id: 'c-1',
  designer_id: 'user-1',
  price: 150,
  estimated_hours: 8,
  message: 'I can do this.',
  status: 'PENDING',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('POST /api/v1/cases/[id]/proposals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUserEqFn.mockReturnValue({ single: mockUserSingleFn });
    mockUserSelectFn.mockReturnValue({ eq: mockUserEqFn });
  });

  it('should create a proposal (201)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockUserSingleFn.mockResolvedValue({ data: { role: 'DESIGNER' }, error: null });
    mockProposalSingleFn.mockResolvedValue({ data: mockProposal, error: null });

    const { POST } = await import('@/app/api/v1/cases/[id]/proposals/route');
    const req = buildRequest({
      price: 150,
      estimated_hours: 8,
      message: 'I can do this.',
    });
    const res = await POST(req, { params: Promise.resolve({ id: 'c-1' }) });
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.data.status).toBe('PENDING');
  });

  it('should return 401 for unauthenticated users', async () => {
    mockAuth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'No session' },
    });

    const { POST } = await import('@/app/api/v1/cases/[id]/proposals/route');
    const req = buildRequest({ price: 150, estimated_hours: 8, message: 'test' });
    const res = await POST(req, { params: Promise.resolve({ id: 'c-1' }) });

    expect(res.status).toBe(401);
  });

  it('should return 400 for invalid input', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockUserSingleFn.mockResolvedValue({ data: { role: 'DESIGNER' }, error: null });

    const { POST } = await import('@/app/api/v1/cases/[id]/proposals/route');
    const req = buildRequest({ price: -10 });
    const res = await POST(req, { params: Promise.resolve({ id: 'c-1' }) });

    expect(res.status).toBe(400);
  });

  it('should return 403 for non-DESIGNER role', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockUserSingleFn.mockResolvedValue({ data: { role: 'DENTIST' }, error: null });

    const { POST } = await import('@/app/api/v1/cases/[id]/proposals/route');
    const req = buildRequest({ price: 150, estimated_hours: 8, message: 'test' });
    const res = await POST(req, { params: Promise.resolve({ id: 'c-1' }) });

    expect(res.status).toBe(403);
  });
});

describe('GET /api/v1/cases/[id]/proposals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return proposals for a case (200)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    mockRangeFn.mockResolvedValue({ data: [mockProposal], error: null, count: 1 });

    const { GET } = await import('@/app/api/v1/cases/[id]/proposals/route');
    const req = buildRequest(
      null,
      'GET',
      'http://localhost:3000/api/v1/cases/c-1/proposals',
    );
    const res = await GET(req, { params: Promise.resolve({ id: 'c-1' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data).toBeDefined();
    expect(json.meta).toBeDefined();
  });
});

describe('POST /api/v1/proposals/[id]/accept', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCaseEqFn.mockReturnValue({ single: mockCaseSingleFn });
    mockCaseSelectFn.mockReturnValue({ eq: mockCaseEqFn });
  });

  it('should accept a proposal (200)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    // First single call: fetch proposal → get case_id
    // Second single call: fetch case → verify ownership
    // Third single call: accept proposal → return updated
    let callCount = 0;
    mockProposalSingleFn.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        // Proposal lookup
        return Promise.resolve({ data: { case_id: 'c-1' }, error: null });
      }
      // Accept result
      return Promise.resolve({
        data: { ...mockProposal, status: 'ACCEPTED' },
        error: null,
      });
    });
    mockCaseSingleFn.mockResolvedValue({ data: { client_id: 'user-1' }, error: null });

    const { POST } = await import('@/app/api/v1/proposals/[id]/accept/route');
    const req = buildRequest(
      null,
      'POST',
      'http://localhost:3000/api/v1/proposals/p-1/accept',
    );
    const res = await POST(req, { params: Promise.resolve({ id: 'p-1' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.status).toBe('ACCEPTED');
  });
});

describe('POST /api/v1/proposals/[id]/reject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCaseEqFn.mockReturnValue({ single: mockCaseSingleFn });
    mockCaseSelectFn.mockReturnValue({ eq: mockCaseEqFn });
  });

  it('should reject a proposal (200)', async () => {
    mockAuth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
    let callCount = 0;
    mockProposalSingleFn.mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.resolve({ data: { case_id: 'c-1' }, error: null });
      }
      return Promise.resolve({
        data: { ...mockProposal, status: 'REJECTED' },
        error: null,
      });
    });
    mockCaseSingleFn.mockResolvedValue({ data: { client_id: 'user-1' }, error: null });

    const { POST } = await import('@/app/api/v1/proposals/[id]/reject/route');
    const req = buildRequest(
      null,
      'POST',
      'http://localhost:3000/api/v1/proposals/p-1/reject',
    );
    const res = await POST(req, { params: Promise.resolve({ id: 'p-1' }) });
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.status).toBe('REJECTED');
  });
});
