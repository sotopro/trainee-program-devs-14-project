import type { Request, Response, NextFunction } from 'express';
import type { RateLimitEntry } from '../types/ai.types.js';
import { AppError, UnauthorizedError } from '../utils/app-error.js';

const requestCounts = new Map<string, RateLimitEntry>();

export function aiRateLimit(req: Request, _res: Response, next: NextFunction): void {
  const userId = req.user?.userId;

  if (!userId) {
    next(new UnauthorizedError('Token de acceso requerido'));
    return;
  }

  const now = Date.now();
  const entry = requestCounts.get(userId);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(userId, { count: 1, resetAt: now + 60000 });
    next();
    return;
  }

  if (entry.count >= 10) {
    next(new AppError(429, 'Limite de peticiones de IA excedido. Intenta en un minuto.', 'Too Many Requests'));
    return;
  }

  entry.count++;
  next();
}

export function clearRateLimitForUser(userId: string): void {
  requestCounts.delete(userId);
}
