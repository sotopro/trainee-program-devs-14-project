import type { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import type { StringValue } from 'ms';
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

export type RefreshTokenPayload = AuthTokenPayload & jwt.JwtPayload;

export const generateAccessToken = (user: AuthTokenPayload): string => {
  return jwt.sign(
    {
      userId: user.userId,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: JWT_ACCESS_EXPIRES_IN as StringValue },
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
    { expiresIn: JWT_REFRESH_EXPIRES_IN as StringValue },
  );
};

export const generateTokens = (user: AuthTokenPayload) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as unknown as RefreshTokenPayload;
};

export const getTokenExpirationDate = (token: string): Date => {
  const decodedToken = jwt.decode(token);

  if (!decodedToken || typeof decodedToken === 'string' || typeof decodedToken.exp !== 'number') {
    throw new Error('No se pudo obtener la expiracion del token');
  }

  return new Date(decodedToken.exp * 1000);
};
