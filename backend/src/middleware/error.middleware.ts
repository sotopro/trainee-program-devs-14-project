import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/app-error.js';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('[Error]', err);

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.error, message: err.message });
    return;
  }

  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Internal server error',
  });
};
