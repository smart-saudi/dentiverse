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
  range: mockRangeFn,
}));
const mockSelectFn = vi.fn().mockImplementation(() => ({
  eq: mockEqFn,
  order: mockOrderFn,
  single: mockSingleFn,
}));
const mockInsertFn = vi.fn().mockReturnValue({ select: mockSelectFn });
const mockUpdateFn = vi.fn().mockReturnValue({ eq: mockEqFn });

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
      mockSingleFn.mockResolvedValue({
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
  });

  // ---- GET /api/v1/cases ------------------------------------------------
  describe('GET /api/v1/cases', () => {
    it('should return 200 with paginated cases', async () => {
      mockAuthenticatedUser();
      mockRangeFn.mockResolvedValue({
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
      mockSingleFn.mockResolvedValue({
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
      // eq().select().single() chain for update
      mockEqFn.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { id: 'case-1', status: 'OPEN' },
            error: null,
          }),
        }),
        single: mockSingleFn,
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
      mockEqFn.mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'case-1',
              status: 'CANCELLED',
              cancellation_reason: 'No longer needed',
            },
            error: null,
          }),
        }),
        single: mockSingleFn,
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
