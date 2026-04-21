import { prisma } from '../config/prisma.js';
import { aiService } from './ai.service.js';
import { buildPathExpansionPrompt } from '../prompts/path-expansion.js';
import { AppError } from '../utils/app-error.js';

interface LessonExpansion {
  title: string;
  contentOutline: string;
}

interface ExpansionResult {
  lessons: LessonExpansion[];
}

class PathExpansionService {
  async expandPath(
    userId: string,
    pathId: string,
    recommendationId: string,
  ): Promise<{
    pathId: string;
    pathName: string;
    newLessons: Array<{
      id: string;
      title: string;
      order: number;
      content: object;
      quiz: { id: string; questionCount: number } | null;
    }>;
    updatedProgress: {
      completedLessons: number;
      totalLessons: number;
      percentage: number;
    };
  }> {
    const path = await prisma.learningPath.findUnique({
      where: { id: pathId },
      include: {
        items: {
          include: {
            lesson: {
              include: {
                module: {
                  include: {
                    course: true,
                  },
                },
              },
            },
          },
        },
        user: true,
      },
    });

    if (!path) {
      throw new AppError(404, 'Ruta de aprendizaje no encontrada');
    }

    if (path.userId !== userId) {
      throw new AppError(403, 'No tienes acceso a esta ruta de aprendizaje');
    }

    if (!path.isForked) {
      throw new AppError(400, 'Solo se puede expandir una ruta forkeada');
    }

    const recommendation = await prisma.recommendation.findUnique({
      where: { id: recommendationId },
    });

    if (!recommendation) {
      throw new AppError(404, 'Recomendacion no encontrada');
    }

    const recommendationLesson = await prisma.lesson.findFirst({
      where: {
        id: {
          in: path.items.map(item => item.lessonId),
        },
      },
      include: {
        module: {
          include: {
            course: true,
          },
        },
      },
    });

    const prompt = buildPathExpansionPrompt(
      recommendationLesson?.module.course.title || 'Curso General',
      recommendationLesson?.module.title || 'Modulo General',
      recommendationLesson?.title || 'Leccion',
      recommendation.content,
      recommendation.type,
    );

    let rawExpansion: string;
    try {
      rawExpansion = await aiService.sendMessage(prompt, 'Genera las lecciones basadas en la recomendacion.');
    } catch {
      throw new AppError(502, 'No se pudieron generar las lecciones');
    }

    let parsedExpansion: ExpansionResult;
    try {
      parsedExpansion = JSON.parse(rawExpansion);
    } catch {
      throw new AppError(502, 'Las lecciones generadas no tienen el formato esperado');
    }

    const lastOrder = path.items.length > 0 ? Math.max(...path.items.map(i => i.order)) : -1;
    const moduleId = recommendationLesson?.module.id;

    if (!moduleId) {
      throw new AppError(400, 'No se pudo determinar el modulo para las nuevas lecciones');
    }

    const result = await prisma.$transaction(async (tx) => {
      const newLessons: Array<{
        id: string;
        title: string;
        order: number;
        content: object;
        quiz: { id: string; questionCount: number } | null;
      }> = [];

      let order = lastOrder + 1;
      for (const lessonExpansion of parsedExpansion.lessons) {
        const lesson = await tx.lesson.create({
          data: {
            title: lessonExpansion.title,
            content: JSON.stringify({ time: Date.now(), blocks: [], version: '2.28.0' }),
            type: 'TEXT',
            duration: 15,
            order,
            moduleId,
          },
        });
        order++;

        let quizData: { id: string; questionCount: number } | null = null;
        try {
          const quizResult = await this.generateQuizForLesson(lesson.id);
          quizData = quizResult;
        } catch {
          // Quiz generation failed, continue without quiz
        }

        await tx.learningPathItem.create({
          data: {
            pathId,
            lessonId: lesson.id,
            order: order - 1,
            isCompleted: false,
          },
        });

        newLessons.push({
          id: lesson.id,
          title: lesson.title,
          order: order - 1,
          content: { time: Date.now(), blocks: [], version: '2.28.0' },
          quiz: quizData,
        });
      }

      const progress = await tx.progress.aggregate({
        where: { userId },
        _count: { lessonId: true },
      });

      const totalItems = await tx.learningPathItem.count({
        where: { pathId },
      });

      return { newLessons, totalLessons: totalItems, completedCount: progress._count.lessonId };
    });

    const completedItems = await prisma.learningPathItem.count({
      where: { pathId, isCompleted: true },
    });

    return {
      pathId,
      pathName: path.name,
      newLessons: result.newLessons,
      updatedProgress: {
        completedLessons: completedItems,
        totalLessons: result.totalLessons,
        percentage: result.totalLessons > 0 ? Math.round((completedItems / result.totalLessons) * 100 * 10) / 10 : 0,
      },
    };
  }

  private async generateQuizForLesson(lessonId: string): Promise<{ id: string; questionCount: number }> {
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
    });

    if (!lesson || !lesson.content || lesson.content === '{}') {
      throw new AppError(400, 'La leccion no tiene contenido para generar quiz');
    }

    const editorContent = JSON.parse(lesson.content);
    const plainText = editorContent.blocks
      .map((block: { type: string; data: { text?: string; items?: string[]; code?: string } }) => {
        if (block.type === 'header' || block.type === 'paragraph') {
          return block.data.text || '';
        }
        if (block.type === 'list') {
          return (block.data.items || []).join('\n');
        }
        if (block.type === 'code') {
          return `Codigo: ${block.data.code || ''}`;
        }
        return '';
      })
      .filter(Boolean)
      .join('\n\n');

    const { quizSchema } = await import('../types/schemas/quiz.schema.js');
    const { buildQuizGenerationPrompt } = await import('../prompts/quiz-generation.js');

    const prompt = buildQuizGenerationPrompt(plainText);

    let rawQuiz: string;
    try {
      rawQuiz = await aiService.sendMessage(prompt, 'Genera el quiz.');
    } catch {
      throw new AppError(502, 'No se pudo generar quiz para la leccion');
    }

    let parsedQuiz: { questions: Array<{ question: string; options: string[]; correctAnswer: number; explanation: string }> };
    try {
      parsedQuiz = quizSchema.parse(JSON.parse(rawQuiz));
    } catch {
      throw new AppError(502, 'El quiz generado no tiene el formato esperado');
    }

    const questionsWithId = parsedQuiz.questions.map((q, idx) => ({
      id: `q-${idx + 1}`,
      text: q.question,
      options: q.options,
      correctIndex: q.correctAnswer,
      explanation: q.explanation,
    }));

    const quiz = await prisma.quiz.create({
      data: {
        lessonId,
        title: `Quiz: ${lesson.title}`,
        questions: questionsWithId as unknown as object,
      },
    });

    return {
      id: quiz.id,
      questionCount: parsedQuiz.questions.length,
    };
  }
}

export const pathExpansionService = new PathExpansionService();
