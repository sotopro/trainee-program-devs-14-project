import type { RegisterInput } from '../modules/auth/schemas/registerSchema.js';
import { prisma } from '../config/prisma.js';
import { AppError } from '../utils/app-error.js';
import { hashPassword } from '../utils/hash.js';
import { generateTokens } from '../utils/jwt.js';

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
    },
    ...tokens,
  };
};

export const authService = {
  register,
};

export const registerUser = register;
