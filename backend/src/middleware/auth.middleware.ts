import type { RequestHandler } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/auth.js';
import { UnauthorizedError } from '../utils/app-error.js';

type AccessTokenPayload = jwt.JwtPayload & {
  userId?: string;
  email?: string;
  role?: 'ADMIN' | 'USER';
};

export const authMiddleware: RequestHandler = (req, _res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    next(new UnauthorizedError('Token de acceso requerido'));
    return;
  }

  const token = authHeader.slice('Bearer '.length).trim();

  if (!token) {
    next(new UnauthorizedError('Token de acceso requerido'));
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as AccessTokenPayload;

    if (!payload.userId || !payload.email || !payload.role) {
      throw new UnauthorizedError('Token de acceso invalido o expirado');
    }

    req.user = {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
    };

    next();
  } catch (error) {
    next(
      error instanceof UnauthorizedError
        ? error
        : new UnauthorizedError('Token de acceso invalido o expirado'),
    );
  }
};
