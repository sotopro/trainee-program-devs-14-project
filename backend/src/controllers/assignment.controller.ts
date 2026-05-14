import type { Request, Response } from 'express';
import { assignableUsersQuerySchema } from '../modules/courses/schemas/assignableUsersQuerySchema.js';
import type { AssignCourseInput } from '../modules/courses/schemas/assignCourseSchema.js';
import { assignmentService } from '../services/assignment.service.js';

export const assignCourse = async (
  req: Request<{ courseId: string }, unknown, AssignCourseInput>,
  res: Response,
) => {
  const result = await assignmentService.assignCourse(req.params.courseId, req.body);

  return res.status(201).json(result);
};

export const unassignCourse = async (
  req: Request<{ courseId: string; userId: string }>,
  res: Response,
) => {
  await assignmentService.unassignCourse(req.params.courseId, req.params.userId);

  return res.status(204).send();
};

export const listCourseEnrollments = async (
  req: Request<{ courseId: string }>,
  res: Response,
) => {
  const result = await assignmentService.listCourseEnrollments(req.params.courseId);

  return res.status(200).json(result);
};

export const listAssignableUsers = async (
  req: Request<{ courseId: string }>,
  res: Response,
) => {
  const query = assignableUsersQuerySchema.parse(req.query);
  const result = await assignmentService.listAssignableUsers(req.params.courseId, query);

  return res.status(200).json(result);
};
