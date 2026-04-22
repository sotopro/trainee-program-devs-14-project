import { z } from 'zod';

export const refreshTokenSchema = z.object({
  refreshToken: z.string().trim().min(1, 'El refresh token es requerido'),
});

export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
