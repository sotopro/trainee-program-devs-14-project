import type { Role } from '@prisma/client';
import type { RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/app-error.js';

export const roleMiddleware = (allowedRoles: Role[]): RequestHandler => {
  return (req, _res, next) => {
    if (!req.user) {
      next(new UnauthorizedError('Token de acceso requerido'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('No tiene permisos para acceder a este recurso'));
      return;
    }

    next();
  };
};
