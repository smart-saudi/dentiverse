'use client';

import * as Sentry from '@sentry/nextjs';

/**
 * Capture a client-side exception when Sentry is configured.
 *
 * @param error - Unknown thrown value from the UI
 * @param context - Optional lightweight context for the event
 */
export function captureClientException(
  error: unknown,
  context: Record<string, string | null | undefined> = {},
): void {
  Sentry.withScope((scope) => {
    scope.setTag('service', 'dentiverse-web');
    scope.setTag('surface', 'client');

    Object.entries(context).forEach(([key, value]) => {
      if (value) {
        scope.setTag(key, value);
      }
    });

    Sentry.captureException(error);
  });
}
