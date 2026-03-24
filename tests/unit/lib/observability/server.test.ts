import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NextRequest } from 'next/server';

const sentryMocks = vi.hoisted(() => ({
  captureException: vi.fn(),
  setTag: vi.fn(),
  setUser: vi.fn(),
  setContext: vi.fn(),
}));

vi.mock('@sentry/nextjs', () => ({
  withScope: (
    callback: (scope: {
      setTag: typeof sentryMocks.setTag;
      setUser: typeof sentryMocks.setUser;
      setContext: typeof sentryMocks.setContext;
    }) => void,
  ) => {
    callback({
      setTag: sentryMocks.setTag,
      setUser: sentryMocks.setUser,
      setContext: sentryMocks.setContext,
    });
  },
  captureException: sentryMocks.captureException,
  captureRequestError: vi.fn(),
}));

import {
  buildRequestLogContext,
  captureServerException,
  logServerEvent,
} from '@/lib/observability/server';

describe('observability server helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should build request context from forwarded headers', () => {
    const request = new NextRequest('http://localhost:3000/api/v1/payments', {
      method: 'POST',
      headers: {
        'x-forwarded-for': '198.51.100.50, 10.0.0.1',
        'x-request-id': 'req_test_123',
        'user-agent': 'vitest',
      },
    });

    const context = buildRequestLogContext(request, '/api/v1/payments', {
      userId: 'user-1',
    });

    expect(context).toEqual({
      route: '/api/v1/payments',
      requestId: 'req_test_123',
      method: 'POST',
      ipAddress: '198.51.100.50',
      userAgent: 'vitest',
      userId: 'user-1',
    });
  });

  it('should emit structured error logs and forward exceptions to Sentry', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    captureServerException(
      new Error('Stripe failed'),
      'Stripe create payment intent failed',
      {
        request: {
          route: '/api/v1/payments',
          requestId: 'req_test_456',
          method: 'POST',
          userId: 'user-2',
          ipAddress: '198.51.100.60',
          userAgent: 'vitest',
        },
        context: {
          payment_id: 'pay-1',
          provider: 'stripe',
        },
      },
    );

    expect(sentryMocks.captureException).toHaveBeenCalledTimes(1);
    expect(sentryMocks.setTag).toHaveBeenCalledWith('request_id', 'req_test_456');
    expect(sentryMocks.setUser).toHaveBeenCalledWith({ id: 'user-2' });
    expect(sentryMocks.setContext).toHaveBeenCalledWith('observability', {
      payment_id: 'pay-1',
      provider: 'stripe',
    });

    const [payload] = consoleError.mock.calls[0] ?? [];
    expect(typeof payload).toBe('string');

    const parsed = JSON.parse(payload as string) as {
      level: string;
      route: string;
      request_id: string;
      message: string;
      context: Record<string, string>;
    };

    expect(parsed.level).toBe('error');
    expect(parsed.route).toBe('/api/v1/payments');
    expect(parsed.request_id).toBe('req_test_456');
    expect(parsed.message).toBe('Stripe create payment intent failed');
    expect(parsed.context.provider).toBe('stripe');
    expect(parsed.context.error_message).toBe('Stripe failed');

    consoleError.mockRestore();
  });

  it('should log non-error events with the expected structured payload', () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    logServerEvent('warn', 'Stripe webhook missing signature header', {
      request: {
        route: '/api/v1/webhooks/stripe',
        requestId: 'req_test_789',
        method: 'POST',
        userId: null,
        ipAddress: '198.51.100.70',
        userAgent: 'vitest',
      },
      context: {
        provider: 'stripe',
      },
    });

    const [payload] = consoleWarn.mock.calls[0] ?? [];
    const parsed = JSON.parse(payload as string) as {
      level: string;
      route: string;
      request_id: string;
      context: Record<string, string>;
    };

    expect(parsed.level).toBe('warn');
    expect(parsed.route).toBe('/api/v1/webhooks/stripe');
    expect(parsed.request_id).toBe('req_test_789');
    expect(parsed.context.provider).toBe('stripe');

    consoleWarn.mockRestore();
  });
});
