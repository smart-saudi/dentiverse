/**
 * API response wrappers — used by all API route handlers.
 */

/** Standard success response */
export interface ApiResponse<T> {
  data: T;
}

/** Paginated response with metadata */
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

/** Standard error response */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}
