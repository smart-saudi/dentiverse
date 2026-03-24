import { createHash } from 'node:crypto';

import { NextResponse, type NextRequest } from 'next/server';

const DEFAULT_RATE_LIMIT_MAX_ATTEMPTS = 5;
const DEFAULT_RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const DEFAULT_LOGIN_LOCKOUT_THRESHOLD = 10;
const DEFAULT_LOGIN_LOCKOUT_DURATION_MS = 30 * 60 * 1000;

export type AuthAbuseScope = 'login' | 'forgot-password' | 'refresh';

export interface AuthAbuseDecision {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetAt: number;
  retryAfterSeconds?: number;
  code?: 'TOO_MANY_REQUESTS' | 'ACCOUNT_LOCKED';
  message?: string;
}

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface LoginFailureEntry {
  count: number;
  firstFailureAt: number;
  lockedUntil: number | null;
}

interface AuthAbuseStore {
  rateLimits: Map<string, RateLimitEntry>;
  loginFailures: Map<string, LoginFailureEntry>;
}

interface AuthAbuseConfig {
  rateLimitMaxAttempts: number;
  rateLimitWindowMs: number;
  loginLockoutThreshold: number;
  loginLockoutDurationMs: number;
}

/**
 * Read auth-abuse configuration from the environment with safe defaults.
 *
 * @returns Parsed auth abuse protection settings
 */
export function getAuthAbuseConfig(): AuthAbuseConfig {
  return {
    rateLimitMaxAttempts: parsePositiveIntEnv(
      'AUTH_RATE_LIMIT_MAX_ATTEMPTS',
      DEFAULT_RATE_LIMIT_MAX_ATTEMPTS,
    ),
    rateLimitWindowMs: parsePositiveIntEnv(
      'AUTH_RATE_LIMIT_WINDOW_MS',
      DEFAULT_RATE_LIMIT_WINDOW_MS,
    ),
    loginLockoutThreshold: parsePositiveIntEnv(
      'AUTH_LOGIN_LOCKOUT_THRESHOLD',
      DEFAULT_LOGIN_LOCKOUT_THRESHOLD,
    ),
    loginLockoutDurationMs: parsePositiveIntEnv(
      'AUTH_LOGIN_LOCKOUT_DURATION_MS',
      DEFAULT_LOGIN_LOCKOUT_DURATION_MS,
    ),
  };
}

/**
 * Consume one request attempt for an auth endpoint and return the current decision.
 *
 * @param request - Incoming request used to fingerprint the caller
 * @param scope - Auth endpoint scope being protected
 * @param identifier - Optional request identifier (email or refresh token)
 * @returns Allow/block decision with rate-limit metadata
 */
export function consumeAuthRateLimit(
  request: NextRequest,
  scope: AuthAbuseScope,
  identifier?: string | null,
): AuthAbuseDecision {
  const now = Date.now();
  const config = getAuthAbuseConfig();
  const store = getAuthAbuseStore();
  const key = buildRateLimitKey(request, scope, identifier);
  const existing = store.rateLimits.get(key);

  const entry =
    existing && existing.resetAt > now
      ? existing
      : {
          count: 0,
          resetAt: now + config.rateLimitWindowMs,
        };

  entry.count += 1;
  store.rateLimits.set(key, entry);

  if (entry.count > config.rateLimitMaxAttempts) {
    return {
      allowed: false,
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts. Please try again later.',
      limit: config.rateLimitMaxAttempts,
      remaining: 0,
      resetAt: entry.resetAt,
      retryAfterSeconds: getRetryAfterSeconds(entry.resetAt, now),
    };
  }

  return {
    allowed: true,
    limit: config.rateLimitMaxAttempts,
    remaining: Math.max(config.rateLimitMaxAttempts - entry.count, 0),
    resetAt: entry.resetAt,
  };
}

/**
 * Return the current login lockout state for an email, if any.
 *
 * @param email - Email address used for login
 * @returns Active lockout decision or null when the account is not locked
 */
export function getLoginLockout(email: string): AuthAbuseDecision | null {
  const normalizedEmail = normalizeIdentifier(email);

  if (!normalizedEmail) {
    return null;
  }

  const now = Date.now();
  const store = getAuthAbuseStore();
  const key = buildLoginFailureKey(normalizedEmail);
  const entry = store.loginFailures.get(key);

  if (!entry) {
    return null;
  }

  if (entry.lockedUntil && entry.lockedUntil > now) {
    return buildLockoutDecision(entry.lockedUntil, now);
  }

  if (entry.lockedUntil && entry.lockedUntil <= now) {
    store.loginFailures.delete(key);
    return null;
  }

  if (entry.firstFailureAt + getAuthAbuseConfig().rateLimitWindowMs <= now) {
    store.loginFailures.delete(key);
  }

  return null;
}

