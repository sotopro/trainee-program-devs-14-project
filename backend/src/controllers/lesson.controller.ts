import type { Request, Response } from 'express';
import { lessonService } from '../services/lesson.service.js';

export const listModuleLessons = async (
  req: Request<{ moduleId: string }>,
  res: Response,
) => {
  const result = await lessonService.listLessonsByModule(req.params.moduleId);

  return res.status(200).json(result);
};
