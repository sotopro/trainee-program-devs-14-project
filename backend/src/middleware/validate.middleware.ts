import type { RequestHandler } from 'express';
import type { ZodTypeAny } from 'zod';

export const validateMiddleware = (schema: ZodTypeAny): RequestHandler => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Los datos enviados no son validos',
        statusCode: 400,
        fieldErrors: result.error.flatten().fieldErrors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
};
