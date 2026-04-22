import type { Role } from '@prisma/client';
import type { RegisterInput } from '../modules/auth/schemas/registerSchema.js';
import type { LoginInput } from '../modules/auth/schemas/loginSchema.js';
import type { RefreshTokenInput } from '../modules/auth/schemas/refreshTokenSchema.js';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import {
  comparePassword,
  DUMMY_PASSWORD_HASH,
  hashPassword,
} from '../utils/hash.js';
import {
  type RefreshTokenPayload,
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  getTokenExpirationDate,
  verifyRefreshToken,
} from '../utils/jwt.js';

type TokenUser = {
  id: string;
  email: string;
  role: Role;
};

const buildTokenPayload = (user: TokenUser) => ({
  userId: user.id,
  email: user.email,
  role: user.role,
});

const createRefreshTokenRecord = async (userId: string, token: string) => {
  return prisma.refreshToken.create({
    data: {
      token,
      userId,
      expiresAt: getTokenExpirationDate(token),
    },
  });
};

const register = async ({ name, email, password }: RegisterInput) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError(409, 'El email ya esta registrado', 'Conflict');
  }

  const hashedPassword = await hashPassword(password);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    const tokens = generateTokens(buildTokenPayload(user));

    await tx.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: getTokenExpirationDate(tokens.refreshToken),
      },
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      ...tokens,
    };
  });
};

const login = async ({ email, password }: LoginInput) => {
  const normalizedEmail = email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      name: true,
      email: true,
      password: true,
      role: true,
      createdAt: true,
    },
  });

  const passwordHash = user?.password ?? DUMMY_PASSWORD_HASH;
  const isValidPassword = await comparePassword(password, passwordHash);

  if (!user || !isValidPassword) {
    throw new AppError(401, 'Credenciales invalidas', 'Unauthorized');
  }

  const accessToken = generateAccessToken(buildTokenPayload(user));
  const refreshToken = generateRefreshToken(buildTokenPayload(user));
  await createRefreshTokenRecord(user.id, refreshToken);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
    accessToken,
    refreshToken,
  };
};

const revokeAllRefreshTokensForUser = async (userId: string) => {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
};

const refreshTokens = async ({ refreshToken }: RefreshTokenInput) => {
  let payload: RefreshTokenPayload;

  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new AppError(401, 'Token de refresco expirado', 'Unauthorized');
    }

    throw new AppError(401, 'Token de refresco invalido', 'Unauthorized');
  }

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
  });

  if (!storedToken) {
    throw new AppError(401, 'Token de refresco invalido', 'Unauthorized');
  }

  if (storedToken.used || storedToken.revokedAt) {
    console.warn(`[Security] Refresh token reutilizado detectado para userId=${storedToken.userId}`);
    await revokeAllRefreshTokensForUser(storedToken.userId);
    throw new AppError(401, 'Token de refresco invalido', 'Unauthorized');
  }

  if (storedToken.expiresAt <= new Date()) {
    throw new AppError(401, 'Token de refresco expirado', 'Unauthorized');
  }

  return prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        used: true,
        revokedAt: new Date(),
      },
    });

    const user = await tx.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    if (!user) {
      throw new AppError(401, 'Token de refresco invalido', 'Unauthorized');
    }

    const nextAccessToken = generateAccessToken(buildTokenPayload(user));
    const nextRefreshToken = generateRefreshToken(buildTokenPayload(user));

    await tx.refreshToken.create({
      data: {
        token: nextRefreshToken,
        userId: user.id,
        expiresAt: getTokenExpirationDate(nextRefreshToken),
      },
    });

    return {
      accessToken: nextAccessToken,
      refreshToken: nextRefreshToken,
    };
  });
};

export const authService = {
  register,
  login,
  refreshTokens,
};

export const registerUser = register;
export const loginUser = login;
export const rotateRefreshTokens = refreshTokens;
