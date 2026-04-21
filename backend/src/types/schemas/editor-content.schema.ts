import { z } from 'zod';

export const editorBlockSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['header', 'paragraph', 'list', 'code', 'quote', 'delimiter', 'table']),
  data: z.record(z.string(), z.unknown()),
});

export const editorContentSchema = z.object({
  time: z.number(),
  blocks: z.array(editorBlockSchema).min(1),
  version: z.string(),
});

export type EditorBlock = z.infer<typeof editorBlockSchema>;
export type EditorContent = z.infer<typeof editorContentSchema>;
