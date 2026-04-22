import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

export const validateMiddleware = (schema: ZodTypeAny): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Datos inválidos',
        errors: result.error.flatten().fieldErrors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
};
