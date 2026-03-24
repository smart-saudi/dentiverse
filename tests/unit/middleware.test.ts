import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGetUser = vi.fn();
const mockCreateServerClient = vi.fn();
const mockNext = vi.fn();
const mockRedirect = vi.fn();
const mockJson = vi.fn();

vi.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient,
}));

vi.mock('next/server', () => ({
  NextResponse: {
    next: mockNext,
    redirect: mockRedirect,
    json: mockJson,
  },
}));

interface MockRequest {
  nextUrl: {
    pathname: string;
    clone: () => URL;
  };
  cookies: {
    getAll: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
  };
}

function buildRequest(pathname: string): MockRequest {
  const url = new URL(`http://localhost:3000${pathname}`);

  return {
    nextUrl: {
      pathname,
      clone: () => new URL(url.toString()),
    },
    cookies: {
      getAll: vi.fn(() => []),
      set: vi.fn(),
    },
  };
}

describe('Root middleware', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();

    mockGetUser.mockResolvedValue({ data: { user: null }, error: null });
    mockCreateServerClient.mockReturnValue({
      auth: {
        getUser: mockGetUser,
      },
    });

    mockNext.mockImplementation(({ request } = {}) => ({
      type: 'next',
      request,
      cookies: {
        set: vi.fn(),
      },
    }));

    mockRedirect.mockImplementation((url: URL) => ({
      type: 'redirect',
      url: url.toString(),
      cookies: {
        set: vi.fn(),
      },
    }));

    mockJson.mockImplementation((body: unknown, init?: { status?: number }) => ({
      type: 'json',
      body,
      status: init?.status ?? 200,
      cookies: {
        set: vi.fn(),
      },
    }));
  });

  it('should not refresh auth for public marketplace routes', async () => {
    const { middleware } = await import('../../src/middleware');

    const response = await middleware(buildRequest('/designers') as never);

    expect(mockCreateServerClient).not.toHaveBeenCalled();
    expect(mockGetUser).not.toHaveBeenCalled();
    expect(response).toMatchObject({ type: 'next' });
  });

  it('should allow auth pages to render when auth refresh fails', async () => {
    mockGetUser.mockRejectedValue(new TypeError('fetch failed'));

    const { middleware } = await import('../../src/middleware');

    const response = await middleware(buildRequest('/login') as never);

    expect(mockCreateServerClient).toHaveBeenCalledOnce();
    expect(mockGetUser).toHaveBeenCalledOnce();
    expect(mockRedirect).not.toHaveBeenCalled();
    expect(response).toMatchObject({ type: 'next' });
  });

  it('should redirect unauthenticated protected routes to login', async () => {
    const { middleware } = await import('../../src/middleware');

    const response = await middleware(buildRequest('/dashboard') as never);

    expect(mockRedirect).toHaveBeenCalledOnce();
    expect(response).toMatchObject({
      type: 'redirect',
      url: 'http://localhost:3000/login?redirectTo=%2Fdashboard',
    });
  });
});
