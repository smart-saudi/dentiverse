import { randomUUID } from 'node:crypto';

import * as Sentry from '@sentry/nextjs';
import type { NextRequest } from 'next/server';

export const OBSERVABILITY_SERVICE_NAME = 'dentiverse-web';

export type ServerLogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface RequestLogContext {
  route: string;
  requestId: string;
  method?: string;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export interface ServerLogOptions {
  request?: RequestLogContext;
  context?: Record<string, unknown>;
}

/**
 * Build a stable request context for structured logs and Sentry tags.
 *
 * @param request - Incoming Next.js request
 * @param route - Logical route identifier
 * @param metadata - Optional request metadata overrides
 * @returns Structured request context with request correlation fields
 */
export function buildRequestLogContext(
  request: NextRequest,
  route: string,
  metadata: Partial<Omit<RequestLogContext, 'route' | 'requestId'>> = {},
): RequestLogContext {
  const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();

  return {
    route,
    requestId: request.headers.get('x-request-id') ?? randomUUID(),
    method: request.method,
    ipAddress:
      metadata.ipAddress ?? forwardedFor ?? request.headers.get('x-real-ip') ?? null,
    userAgent: metadata.userAgent ?? request.headers.get('user-agent') ?? null,
    userId: metadata.userId ?? null,
  };
}

/**
 * Write one structured server log entry to the runtime log sink.
 *
 * @param level - Log severity
 * @param message - Human-readable log message
 * @param options - Optional request context and compact metadata
 */
export function logServerEvent(
  level: ServerLogLevel,
  message: string,
  options: ServerLogOptions = {},
): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    service: OBSERVABILITY_SERVICE_NAME,
    environment: getObservabilityEnvironment(),
    route: options.request?.route ?? null,
    request_id: options.request?.requestId ?? null,
    user_id: options.request?.userId ?? null,
    message,
    context: {
      method: options.request?.method ?? null,
      ip_address: options.request?.ipAddress ?? null,
      user_agent: options.request?.userAgent ?? null,
      ...(options.context ?? {}),
    },
  };

  const payload = JSON.stringify(entry);

  if (level === 'error') {
    console.error(payload);
    return;
  }

  if (level === 'warn') {
    console.warn(payload);
    return;
  }

  if (level === 'info') {
    process.stdout.write(`${payload}\n`);
    return;
  }

  if (process.env.NODE_ENV !== 'production') {
    process.stdout.write(`${payload}\n`);
  }
}

/**
 * Capture a server-side exception in Sentry and the structured runtime log.
 *
 * @param error - Unknown thrown value
 * @param message - Human-readable summary of the failure
 * @param options - Optional request context and compact metadata
 * @returns The request correlation ID used for the failure
 */
export function captureServerException(
  error: unknown,
  message: string,
  options: ServerLogOptions = {},
): string {
  const requestId = options.request?.requestId ?? randomUUID();
  const serializedError = serializeError(error);

  Sentry.withScope((scope) => {
    scope.setTag('service', OBSERVABILITY_SERVICE_NAME);
    scope.setTag('environment', getObservabilityEnvironment());
    scope.setTag('request_id', requestId);

    if (options.request?.route) {
      scope.setTag('route', options.request.route);
    }

    if (options.request?.method) {
      scope.setTag('http.method', options.request.method);
    }

    if (options.request?.userId) {
      scope.setUser({ id: options.request.userId });
    }

    if (options.context) {
      scope.setContext('observability', options.context);
    }

    Sentry.captureException(error, {
      extra: {
        request_id: requestId,
        ...options.context,
      },
    });
  });

  logServerEvent('error', message, {
    request: options.request ? { ...options.request, requestId } : undefined,
    context: {
      ...(options.context ?? {}),
      error_name: serializedError.name,
      error_message: serializedError.message,
    },
  });

  return requestId;
}

function getObservabilityEnvironment(): string {
  return process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? 'development';
}

function serializeError(error: unknown): { name: string; message: string } {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    };
  }

  return {
    name: 'UnknownError',
    message: typeof error === 'string' ? error : 'Unknown server error',
  };
}
