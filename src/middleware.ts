import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

import { isUpstreamServiceUnavailableError } from '@/lib/errors';
import type { SupabaseCookieToSet } from '@/lib/supabase/types';

/** Routes that do not require authentication. */
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/designers',
];

/** API routes that do not require authentication. */
const PUBLIC_API_PREFIXES = [
  '/api/v1/auth/register',
  '/api/v1/auth/login',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/webhooks/',
  '/api/v1/designers',
];

/**
 * Next.js middleware — runs on every matched request.
 *
 * 1. Refreshes the Supabase auth session (keeps cookies alive).
 * 2. Redirects unauthenticated users away from protected routes.
 * 3. Redirects authenticated users away from auth pages.
 *
 * @param request - Incoming Next.js request
 * @returns NextResponse (possibly a redirect)
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isStaticAssetPath(pathname) || isPublicApiPath(pathname)) {
    return NextResponse.next({ request });
  }

  const isPublicRoute = isPublicPagePath(pathname);
  const isAuthRoute = isAuthPagePath(pathname);

  if (isPublicRoute && !isAuthRoute) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: SupabaseCookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  let user = null;
  try {
    const {
      data: { user: authenticatedUser },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError && isUpstreamServiceUnavailableError(authError)) {
      return handleAuthAvailabilityFailure(request, pathname, isAuthRoute);
    }

    user = authenticatedUser;
  } catch (error) {
    if (isUpstreamServiceUnavailableError(error)) {
      return handleAuthAvailabilityFailure(request, pathname, isAuthRoute);
    }

    throw error;
  }

  // Redirect authenticated users away from auth pages → dashboard
  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Redirect unauthenticated users to login from protected routes
  if (!user && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

function isPublicApiPath(pathname: string): boolean {
  return PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isStaticAssetPath(pathname: string): boolean {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  );
}

function isPublicPagePath(pathname: string): boolean {
  return PUBLIC_ROUTES.includes(pathname) || pathname.startsWith('/designers/');
}

function isAuthPagePath(pathname: string): boolean {
  return ['/login', '/register', '/forgot-password'].includes(pathname);
}

function handleAuthAvailabilityFailure(
  request: NextRequest,
  pathname: string,
  isAuthRoute: boolean,
) {
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      {
        code: 'SERVICE_UNAVAILABLE',
        message:
          'The authentication service is temporarily unavailable. Please try again shortly.',
      },
      { status: 503 },
    );
  }

  if (isAuthRoute) {
    return NextResponse.next({ request });
  }

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('redirectTo', pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
