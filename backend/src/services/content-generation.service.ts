import { prisma } from '../config/prisma.js';
import { aiService } from './ai.service.js';
import { editorContentSchema, type EditorContent } from '../types/schemas/editor-content.schema.js';
import { buildContentGenerationPrompt } from '../prompts/content-generation.js';
import { AppError } from '../utils/app-error.js';

class ContentGenerationService {
  async generateContent(
    lessonId: string,
    overwrite: boolean = false,
  ): Promise<{ lessonId: string; content: EditorContent; generated: boolean; overwritten: boolean }> {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new AppError(404, 'Leccion no encontrada');
    }

    const existingContent = lesson.content && lesson.content !== '{}';
    if (existingContent && !overwrite) {
      throw new AppError(409, 'La leccion ya tiene contenido. Usa overwrite: true para regenerar.');
    }

    const prompt = buildContentGenerationPrompt(
      lesson.module.course.title,
      lesson.module.title,
      lesson.title,
    );

    let rawContent: string;
    try {
      rawContent = await aiService.sendMessage(prompt, 'Genera el contenido de la leccion.');
    } catch (_error) {
      try {
        rawContent = await aiService.sendMessage(
          prompt + '\n\nSi el JSON anterior no es valido, genera un contenido nuevo correctamente formateado.',
          'Genera el contenido de la leccion.',
        );
      } catch (_retryError) {
        throw new AppError(502, 'No se pudo generar contenido valido despues del reintento');
      }
    }

    let parsedContent: EditorContent;
    try {
      parsedContent = editorContentSchema.parse(JSON.parse(rawContent));
    } catch {
      throw new AppError(502, 'El contenido generado no tiene el formato esperado de Editor.js');
    }

    parsedContent.time = Date.now();

    await prisma.lesson.update({
      where: { id: lessonId },
      data: {
        content: JSON.stringify(parsedContent),
      },
    });

    return {
      lessonId,
      content: parsedContent,
      generated: true,
      overwritten: !!(existingContent && overwrite),
    };
  }
}

export const contentGenerationService = new ContentGenerationService();