/**
 * Record a failed login attempt for an email address.
 *
 * @param email - Email address used for login
 * @returns Lockout decision when the threshold is reached, otherwise null
 */
export function recordFailedLoginAttempt(email: string): AuthAbuseDecision | null {
  const normalizedEmail = normalizeIdentifier(email);

  if (!normalizedEmail) {
    return null;
  }

  const now = Date.now();
  const config = getAuthAbuseConfig();
  const store = getAuthAbuseStore();
  const key = buildLoginFailureKey(normalizedEmail);
  const existing = store.loginFailures.get(key);

  if (existing?.lockedUntil && existing.lockedUntil > now) {
    return buildLockoutDecision(existing.lockedUntil, now);
  }

  const entry =
    existing && existing.firstFailureAt + config.rateLimitWindowMs > now
      ? existing
      : {
          count: 0,
          firstFailureAt: now,
          lockedUntil: null,
        };

  entry.count += 1;

  if (entry.count >= config.loginLockoutThreshold) {
    entry.lockedUntil = now + config.loginLockoutDurationMs;
    store.loginFailures.set(key, entry);
    return buildLockoutDecision(entry.lockedUntil, now);
  }

  store.loginFailures.set(key, entry);
  return null;
}

/**
 * Clear any failed-login history for an email address after successful auth.
 *
 * @param email - Email address whose failure history should be reset
 */
export function resetLoginFailures(email: string): void {
  const normalizedEmail = normalizeIdentifier(email);

  if (!normalizedEmail) {
    return;
  }

  getAuthAbuseStore().loginFailures.delete(buildLoginFailureKey(normalizedEmail));
}

/**
 * Reset the in-memory auth abuse store.
 *
 * Intended for tests and local resets only.
 */
export function resetAuthAbuseProtection(): void {
  const store = getAuthAbuseStore();
  store.rateLimits.clear();
  store.loginFailures.clear();
}

/**
 * Build a standardized 429 response for auth abuse protection failures.
 *
 * @param decision - Blocked auth abuse decision
 * @returns JSON response with rate-limit metadata headers
 */
export function createAuthAbuseResponse(decision: AuthAbuseDecision): NextResponse {
  const headers = new Headers({
    'Retry-After': String(decision.retryAfterSeconds ?? 0),
    'X-RateLimit-Limit': String(decision.limit),
    'X-RateLimit-Remaining': String(decision.remaining),
    'X-RateLimit-Reset': String(decision.resetAt),
  });

  return NextResponse.json(
    {
      code: decision.code ?? 'TOO_MANY_REQUESTS',
      message:
        decision.message ?? 'Too many authentication attempts. Please try again later.',
    },
    {
      status: 429,
      headers,
    },
  );
}

function parsePositiveIntEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];

  if (!rawValue) {
    return fallback;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  return Number.isFinite(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
}

function getAuthAbuseStore(): AuthAbuseStore {
  const authAbuseGlobal = globalThis as typeof globalThis & {
    __dentiverseAuthAbuseStore?: AuthAbuseStore;
  };

  if (!authAbuseGlobal.__dentiverseAuthAbuseStore) {
    authAbuseGlobal.__dentiverseAuthAbuseStore = {
      rateLimits: new Map<string, RateLimitEntry>(),
      loginFailures: new Map<string, LoginFailureEntry>(),
    };
  }

  return authAbuseGlobal.__dentiverseAuthAbuseStore;
}

function buildRateLimitKey(
  request: NextRequest,
  scope: AuthAbuseScope,
  identifier?: string | null,
): string {
  const ipAddress = extractIpAddress(request);
  const normalizedIdentifier = normalizeIdentifier(identifier);
  const keyParts = [scope, hashValue(ipAddress)];

  if (normalizedIdentifier) {
    keyParts.push(hashValue(normalizedIdentifier));
  }

  return keyParts.join(':');
}

function buildLoginFailureKey(email: string): string {
  return `login-failure:${hashValue(email)}`;
}

function buildLockoutDecision(lockedUntil: number, now: number): AuthAbuseDecision {
  return {
    allowed: false,
    code: 'ACCOUNT_LOCKED',
    message: 'Too many failed login attempts. Please try again later.',
    limit: getAuthAbuseConfig().loginLockoutThreshold,
    remaining: 0,
    resetAt: lockedUntil,
    retryAfterSeconds: getRetryAfterSeconds(lockedUntil, now),
  };
}

function extractIpAddress(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwardedFor ?? request.headers.get('x-real-ip') ?? 'unknown';
}

function normalizeIdentifier(identifier?: string | null): string | null {
  const normalized = identifier?.trim().toLowerCase();
  return normalized ? normalized : null;
}

function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function getRetryAfterSeconds(resetAt: number, now: number): number {
  return Math.max(Math.ceil((resetAt - now) / 1000), 1);
}
