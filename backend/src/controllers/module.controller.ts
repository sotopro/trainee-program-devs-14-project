import type { Request, Response } from 'express';
import type {
  CreateModuleInput,
  ReorderModulesInput,
  UpdateModuleInput,
} from '../modules/courses/schemas/moduleSchema.js';
import { moduleService } from '../services/module.service.js';

export const listCourseModules = async (
  req: Request<{ courseId: string }>,
  res: Response,
) => {
  const result = await moduleService.listModulesByCourse(req.params.courseId);

  return res.status(200).json(result);
};

export const createCourseModule = async (
  req: Request<{ courseId: string }, unknown, CreateModuleInput>,
  res: Response,
) => {
  const result = await moduleService.createModule(req.params.courseId, req.body);

  return res.status(201).json(result);
};

export const updateModule = async (
  req: Request<{ id: string }, unknown, UpdateModuleInput>,
  res: Response,
) => {
  const result = await moduleService.updateModule(req.params.id, req.body);

  return res.status(200).json(result);
};

export const deleteModule = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  await moduleService.deleteModule(req.params.id);

  return res.status(204).send();
};

export const reorderModules = async (
  req: Request<Record<string, never>, unknown, ReorderModulesInput>,
  res: Response,
) => {
  const result = await moduleService.reorderModules(req.body);

  return res.status(200).json(result);
};
