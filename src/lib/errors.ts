/**
 * Base application error with an HTTP status code and machine-readable code.
 */
export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * 400 — Request body or query params failed Zod validation.
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public readonly details?: Record<string, string[]>,
  ) {
    super(message, 'VALIDATION_ERROR', 400);
    this.name = 'ValidationError';
  }
}

/**
 * 401 — Missing or invalid authentication credentials.
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 'UNAUTHORIZED', 401);
    this.name = 'UnauthorizedError';
  }
}

/**
 * 403 — Authenticated but not allowed to perform this action.
 */
export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 'FORBIDDEN', 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 — Requested resource does not exist.
 */
export class NotFoundError extends AppError {
  constructor(message = 'Not found') {
    super(message, 'NOT_FOUND', 404);
    this.name = 'NotFoundError';
  }
}

/**
 * 409 — Resource already exists (e.g. duplicate email).
 */
export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 'CONFLICT', 409);
    this.name = 'ConflictError';
  }
}
