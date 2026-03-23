import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------

const mockAuth = {
  getUser: vi.fn(),
};

// Cases table mock chain
const mockCaseSingleFn = vi.fn();
const mockCaseRangeFn = vi.fn();
const mockCaseOrderFn = vi.fn().mockReturnValue({ range: mockCaseRangeFn });
const mockCaseEqFn = vi.fn().mockImplementation(() => ({
  single: mockCaseSingleFn,
  order: mockCaseOrderFn,
  range: mockCaseRangeFn,
  eq: mockCaseEqFn,
  select: vi.fn().mockReturnValue({ single: mockCaseSingleFn }),
}));
const mockCaseSelectFn = vi.fn().mockImplementation(() => ({
  eq: mockCaseEqFn,
  order: mockCaseOrderFn,
  single: mockCaseSingleFn,
}));
const mockCaseInsertFn = vi.fn().mockReturnValue({ select: mockCaseSelectFn });
const mockCaseUpdateFn = vi.fn().mockReturnValue({ eq: mockCaseEqFn });

// Users table mock (for role checks)
const mockUserSingleFn = vi.fn();
const mockUserEqFn = vi.fn().mockReturnValue({ single: mockUserSingleFn });
const mockUserSelectFn = vi.fn().mockReturnValue({ eq: mockUserEqFn });

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: mockAuth,
    from: vi.fn((table: string) => {
      if (table === 'users') {
        return { select: mockUserSelectFn };
      }
      // Default: cases table
      return {
        insert: mockCaseInsertFn,
        update: mockCaseUpdateFn,
        select: mockCaseSelectFn,
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
  url = 'http://localhost:3000/api/v1/cases',
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

function mockAuthenticatedUser(id = 'user-1', email = 'dentist@example.com') {
  mockAuth.getUser.mockResolvedValue({
    data: { user: { id, email } },
    error: null,
  });
  // Default: user has DENTIST role
  mockUserSingleFn.mockResolvedValue({ data: { role: 'DENTIST' }, error: null });
}

function mockUnauthenticated() {
  mockAuth.getUser.mockResolvedValue({
    data: { user: null },
    error: { message: 'Not authenticated' },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Cases API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset default mock implementations
    mockCaseEqFn.mockImplementation(() => ({
      single: mockCaseSingleFn,
      order: mockCaseOrderFn,
      range: mockCaseRangeFn,
      eq: mockCaseEqFn,
      select: vi.fn().mockReturnValue({ single: mockCaseSingleFn }),
    }));
    mockUserEqFn.mockReturnValue({ single: mockUserSingleFn });
    mockUserSelectFn.mockReturnValue({ eq: mockUserEqFn });
  });

  // ---- POST /api/v1/cases -----------------------------------------------
  describe('POST /api/v1/cases', () => {
    const validBody = {
      case_type: 'CROWN',
      title: 'Full Zirconia Crown #14',
      tooth_numbers: [14],
    };

    it('should return 201 on valid case creation', async () => {
      mockAuthenticatedUser();
      mockCaseSingleFn.mockResolvedValue({
        data: {
          id: 'case-1',
          client_id: 'user-1',
          status: 'DRAFT',
          ...validBody,
        },
        error: null,
      });

      const { POST } = await import('@/app/api/v1/cases/route');
      const res = await POST(buildRequest(validBody));
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.data.status).toBe('DRAFT');
      expect(json.data.client_id).toBe('user-1');
    });

    it('should return 401 when not authenticated', async () => {
      mockUnauthenticated();

      const { POST } = await import('@/app/api/v1/cases/route');
      const res = await POST(buildRequest(validBody));

      expect(res.status).toBe(401);
    });

    it('should return 400 on validation error', async () => {
      mockAuthenticatedUser();

      const { POST } = await import('@/app/api/v1/cases/route');
      const res = await POST(buildRequest({}));

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 with invalid tooth numbers', async () => {
      mockAuthenticatedUser();

      const { POST } = await import('@/app/api/v1/cases/route');
      const res = await POST(
        buildRequest({ ...validBody, tooth_numbers: [99] }),
      );

      expect(res.status).toBe(400);
    });

    it('should return 403 for DESIGNER role', async () => {
      mockAuthenticatedUser();
      mockUserSingleFn.mockResolvedValue({ data: { role: 'DESIGNER' }, error: null });

      const { POST } = await import('@/app/api/v1/cases/route');
      const res = await POST(buildRequest(validBody));

      expect(res.status).toBe(403);
    });
  });

  // ---- GET /api/v1/cases ------------------------------------------------
  describe('GET /api/v1/cases', () => {
    it('should return 200 with paginated cases', async () => {
      mockAuthenticatedUser();
      mockCaseRangeFn.mockResolvedValue({
        data: [{ id: 'case-1', title: 'Crown' }],
        error: null,
        count: 1,
      });

      const { GET } = await import('@/app/api/v1/cases/route');
      const res = await GET(buildRequest(null, 'GET'));
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data).toBeDefined();
      expect(json.meta).toBeDefined();
      expect(json.meta.page).toBe(1);
    });

    it('should return 401 when not authenticated', async () => {
      mockUnauthenticated();

      const { GET } = await import('@/app/api/v1/cases/route');
      const res = await GET(buildRequest(null, 'GET'));

      expect(res.status).toBe(401);
    });
  });

  // ---- GET /api/v1/cases/[id] -------------------------------------------
  describe('GET /api/v1/cases/[id]', () => {
    it('should return 200 with case detail', async () => {
      mockAuthenticatedUser();
      mockCaseSingleFn.mockResolvedValue({
        data: { id: 'case-1', title: 'Crown #14', status: 'OPEN' },
        error: null,
      });

      const { GET } = await import('@/app/api/v1/cases/[id]/route');
      const req = buildRequest(null, 'GET', 'http://localhost:3000/api/v1/cases/case-1');
      const res = await GET(req, { params: Promise.resolve({ id: 'case-1' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.id).toBe('case-1');
    });

    it('should return 401 when not authenticated', async () => {
      mockUnauthenticated();

      const { GET } = await import('@/app/api/v1/cases/[id]/route');
      const req = buildRequest(null, 'GET', 'http://localhost:3000/api/v1/cases/case-1');
      const res = await GET(req, { params: Promise.resolve({ id: 'case-1' }) });

      expect(res.status).toBe(401);
    });
  });

  // ---- POST /api/v1/cases/[id]/publish ----------------------------------
  describe('POST /api/v1/cases/[id]/publish', () => {
    it('should return 200 when publishing a draft', async () => {
      mockAuthenticatedUser();
      // First call: ownership check → returns DRAFT case owned by user-1
      // Second call: update → returns OPEN case
      let callCount = 0;
      mockCaseSingleFn.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: { client_id: 'user-1', status: 'DRAFT' }, error: null });
        }
        return Promise.resolve({ data: { id: 'case-1', status: 'OPEN' }, error: null });
      });

      const { POST } = await import('@/app/api/v1/cases/[id]/publish/route');
      const req = buildRequest({}, 'POST');
      const res = await POST(req, { params: Promise.resolve({ id: 'case-1' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.status).toBe('OPEN');
    });
  });

  // ---- POST /api/v1/cases/[id]/cancel -----------------------------------
  describe('POST /api/v1/cases/[id]/cancel', () => {
    it('should return 200 when cancelling a case', async () => {
      mockAuthenticatedUser();
      let callCount = 0;
      mockCaseSingleFn.mockImplementation(() => {
        callCount++;
        if (callCount === 1) {
          return Promise.resolve({ data: { client_id: 'user-1', status: 'OPEN' }, error: null });
        }
        return Promise.resolve({
          data: { id: 'case-1', status: 'CANCELLED', cancellation_reason: 'No longer needed' },
          error: null,
        });
      });

      const { POST } = await import('@/app/api/v1/cases/[id]/cancel/route');
      const req = buildRequest({ reason: 'No longer needed' });
      const res = await POST(req, { params: Promise.resolve({ id: 'case-1' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.status).toBe('CANCELLED');
    });
  });
});
