import type { Request, Response } from 'express';
import { listCoursesQuerySchema } from '../modules/courses/schemas/listCoursesSchema.js';
import { courseService } from '../services/course.service.js';
import { UnauthorizedError } from '../utils/app-error.js';

export const listCourses = async (req: Request, res: Response) => {
  const query = listCoursesQuerySchema.parse(req.query);
  const result = await courseService.listCourses(query);

  return res.status(200).json(result);
};

export const getCourseById = async (req: Request<{ id: string }>, res: Response) => {
  const result = await courseService.getCourseById(req.params.id);

  return res.status(200).json(result);
};

export const createCourse = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new UnauthorizedError('Token de acceso requerido');
  }

  const result = await courseService.createCourse(req.body, req.user.userId);

  return res.status(201).json(result);
};

export const updateCourse = async (req: Request<{ id: string }>, res: Response) => {
  const result = await courseService.updateCourse(req.params.id, req.body);

  return res.status(200).json(result);
};

export const deleteCourse = async (req: Request<{ id: string }>, res: Response) => {
  await courseService.deleteCourse(req.params.id);

  return res.status(204).send();
};
