import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../config/auth.js';

export const DUMMY_PASSWORD_HASH = '$2b$12$nC2Q7v4Q8Y2R4B2JXK8RVeuQ0w1kN1lYzT1n0m3m9d9y9d3TQx6uK';

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};

export const comparePassword = async (password: string, hashedPassword: string) => {
  return bcrypt.compare(password, hashedPassword);
};
