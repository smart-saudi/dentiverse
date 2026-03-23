import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/server
vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => ({
      cookies: {
        set: vi.fn(),
      },
    })),
  },
}));

// Mock @supabase/ssr
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: { getUser: vi.fn(() => ({ data: { user: null }, error: null })) },
  })),
}));

describe('Supabase Middleware Client', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('should export an updateSession function', async () => {
    const { updateSession } = await import('@/lib/supabase/middleware');
    expect(updateSession).toBeDefined();
    expect(typeof updateSession).toBe('function');
  });

  it('should return a NextResponse', async () => {
    const { updateSession } = await import('@/lib/supabase/middleware');
    const mockRequest = {
      cookies: {
        getAll: vi.fn(() => []),
        set: vi.fn(),
      },
      nextUrl: { pathname: '/dashboard' },
    };
    // updateSession accepts a NextRequest-like object
    const response = await updateSession(mockRequest as never);
    expect(response).toBeDefined();
  });
});
