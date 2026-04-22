const parseSaltRounds = (value: string | undefined, fallback: number): number => {
  const parsedValue = Number(value);

  if (!Number.isInteger(parsedValue) || parsedValue <= 0) {
    return fallback;
  }

  return parsedValue;
};

const parseTokenExpiration = (value: string | undefined, fallback: string): string => {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return fallback;
  }

  return normalizedValue;
};

export const BCRYPT_SALT_ROUNDS = parseSaltRounds(process.env.BCRYPT_SALT_ROUNDS, 12);
export const JWT_ACCESS_EXPIRES_IN = parseTokenExpiration(process.env.JWT_ACCESS_EXPIRES_IN, '15m');
export const JWT_REFRESH_EXPIRES_IN = parseTokenExpiration(process.env.JWT_REFRESH_EXPIRES_IN, '7d');

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error('JWT secrets no están configurados');
}
