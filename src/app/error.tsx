'use client';

import { useEffect } from 'react';

import { captureClientException } from '@/lib/observability/client';
import { Button } from '@/components/ui/button';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary for the app.
 * Catches unhandled errors and displays a recovery UI.
 *
 * @param props - Error and reset callback
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    captureClientException(error, {
      source: 'global-error-boundary',
      error_digest: error.digest,
    });
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-4xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground mt-4">
          An unexpected error occurred. Please try again.
        </p>
        {error.digest && (
          <p className="text-muted-foreground mt-2 text-xs">Error ID: {error.digest}</p>
        )}
        <div className="mt-8 flex justify-center gap-4">
          <Button onClick={reset}>Try Again</Button>
          <Button variant="outline" onClick={() => (window.location.href = '/')}>
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
}
