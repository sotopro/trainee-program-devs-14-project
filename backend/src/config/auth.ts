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

const requireEnv = (value: string | undefined, errorMessage: string): string => {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    throw new Error(errorMessage);
  }

  return normalizedValue;
};

export const BCRYPT_SALT_ROUNDS = parseSaltRounds(process.env.BCRYPT_SALT_ROUNDS, 12);
export const JWT_ACCESS_EXPIRES_IN = parseTokenExpiration(process.env.JWT_ACCESS_EXPIRES_IN, '15m');
export const JWT_REFRESH_EXPIRES_IN = parseTokenExpiration(process.env.JWT_REFRESH_EXPIRES_IN, '7d');
export const JWT_SECRET = requireEnv(process.env.JWT_SECRET, 'JWT secret no esta configurado');
export const JWT_REFRESH_SECRET = requireEnv(
  process.env.JWT_REFRESH_SECRET,
  'JWT refresh secret no esta configurado',
);
