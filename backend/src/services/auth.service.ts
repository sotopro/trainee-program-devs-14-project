import type { RegisterInput } from '../modules/auth/schemas/registerSchema.js';
import type { LoginInput } from '../modules/auth/schemas/loginSchema.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import {
  comparePassword,
  DUMMY_PASSWORD_HASH,
  hashPassword,
} from '../utils/hash.js';
import {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
} from '../utils/jwt.js';

const register = async ({ name, email, password }: RegisterInput) => {
  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError(409, 'El email ya esta registrado', 'Conflict');
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
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

  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    role: user.role,
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

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

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

export const authService = {
  register,
  login,
};

export const registerUser = register;
export const loginUser = login;
