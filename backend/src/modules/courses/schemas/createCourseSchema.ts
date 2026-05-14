import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'El titulo debe tener al menos 3 caracteres')
    .max(100, 'El titulo no puede superar 100 caracteres'),
  description: z
    .string()
    .trim()
    .min(10, 'La descripcion debe tener al menos 10 caracteres')
    .max(500, 'La descripcion no puede superar 500 caracteres'),
  isPublic: z.boolean().default(false),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
