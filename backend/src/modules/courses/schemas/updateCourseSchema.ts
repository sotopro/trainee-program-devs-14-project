import { z } from 'zod';
import { createCourseSchema } from './createCourseSchema.js';

export const updateCourseSchema = createCourseSchema.partial().refine(
  (value) => Object.keys(value).length > 0,
  {
    message: 'Debes enviar al menos un campo para actualizar',
  },
);

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
