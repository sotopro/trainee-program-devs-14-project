import { z } from 'zod';

const idSchema = z
  .string()
  .trim()
  .min(1, 'El userId es requerido')
  .refine(
    (value) => z.string().uuid().safeParse(value).success || /^c[a-z0-9]{24,}$/i.test(value),
    'El userId debe tener formato UUID o CUID valido',
  );

export const assignCourseSchema = z.object({
  userId: idSchema,
});

export type AssignCourseInput = z.infer<typeof assignCourseSchema>;
