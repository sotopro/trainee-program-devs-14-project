import type { Request, Response } from 'express';
import type {
  CreateLessonInput,
  ReorderLessonsInput,
  UpdateLessonInput,
} from '../modules/lessons/schemas/createLessonSchema.js';
import { lessonService } from '../services/lesson.service.js';

export const createModuleLesson = async (
  req: Request<{ moduleId: string }, unknown, CreateLessonInput>,
  res: Response,
) => {
  const result = await lessonService.createLesson(req.params.moduleId, req.body);

  return res.status(201).json(result);
};

export const getLessonById = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const result = await lessonService.getLessonById(req.params.id);

  return res.status(200).json(result);
};

export const updateLesson = async (
  req: Request<{ id: string }, unknown, UpdateLessonInput>,
  res: Response,
) => {
  const result = await lessonService.updateLesson(req.params.id, req.body);

  return res.status(200).json(result);
};

export const deleteLesson = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  await lessonService.deleteLesson(req.params.id);

  return res.status(204).send();
};

export const reorderLessons = async (
  req: Request<Record<string, never>, unknown, ReorderLessonsInput>,
  res: Response,
) => {
  await lessonService.reorderLessons(req.body);

  return res.status(204).send();
};

export const listModuleLessons = async (
  req: Request<{ moduleId: string }>,
  res: Response,
) => {
  const result = await lessonService.listLessonsByModule(req.params.moduleId);

  return res.status(200).json(result);
};
