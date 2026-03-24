import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { resetAuthAbuseProtection } from '@/lib/auth-abuse';

// ---------------------------------------------------------------------------
// Mocks — Supabase client returned by createServerSupabaseClient()
// ---------------------------------------------------------------------------

const mockAuth = {
  signUp: vi.fn(),
  signInWithPassword: vi.fn(),
  signOut: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  updateUser: vi.fn(),
  getUser: vi.fn(),
};

const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    auth: mockAuth,
    from: mockFrom,
  })),
}));

// ---------------------------------------------------------------------------
// Helper to build a NextRequest with a JSON body
// ---------------------------------------------------------------------------

function buildRequest(
  body: unknown,
  method = 'POST',
  headers: HeadersInit = {},
): NextRequest {
  return new NextRequest('http://localhost:3000/api/v1/auth/test', {
    method,
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json', ...headers },
  });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Auth API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS = '5';
    process.env.AUTH_RATE_LIMIT_WINDOW_MS = '900000';
    process.env.AUTH_LOGIN_LOCKOUT_THRESHOLD = '10';
    process.env.AUTH_LOGIN_LOCKOUT_DURATION_MS = '1800000';
    resetAuthAbuseProtection();
  });

  // ---- POST /api/v1/auth/register ---------------------------------------
  describe('POST /api/v1/auth/register', () => {
    const validBody = {
      email: 'dentist@example.com',
      password: 'SecureP@ss1',
      full_name: 'Dr. Sarah Chen',
      role: 'DENTIST',
    };

    it('should return 201 with user data on valid registration', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: {
          user: { id: 'user-1', email: 'dentist@example.com' },
          session: { access_token: 'token-123' },
        },
        error: null,
      });

      const singleFn = vi.fn().mockResolvedValue({
        data: {
          id: 'user-1',
          email: 'dentist@example.com',
          full_name: 'Dr. Sarah Chen',
          role: 'DENTIST',
        },
        error: null,
      });
      mockFrom.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({ single: singleFn }),
        }),
      });

      const { POST } = await import('@/app/api/v1/auth/register/route');
      const req = buildRequest(validBody);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.data.user).toBeDefined();
      expect(json.data.user.email).toBe('dentist@example.com');
    });

    it('should return 400 on validation error (missing fields)', async () => {
      const { POST } = await import('@/app/api/v1/auth/register/route');
      const req = buildRequest({});
      const res = await POST(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when ADMIN role is used', async () => {
      const { POST } = await import('@/app/api/v1/auth/register/route');
      const req = buildRequest({ ...validBody, role: 'ADMIN' });
      const res = await POST(req);

      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe('VALIDATION_ERROR');
    });

    it('should return 409 when email is already registered', async () => {
      mockAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered', status: 400 },
      });

      const { POST } = await import('@/app/api/v1/auth/register/route');
      const req = buildRequest(validBody);
      const res = await POST(req);

      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.code).toBe('CONFLICT');
    });
  });

  // ---- POST /api/v1/auth/login ------------------------------------------
  describe('POST /api/v1/auth/login', () => {
    const validBody = {
      email: 'dentist@example.com',
      password: 'SecureP@ss1',
    };

    it('should return 200 with user and tokens on valid login', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user-1', email: 'dentist@example.com' },
          session: {
            access_token: 'access-123',
            refresh_token: 'refresh-123',
            expires_at: 1234567890,
          },
        },
        error: null,
      });

      const { POST } = await import('@/app/api/v1/auth/login/route');
      const req = buildRequest(validBody);
      const res = await POST(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.data.user).toBeDefined();
      expect(json.data.access_token).toBe('access-123');
      expect(json.data.refresh_token).toBe('refresh-123');
    });

    it('should return 400 on validation error', async () => {
      const { POST } = await import('@/app/api/v1/auth/login/route');
      const req = buildRequest({ email: 'bad' });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('should return 401 on invalid credentials', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', status: 400 },
      });

      const { POST } = await import('@/app/api/v1/auth/login/route');
      const req = buildRequest(validBody);
      const res = await POST(req);

      expect(res.status).toBe(401);
      const json = await res.json();
      expect(json.code).toBe('UNAUTHORIZED');
    });

    it('should return 429 after too many login attempts from the same client', async () => {
      mockAuth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user-1', email: 'dentist@example.com' },
          session: {
            access_token: 'access-123',
            refresh_token: 'refresh-123',
            expires_at: 1234567890,
          },
        },
        error: null,
      });

      const { POST } = await import('@/app/api/v1/auth/login/route');

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const res = await POST(
          buildRequest(validBody, 'POST', { 'x-forwarded-for': '198.51.100.20' }),
        );
        expect(res.status).toBe(200);
      }

      const throttled = await POST(
        buildRequest(validBody, 'POST', { 'x-forwarded-for': '198.51.100.20' }),
      );

      expect(throttled.status).toBe(429);
      expect(mockAuth.signInWithPassword).toHaveBeenCalledTimes(5);
      expect(throttled.headers.get('retry-after')).toBeTruthy();
      const json = await throttled.json();
      expect(json.code).toBe('TOO_MANY_REQUESTS');
    });

    it('should lock an account after repeated failed logins and block further attempts', async () => {
      process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS = '20';
      process.env.AUTH_LOGIN_LOCKOUT_THRESHOLD = '3';
      process.env.AUTH_LOGIN_LOCKOUT_DURATION_MS = '60000';
      mockAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials', status: 400 },
      });

      const { POST } = await import('@/app/api/v1/auth/login/route');

      for (let attempt = 0; attempt < 2; attempt += 1) {
        const res = await POST(
          buildRequest(validBody, 'POST', { 'x-forwarded-for': '198.51.100.21' }),
        );
        expect(res.status).toBe(401);
      }

      const locked = await POST(
        buildRequest(validBody, 'POST', { 'x-forwarded-for': '198.51.100.21' }),
      );

      expect(locked.status).toBe(429);
      const lockedJson = await locked.json();
      expect(lockedJson.code).toBe('ACCOUNT_LOCKED');

      mockAuth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: 'user-1', email: 'dentist@example.com' },
          session: {
            access_token: 'access-123',
            refresh_token: 'refresh-123',
            expires_at: 1234567890,
          },
        },
        error: null,
      });

      const stillLocked = await POST(
        buildRequest(validBody, 'POST', { 'x-forwarded-for': '198.51.100.21' }),
      );

      expect(stillLocked.status).toBe(429);
      expect(mockAuth.signInWithPassword).toHaveBeenCalledTimes(3);
    });

    it('should clear failed login history after a successful login', async () => {
      process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS = '20';
      process.env.AUTH_LOGIN_LOCKOUT_THRESHOLD = '3';

      mockAuth.signInWithPassword
        .mockResolvedValueOnce({
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials', status: 400 },
        })
        .mockResolvedValueOnce({
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials', status: 400 },
        })
        .mockResolvedValueOnce({
          data: {
            user: { id: 'user-1', email: 'dentist@example.com' },
            session: {
              access_token: 'access-123',
              refresh_token: 'refresh-123',
              expires_at: 1234567890,
            },
          },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { user: null, session: null },
          error: { message: 'Invalid login credentials', status: 400 },
        });

      const { POST } = await import('@/app/api/v1/auth/login/route');
      const headers = { 'x-forwarded-for': '198.51.100.22' };

      const first = await POST(buildRequest(validBody, 'POST', headers));
      const second = await POST(buildRequest(validBody, 'POST', headers));
      const third = await POST(buildRequest(validBody, 'POST', headers));
      const fourth = await POST(buildRequest(validBody, 'POST', headers));

      expect(first.status).toBe(401);
      expect(second.status).toBe(401);
      expect(third.status).toBe(200);
      expect(fourth.status).toBe(401);
    });
  });

  // ---- POST /api/v1/auth/logout -----------------------------------------
  describe('POST /api/v1/auth/logout', () => {
    it('should return 200 on successful logout', async () => {
      mockAuth.signOut.mockResolvedValue({ error: null });

      const { POST } = await import('@/app/api/v1/auth/logout/route');
      const req = buildRequest({});
      const res = await POST(req);

      expect(res.status).toBe(200);
    });

    it('should return 500 when signOut fails', async () => {
      mockAuth.signOut.mockResolvedValue({
        error: { message: 'Failed to sign out' },
      });

      const { POST } = await import('@/app/api/v1/auth/logout/route');
      const req = buildRequest({});
      const res = await POST(req);

      expect(res.status).toBe(500);
    });
  });

  // ---- POST /api/v1/auth/forgot-password --------------------------------
  describe('POST /api/v1/auth/forgot-password', () => {
    it('should return 200 regardless of whether email exists', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const { POST } = await import('@/app/api/v1/auth/forgot-password/route');
      const req = buildRequest({ email: 'anyone@example.com' });
      const res = await POST(req);

      expect(res.status).toBe(200);
    });

    it('should return 400 on invalid email', async () => {
      const { POST } = await import('@/app/api/v1/auth/forgot-password/route');
      const req = buildRequest({ email: 'not-valid' });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('should return 429 after too many password reset attempts', async () => {
      mockAuth.resetPasswordForEmail.mockResolvedValue({
        data: {},
        error: null,
      });

      const { POST } = await import('@/app/api/v1/auth/forgot-password/route');

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const res = await POST(
          buildRequest({ email: 'anyone@example.com' }, 'POST', {
            'x-forwarded-for': '198.51.100.30',
          }),
        );
        expect(res.status).toBe(200);
      }

      const throttled = await POST(
        buildRequest({ email: 'anyone@example.com' }, 'POST', {
          'x-forwarded-for': '198.51.100.30',
        }),
      );

      expect(throttled.status).toBe(429);
      expect(mockAuth.resetPasswordForEmail).toHaveBeenCalledTimes(5);
      const json = await throttled.json();
      expect(json.code).toBe('TOO_MANY_REQUESTS');
    });
  });

  // ---- POST /api/v1/auth/reset-password ---------------------------------
  describe('POST /api/v1/auth/reset-password', () => {
    it('should return 200 on successful password reset', async () => {
      mockAuth.updateUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const { POST } = await import('@/app/api/v1/auth/reset-password/route');
      const req = buildRequest({
        token: 'valid-token',
        password: 'NewSecure1!',
      });
      const res = await POST(req);

      expect(res.status).toBe(200);
    });

    it('should return 400 on weak password', async () => {
      const { POST } = await import('@/app/api/v1/auth/reset-password/route');
      const req = buildRequest({ token: 'valid-token', password: 'weak' });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('should return 400 on missing token', async () => {
      const { POST } = await import('@/app/api/v1/auth/reset-password/route');
      const req = buildRequest({ password: 'NewSecure1!' });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });

    it('should return 400 when token is expired', async () => {
      mockAuth.updateUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Token expired' },
      });

      const { POST } = await import('@/app/api/v1/auth/reset-password/route');
      const req = buildRequest({
        token: 'expired-token',
        password: 'NewSecure1!',
      });
      const res = await POST(req);

      expect(res.status).toBe(400);
    });
  });
});
