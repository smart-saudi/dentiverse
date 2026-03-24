import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

import {
  consumeAuthRateLimit,
  getLoginLockout,
  recordFailedLoginAttempt,
  resetAuthAbuseProtection,
  resetLoginFailures,
} from '@/lib/auth-abuse';

const originalEnv = {
  AUTH_RATE_LIMIT_MAX_ATTEMPTS: process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS,
  AUTH_RATE_LIMIT_WINDOW_MS: process.env.AUTH_RATE_LIMIT_WINDOW_MS,
  AUTH_LOGIN_LOCKOUT_THRESHOLD: process.env.AUTH_LOGIN_LOCKOUT_THRESHOLD,
  AUTH_LOGIN_LOCKOUT_DURATION_MS: process.env.AUTH_LOGIN_LOCKOUT_DURATION_MS,
};

function buildRequest(ipAddress = '198.51.100.10'): NextRequest {
  return new NextRequest('http://localhost:3000/api/v1/auth/login', {
    method: 'POST',
    headers: {
      'x-forwarded-for': ipAddress,
    },
  });
}

describe('auth abuse protection', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-03-24T10:00:00.000Z'));
    process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS = '5';
    process.env.AUTH_RATE_LIMIT_WINDOW_MS = '900000';
    process.env.AUTH_LOGIN_LOCKOUT_THRESHOLD = '3';
    process.env.AUTH_LOGIN_LOCKOUT_DURATION_MS = '60000';
    resetAuthAbuseProtection();
  });

  afterEach(() => {
    resetAuthAbuseProtection();
    vi.useRealTimers();

    if (originalEnv.AUTH_RATE_LIMIT_MAX_ATTEMPTS === undefined) {
      delete process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS;
    } else {
      process.env.AUTH_RATE_LIMIT_MAX_ATTEMPTS = originalEnv.AUTH_RATE_LIMIT_MAX_ATTEMPTS;
    }

    if (originalEnv.AUTH_RATE_LIMIT_WINDOW_MS === undefined) {
      delete process.env.AUTH_RATE_LIMIT_WINDOW_MS;
    } else {
      process.env.AUTH_RATE_LIMIT_WINDOW_MS = originalEnv.AUTH_RATE_LIMIT_WINDOW_MS;
    }

    if (originalEnv.AUTH_LOGIN_LOCKOUT_THRESHOLD === undefined) {
      delete process.env.AUTH_LOGIN_LOCKOUT_THRESHOLD;
    } else {
      process.env.AUTH_LOGIN_LOCKOUT_THRESHOLD = originalEnv.AUTH_LOGIN_LOCKOUT_THRESHOLD;
    }

    if (originalEnv.AUTH_LOGIN_LOCKOUT_DURATION_MS === undefined) {
      delete process.env.AUTH_LOGIN_LOCKOUT_DURATION_MS;
    } else {
      process.env.AUTH_LOGIN_LOCKOUT_DURATION_MS =
        originalEnv.AUTH_LOGIN_LOCKOUT_DURATION_MS;
    }
  });

  it('should block requests after the configured limit and recover after the window', () => {
    const request = buildRequest();

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const decision = consumeAuthRateLimit(request, 'login', 'dentist@example.com');
      expect(decision.allowed).toBe(true);
    }

    const blocked = consumeAuthRateLimit(request, 'login', 'dentist@example.com');
    expect(blocked.allowed).toBe(false);
    expect(blocked.code).toBe('TOO_MANY_REQUESTS');
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);

    vi.advanceTimersByTime(900001);

    const recovered = consumeAuthRateLimit(request, 'login', 'dentist@example.com');
    expect(recovered.allowed).toBe(true);
  });

  it('should lock an account after repeated failed logins and clear on success', () => {
    expect(getLoginLockout('dentist@example.com')).toBeNull();

    expect(recordFailedLoginAttempt('dentist@example.com')).toBeNull();
    expect(recordFailedLoginAttempt('dentist@example.com')).toBeNull();

    const lockout = recordFailedLoginAttempt('dentist@example.com');
    expect(lockout?.allowed).toBe(false);
    expect(lockout?.code).toBe('ACCOUNT_LOCKED');
    expect(lockout?.retryAfterSeconds).toBeGreaterThan(0);

    const activeLockout = getLoginLockout('dentist@example.com');
    expect(activeLockout?.allowed).toBe(false);
    expect(activeLockout?.code).toBe('ACCOUNT_LOCKED');

    resetLoginFailures('dentist@example.com');

    expect(getLoginLockout('dentist@example.com')).toBeNull();
  });
});
