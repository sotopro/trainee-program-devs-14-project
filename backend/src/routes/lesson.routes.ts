import { Router } from 'express';
import {
  deleteLesson,
  getLessonById,
  updateLesson,
} from '../controllers/lesson.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { validateMiddleware } from '../middleware/validate.middleware.js';
import { updateLessonSchema } from '../modules/lessons/schemas/createLessonSchema.js';

const router = Router();

router.get('/:id', getLessonById);
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validateMiddleware(updateLessonSchema),
  updateLesson,
);
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), deleteLesson);

export default router;
