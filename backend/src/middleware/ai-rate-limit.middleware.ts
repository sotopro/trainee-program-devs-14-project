import type { Request, Response, NextFunction } from 'express';
import type { RateLimitEntry } from '../types/ai.types.js';

const requestCounts = new Map<string, RateLimitEntry>();

export function aiRateLimit(req: Request, res: Response, next: NextFunction): void {
  const userId = (req as Request & { user?: { id: string } }).user?.id;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const now = Date.now();
  const entry = requestCounts.get(userId);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(userId, { count: 1, resetAt: now + 60000 });
    return next();
  }

  if (entry.count >= 10) {
    res.status(429).json({
      message: 'Limite de peticiones de IA excedido. Intenta en un minuto.',
    });
    return;
  }

  entry.count++;
  return next();
}

export function clearRateLimitForUser(userId: string): void {
  requestCounts.delete(userId);
}
