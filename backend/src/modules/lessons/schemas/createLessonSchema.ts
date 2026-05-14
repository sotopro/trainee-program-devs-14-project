import { z } from 'zod';

const editorContentSchema = z.record(z.string(), z.unknown());

export const createLessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'El titulo debe tener al menos 3 caracteres')
    .max(100, 'El titulo no puede superar 100 caracteres'),
  content: editorContentSchema.optional(),
});

export type CreateLessonInput = z.infer<typeof createLessonSchema>;

export const updateLessonSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'El titulo debe tener al menos 3 caracteres')
    .max(100, 'El titulo no puede superar 100 caracteres'),
  content: editorContentSchema,
});

export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
