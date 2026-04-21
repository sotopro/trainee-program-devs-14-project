import type { Request, Response, NextFunction } from 'express';
import { courseGenerationService } from '../services/course-generation.service.js';
import { contentGenerationService } from '../services/content-generation.service.js';
import { quizGenerationService } from '../services/quiz-generation.service.js';
import { recommendationService } from '../services/recommendation.service.js';
import { pathExpansionService } from '../services/path-expansion.service.js';
import { AppError } from '../utils/app-error.js';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const generateCourse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError(403, 'Solo administradores pueden generar cursos');
    }

    const { topic, level, targetAudience } = req.body;

    if (!topic) {
      throw new AppError(400, 'El campo topic es requerido');
    }

    const result = await courseGenerationService.generateCourse(
      req.user.id,
      topic,
      level || 'intermedio',
      targetAudience || 'Desarrolladores generales',
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const chat = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError(403, 'Solo administradores pueden chatear con la IA');
    }

    const { conversationId } = req.params as { conversationId: string };
    const { message } = req.body;

    if (!message) {
      throw new AppError(400, 'El campo message es requerido');
    }

    const result = await courseGenerationService.sendMessage(
      req.user.id,
      conversationId,
      message,
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const confirmCourse = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError(403, 'Solo administradores pueden confirmar cursos');
    }

    const { conversationId } = req.params as { conversationId: string };

    const result = await courseGenerationService.confirmCourse(
      req.user.id,
      conversationId,
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const generateContent = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError(403, 'Solo administradores pueden generar contenido');
    }

    const { lessonId } = req.params as { lessonId: string };
    const { overwrite } = req.body;

    const result = await contentGenerationService.generateContent(
      lessonId,
      overwrite || false,
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const generateQuiz = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (req.user?.role !== 'ADMIN') {
      throw new AppError(403, 'Solo administradores pueden generar quizzes');
    }

    const { lessonId } = req.params as { lessonId: string };

    const result = await quizGenerationService.generateQuiz(lessonId);

    res.status(result.replaced ? 200 : 201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Autenticacion requerida');
    }

    const { lessonId } = req.params as { lessonId: string };

    const result = await recommendationService.getRecommendations(lessonId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const expandPath = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    if (!req.user) {
      throw new AppError(401, 'Autenticacion requerida');
    }

    const { pathId } = req.params as { pathId: string };
    const { recommendationId } = req.body;

    if (!recommendationId) {
      throw new AppError(400, 'El campo recommendationId es requerido');
    }

    const result = await pathExpansionService.expandPath(
      req.user.id,
      pathId,
      recommendationId,
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
