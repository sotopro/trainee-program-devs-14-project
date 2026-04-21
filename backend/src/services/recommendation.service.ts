import { prisma } from '../config/prisma.js';
import { aiService } from './ai.service.js';
import { recommendationsResponseSchema } from '../types/schemas/recommendation.schema.js';
import { buildRecommendationPrompt } from '../prompts/recommendation.js';
import { extractPlainText } from '../utils/editor-content.util.js';
import { AppError } from '../utils/app-error.js';

class RecommendationService {
  async getRecommendations(lessonId: string): Promise<{
    lessonId: string;
    cached: boolean;
    recommendations: Array<{
      id: string;
      type: string;
      content: string;
      metadata: Record<string, unknown>;
    }>;
  }> {
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

    const existingRecommendations = await prisma.recommendation.findMany({
      where: { lessonId },
    });

    if (existingRecommendations.length >= 3) {
      return {
        lessonId,
        cached: true,
        recommendations: existingRecommendations.map(r => ({
          id: r.id,
          type: r.type,
          content: r.content,
          metadata: r.metadata as Record<string, unknown>,
        })),
      };
    }

    const editorContent = JSON.parse(lesson.content);
    const plainText = extractPlainText(editorContent);

    const prompt = buildRecommendationPrompt(
      lesson.module.course.title,
      lesson.module.title,
      lesson.title,
      plainText,
    );

    let rawRecommendations: string;
    try {
      rawRecommendations = await aiService.sendMessage(
        prompt,
        'Genera las recomendaciones basadas en el contenido.',
      );
    } catch {
      throw new AppError(502, 'No se pudieron generar recomendaciones');
    }

    let parsedData: { recommendations: Array<{ type: string; content: string; metadata: Record<string, unknown> }> };
    try {
      parsedData = recommendationsResponseSchema.parse(JSON.parse(rawRecommendations));
    } catch {
      throw new AppError(502, 'Las recomendaciones generadas no tienen el formato esperado');
    }

    const created = await prisma.$transaction(async (tx) => {
      const recommendations = await Promise.all(
        parsedData.recommendations.map(r =>
          tx.recommendation.create({
            data: {
              lessonId,
              type: r.type,
              content: r.content,
              metadata: r.metadata as unknown as object,
            },
          }),
        ),
      );
      return recommendations;
    });

    return {
      lessonId,
      cached: false,
      recommendations: created.map(r => ({
        id: r.id,
        type: r.type,
        content: r.content,
        metadata: r.metadata as Record<string, unknown>,
      })),
    };
  }
}

export const recommendationService = new RecommendationService();
