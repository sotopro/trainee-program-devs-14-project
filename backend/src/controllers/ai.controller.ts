import type { Request, Response, NextFunction } from 'express';
import { courseGenerationService } from '../services/course-generation.service.js';
import { contentGenerationService } from '../services/content-generation.service.js';
import { quizGenerationService } from '../services/quiz-generation.service.js';
import { recommendationService } from '../services/recommendation.service.js';
import { pathExpansionService } from '../services/path-expansion.service.js';
import { AppError } from '../utils/app-error.js';

export const generateCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { topic, level, targetAudience } = req.body;

    if (!topic) {
      throw new AppError(400, 'El campo topic es requerido', 'Bad Request');
    }

    const result = await courseGenerationService.generateCourse(
      req.user!.userId,
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
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { conversationId } = req.params as { conversationId: string };
    const { message } = req.body;

    if (!message) {
      throw new AppError(400, 'El campo message es requerido', 'Bad Request');
    }

    const result = await courseGenerationService.sendMessage(
      req.user!.userId,
      conversationId,
      message,
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const confirmCourse = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { conversationId } = req.params as { conversationId: string };

    const result = await courseGenerationService.confirmCourse(
      req.user!.userId,
      conversationId,
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const generateContent = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
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
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { lessonId } = req.params as { lessonId: string };

    const result = await quizGenerationService.generateQuiz(lessonId);

    res.status(result.replaced ? 200 : 201).json(result);
  } catch (error) {
    next(error);
  }
};

export const getRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { lessonId } = req.params as { lessonId: string };

    const result = await recommendationService.getRecommendations(lessonId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const expandPath = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { pathId } = req.params as { pathId: string };
    const { recommendationId } = req.body;

    if (!recommendationId) {
      throw new AppError(400, 'El campo recommendationId es requerido', 'Bad Request');
    }

    const result = await pathExpansionService.expandPath(
      req.user!.userId,
      pathId,
      recommendationId,
    );

    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};
