import { prisma } from '../config/prisma.js';
import { aiService } from './ai.service.js';
import { quizSchema, type QuizData } from '../types/schemas/quiz.schema.js';
import { buildQuizGenerationPrompt } from '../prompts/quiz-generation.js';
import { extractPlainText } from '../utils/editor-content.util.js';
import { AppError } from '../utils/app-error.js';

class QuizGenerationService {
  async generateQuiz(lessonId: string): Promise<{
    quizId: string;
    lessonId: string;
    questionCount: number;
    questions: QuizData['questions'];
    generated: boolean;
    replaced: boolean;
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

    const existingContent = lesson.content && lesson.content !== '{}';
    if (!existingContent) {
      throw new AppError(400, 'La leccion no tiene contenido. Genera el contenido primero.');
    }

    const editorContent = JSON.parse(lesson.content);
    const plainText = extractPlainText(editorContent);

    if (!plainText.trim()) {
      throw new AppError(400, 'El contenido de la leccion esta vacio o no tiene texto extraible.');
    }

    const prompt = buildQuizGenerationPrompt(plainText);

    let rawQuiz: string;
    try {
      rawQuiz = await aiService.sendMessage(prompt, 'Genera el quiz basado en el contenido.');
    } catch {
      throw new AppError(502, 'No se pudo generar el quiz');
    }

    let parsedQuiz: QuizData;
    try {
      parsedQuiz = quizSchema.parse(JSON.parse(rawQuiz));
    } catch {
      throw new AppError(502, 'El quiz generado no tiene el formato esperado');
    }

    const existingQuiz = await prisma.quiz.findUnique({
      where: { lessonId },
    });

    const questionsWithId = parsedQuiz.questions.map((q, idx) => ({
      id: `q-${idx + 1}`,
      text: q.question,
      options: q.options,
      correctIndex: q.correctAnswer,
      explanation: q.explanation,
    }));

    let quizId: string;
    let replaced = false;

    if (existingQuiz) {
      const updated = await prisma.quiz.update({
        where: { id: existingQuiz.id },
        data: {
          title: `Quiz: ${lesson.title}`,
          questions: questionsWithId as unknown as object,
        },
      });
      quizId = updated.id;
      replaced = true;
    } else {
      const created = await prisma.quiz.create({
        data: {
          lessonId,
          title: `Quiz: ${lesson.title}`,
          questions: questionsWithId as unknown as object,
        },
      });
      quizId = created.id;
    }

    return {
      quizId,
      lessonId,
      questionCount: parsedQuiz.questions.length,
      questions: parsedQuiz.questions,
      generated: true,
      replaced,
    };
  }
}

export const quizGenerationService = new QuizGenerationService();
