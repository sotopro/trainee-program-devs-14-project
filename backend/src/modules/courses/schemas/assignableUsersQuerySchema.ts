import { z } from 'zod';

export const assignableUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : undefined)),
});

export type AssignableUsersQuery = z.infer<typeof assignableUsersQuerySchema>;
