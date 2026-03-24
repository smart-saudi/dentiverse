import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import { resetAuthAbuseProtection } from '@/lib/auth-abuse';

const mockAuth = {
  refreshSession: vi.fn(),
};

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: mockAuth,
  })),
}));

function buildRequest(body: unknown, headers: HeadersInit = {}): NextRequest {
  return new NextRequest('http://localhost:3000/api/v1/auth/refresh', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

describe('POST /api/v1/auth/refresh', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS = '5';
    process.env.AUTH_RATE_LIMIT_WINDOW_MS = '900000';
    resetAuthAbuseProtection();
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

  it('should return 429 after too many refresh attempts', async () => {
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

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const res = await POST(
        buildRequest(
          { refresh_token: 'refresh-123' },
          { 'x-forwarded-for': '198.51.100.40' },
        ),
      );
      expect(res.status).toBe(200);
    }

    const throttled = await POST(
      buildRequest(
        { refresh_token: 'refresh-123' },
        { 'x-forwarded-for': '198.51.100.40' },
      ),
    );

    expect(throttled.status).toBe(429);
    expect(mockAuth.refreshSession).toHaveBeenCalledTimes(5);
    const json = await throttled.json();
    expect(json.code).toBe('TOO_MANY_REQUESTS');
  });
});
