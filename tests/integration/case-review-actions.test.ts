import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockAuth = {
  getUser: vi.fn(),
};

const mockAuditLog = vi.fn();

const mockCaseLookupSingle = vi.fn();
const mockCaseLookupEq = vi.fn().mockReturnValue({ single: mockCaseLookupSingle });
const mockCaseLookupSelect = vi.fn().mockReturnValue({ eq: mockCaseLookupEq });

const mockCaseUpdateSingle = vi.fn();
const mockCaseUpdateSelect = vi.fn().mockReturnValue({ single: mockCaseUpdateSingle });
const mockCaseUpdateEq = vi.fn().mockReturnValue({ select: mockCaseUpdateSelect });
const mockCaseUpdate = vi.fn().mockReturnValue({ eq: mockCaseUpdateEq });

const mockDesignVersionLimit = vi.fn();
const mockDesignVersionOrder = vi.fn().mockReturnValue({ limit: mockDesignVersionLimit });
const mockDesignVersionEqSecond = vi
  .fn()
  .mockReturnValue({ order: mockDesignVersionOrder });
const mockDesignVersionEqFirst = vi
  .fn()
  .mockReturnValue({ eq: mockDesignVersionEqSecond });
const mockDesignVersionUpdate = vi.fn().mockReturnValue({ eq: mockDesignVersionEqFirst });

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: mockAuth,
    from: vi.fn((table: string) => {
      if (table === 'cases') {
        return {
          select: mockCaseLookupSelect,
          update: mockCaseUpdate,
        };
      }

      return {
        update: mockDesignVersionUpdate,
      };
    }),
  })),
}));

vi.mock('@/services/audit.service', () => ({
  AuditService: vi.fn().mockImplementation(() => ({
    log: mockAuditLog,
  })),
  extractRequestMeta: vi.fn(() => ({
    ip_address: null,
    user_agent: null,
  })),
}));

function buildRequest(
  body: unknown,
  url = 'http://localhost:3000/api/v1/cases/case-1/action',
): NextRequest {
  return new NextRequest(url, {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

const mockContext = {
  params: Promise.resolve({ id: 'case-1' }),
};

describe('Case review action routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth.getUser.mockResolvedValue({
      data: { user: { id: 'user-1', email: 'client@example.com' } },
      error: null,
    });
  });

  it('should approve the latest design for a case (200)', async () => {
    mockCaseLookupSingle.mockResolvedValue({
      data: { client_id: 'user-1', status: 'REVIEW' },
      error: null,
    });
    mockDesignVersionLimit.mockResolvedValue({ error: null });
    mockCaseUpdateSingle.mockResolvedValue({
      data: { id: 'case-1', status: 'APPROVED' },
      error: null,
    });

    const { POST } = await import('@/app/api/v1/cases/[id]/approve/route');
    const res = await POST(buildRequest({}), mockContext);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.status).toBe('APPROVED');
    expect(mockAuditLog).toHaveBeenCalled();
  });

  it('should request a revision for the latest design (200)', async () => {
    mockCaseLookupSingle.mockResolvedValue({
      data: {
        client_id: 'user-1',
        status: 'REVIEW',
        max_revisions: 2,
        revision_count: 0,
      },
      error: null,
    });
    mockDesignVersionLimit.mockResolvedValue({ error: null });
    mockCaseUpdateSingle.mockResolvedValue({
      data: { id: 'case-1', status: 'REVISION', revision_count: 1 },
      error: null,
    });

    const { POST } = await import('@/app/api/v1/cases/[id]/request-revision/route');
    const res = await POST(
      buildRequest({
        feedback: 'Please refine the occlusal anatomy and contact points.',
      }),
      mockContext,
    );
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.status).toBe('REVISION');
    expect(json.data.revision_count).toBe(1);
    expect(mockAuditLog).toHaveBeenCalled();
  });
});
