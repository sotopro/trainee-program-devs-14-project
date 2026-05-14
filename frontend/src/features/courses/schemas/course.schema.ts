import { z } from 'zod';

export const lessonSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .trim()
    .min(3, 'El titulo debe tener al menos 3 caracteres')
    .max(100, 'El titulo no puede superar 100 caracteres'),
  content: z.string().trim().min(1, 'El contenido de la leccion es obligatorio'),
  order: z.number().int().min(1),
});

export const moduleSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .trim()
    .min(3, 'El titulo debe tener al menos 3 caracteres')
    .max(80, 'El titulo no puede superar 80 caracteres'),
  description: z
    .string()
    .trim()
    .max(300, 'La descripcion no puede superar 300 caracteres')
    .optional()
    .or(z.literal('')),
  order: z.number().int().min(1),
  lessons: z.array(lessonSchema),
});

export const courseSchema = z.object({
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
  thumbnail: z.string().trim().url('Ingresa una URL valida para el thumbnail').optional().or(z.literal('')),
  isPublic: z.boolean(),
  modules: z.array(moduleSchema),
});

export type LessonFormData = z.infer<typeof lessonSchema>;
export type ModuleFormData = z.infer<typeof moduleSchema>;
export type CourseFormData = z.infer<typeof courseSchema>;
