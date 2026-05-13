import { Router } from 'express';
import {
  createCourse,
  deleteCourse,
  getCourseById,
  listCourses,
  updateCourse,
} from '../controllers/course.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { validateMiddleware } from '../middleware/validate.middleware.js';
import { createCourseSchema } from '../modules/courses/schemas/createCourseSchema.js';
import { updateCourseSchema } from '../modules/courses/schemas/updateCourseSchema.js';

const router = Router();

router.get('/', listCourses);
router.post('/', authMiddleware, roleMiddleware(['ADMIN']), validateMiddleware(createCourseSchema), createCourse);
router.get('/:id', getCourseById);
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN']), validateMiddleware(updateCourseSchema), updateCourse);
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), deleteCourse);

export default router;
