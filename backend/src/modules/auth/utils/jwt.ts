import type { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import {
  JWT_ACCESS_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
  JWT_REFRESH_SECRET,
  JWT_SECRET,
} from '../../../config/auth.js';

export type AuthTokenPayload = {
  userId: string;
  email: string;
  role: Role;
};

export const generateAccessToken = (user: AuthTokenPayload): string => {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES_IN },
  );
};

export const generateRefreshToken = (user: AuthTokenPayload): string => {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
    JWT_REFRESH_SECRET,
    { expiresIn: JWT_REFRESH_EXPIRES_IN },
  );
};

export const generateTokens = (user: AuthTokenPayload) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};
