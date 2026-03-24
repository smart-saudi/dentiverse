import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const mockAuth = {
  refreshSession: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: mockAuth,
  })),
}));

function buildRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('POST /api/v1/auth/refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should refresh a session (200)', async () => {
    mockAuth.refreshSession.mockResolvedValue({
      data: {
        session: {
          access_token: 'access-123',
          refresh_token: 'refresh-456',
          expires_in: 3600,
          expires_at: 1_764_000_000,
        },
      },
      error: null,
    });

    const { POST } = await import('@/app/api/v1/auth/refresh/route');
    const res = await POST(buildRequest({ refresh_token: 'refresh-123' }));
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.data.access_token).toBe('access-123');
    expect(json.data.refresh_token).toBe('refresh-456');
  });

  it('should return 400 when refresh_token is missing', async () => {
    const { POST } = await import('@/app/api/v1/auth/refresh/route');
    const res = await POST(buildRequest({}));

    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('VALIDATION_ERROR');
  });
});
