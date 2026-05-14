import { z } from 'zod';

export const createModuleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'El titulo debe tener al menos 3 caracteres')
    .max(100, 'El titulo no puede superar 100 caracteres'),
  description: z
    .string()
    .trim()
    .max(300, 'La descripcion no puede superar 300 caracteres')
    .optional(),
});

export type CreateModuleInput = z.infer<typeof createModuleSchema>;

export const updateModuleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'El titulo debe tener al menos 3 caracteres')
    .max(100, 'El titulo no puede superar 100 caracteres'),
  description: z
    .string()
    .trim()
    .max(300, 'La descripcion no puede superar 300 caracteres')
    .optional(),
});

export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;

export const reorderModulesSchema = z.object({
  modules: z
    .array(
      z.object({
        id: z.string().min(1, 'El modulo es requerido'),
        order: z.number().int().min(1, 'El orden debe ser mayor o igual a 1'),
      }),
    )
    .min(1, 'Debes enviar al menos un modulo'),
});

export type ReorderModulesInput = z.infer<typeof reorderModulesSchema>;
