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

const ADMIN_ROUTE_PREFIX = '/admin';
const ADMIN_API_PREFIX = '/api/v1/admin';

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
  const isAdminRoute = isAdminPagePath(pathname);
  const isAdminApiRoute = isAdminApiPath(pathname);

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

  let accessProfile: { role: string; is_active: boolean } | null = null;
  if (user) {
    try {
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role, is_active')
        .eq('id', user.id)
        .single();

      if (profileError && isUpstreamServiceUnavailableError(profileError)) {
        return handleAuthAvailabilityFailure(request, pathname, isAuthRoute);
      }

      if (!profileError && profile) {
        accessProfile = profile;
      }
    } catch (error) {
      if (isUpstreamServiceUnavailableError(error)) {
        return handleAuthAvailabilityFailure(request, pathname, isAuthRoute);
      }

      throw error;
    }
  }

  if (user && accessProfile && !accessProfile.is_active) {
    return handleInactiveAccount(request, pathname, isAuthRoute);
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

  if (user && isAdminRoute && accessProfile?.role !== 'ADMIN') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (user && isAdminApiRoute && accessProfile?.role !== 'ADMIN') {
    return NextResponse.json(
      {
        code: 'FORBIDDEN',
        message: 'Admin access is required for this resource.',
      },
      { status: 403 },
    );
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

function isAdminPagePath(pathname: string): boolean {
  return pathname === ADMIN_ROUTE_PREFIX || pathname.startsWith(`${ADMIN_ROUTE_PREFIX}/`);
}

function isAdminApiPath(pathname: string): boolean {
  return pathname === ADMIN_API_PREFIX || pathname.startsWith(`${ADMIN_API_PREFIX}/`);
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

function handleInactiveAccount(
  request: NextRequest,
  pathname: string,
  isAuthRoute: boolean,
) {
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      {
        code: 'ACCOUNT_DISABLED',
        message: 'This account has been deactivated. Contact support.',
      },
      { status: 403 },
    );
  }

  if (isAuthRoute) {
    return NextResponse.next({ request });
  }

  const url = request.nextUrl.clone();
  url.pathname = '/login';
  url.searchParams.set('disabled', '1');
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
