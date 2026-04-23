import express, { type Express, type RequestHandler } from 'express';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';

const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];

const getAllowedOrigins = (): string[] => {
  const configuredOrigins = process.env.CORS_ORIGINS ?? process.env.CORS_ORIGIN;

  if (!configuredOrigins) {
    return DEFAULT_ALLOWED_ORIGINS;
  }

  return configuredOrigins
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const corsMiddleware: RequestHandler = (req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = getAllowedOrigins();

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
};

export const createApp = (): Express => {
  const app = express();

  app.use(corsMiddleware);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
