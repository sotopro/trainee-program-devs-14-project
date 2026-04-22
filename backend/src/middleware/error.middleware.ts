import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const isProduction = process.env.NODE_ENV === 'production';

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.error,
      message: err.message,
      statusCode: err.statusCode,
    });
    return;
  }

  console.error('[Unhandled Error]', err);

  res.status(500).json({
    error: 'Internal Server Error',
    message: isProduction ? 'Internal server error' : err.message,
    statusCode: 500,
  });
};
