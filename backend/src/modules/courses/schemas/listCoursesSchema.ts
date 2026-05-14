import { z } from 'zod';

const booleanQuerySchema = z
  .enum(['true', 'false'])
  .optional()
  .transform((value) => {
    if (value === undefined) {
      return undefined;
    }

    return value === 'true';
  });

export const listCoursesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().min(1).optional(),
  isPublic: booleanQuerySchema,
});

export type ListCoursesQuery = z.infer<typeof listCoursesQuerySchema>;
