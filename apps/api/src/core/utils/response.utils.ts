import { ApiResponse, ApiError } from '@api/types';

/**
 * Success response helper
 */
export function success<T>(data: T, message = 'Success'): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
  };
}

/**
 * Success response with metadata
 */
export function successWithMeta<T>(
  data: T,
  meta: Record<string, any>,
  message = 'Success'
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    meta,
  };
}

/**
 * Error response helper
 */
export function error(message: string, statusCode = 500): ApiError {
  return {
    success: false,
    message,
    statusCode,
  };
}

/**
 * Error response with error details
 */
export function errorWithDetails(
  message: string,
  errorDetails: string,
  statusCode = 500
): ApiError {
  return {
    success: false,
    message,
    error: errorDetails,
    statusCode,
  };
}
