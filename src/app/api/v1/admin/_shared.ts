import { NextResponse } from 'next/server';

import { AppError } from '@/lib/errors';

/**
 * Convert an application error into a standard API JSON response.
 *
 * @param error - Unknown thrown value
 * @param fallbackMessage - Fallback message for unexpected errors
 * @returns Next.js JSON response
 */
export function createAdminErrorResponse(
  error: unknown,
  fallbackMessage = 'An unexpected error occurred',
) {
  if (error instanceof AppError) {
    return NextResponse.json(
      {
        code: error.code,
        message: error.message,
      },
      { status: error.statusCode },
    );
  }

  return NextResponse.json(
    {
      code: 'INTERNAL_ERROR',
      message: fallbackMessage,
    },
    { status: 500 },
  );
}
