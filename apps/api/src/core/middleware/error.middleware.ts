import { Request, Response, NextFunction } from 'express';
import { error } from '@api/core/utils/response.utils';

/**
 * Global error handling middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('[Error]', err);

  const statusCode = (err as any).statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json(error(message, statusCode));
}

/**
 * 404 Not Found handler
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json(error('Route not found', 404));
}
