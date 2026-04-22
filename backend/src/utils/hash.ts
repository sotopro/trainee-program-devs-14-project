import bcrypt from 'bcryptjs';
import { BCRYPT_SALT_ROUNDS } from '../config/auth.js';

export const hashPassword = async (password: string) => {
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
};
