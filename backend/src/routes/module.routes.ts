import { Router } from 'express';
import { deleteModule, reorderModules, updateModule } from '../controllers/module.controller.js';
import { createModuleLesson, listModuleLessons } from '../controllers/lesson.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';
import { validateMiddleware } from '../middleware/validate.middleware.js';
import { reorderModulesSchema, updateModuleSchema } from '../modules/courses/schemas/moduleSchema.js';
import { createLessonSchema } from '../modules/lessons/schemas/createLessonSchema.js';

const router = Router();

router.patch(
  '/reorder',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validateMiddleware(reorderModulesSchema),
  reorderModules,
);
router.put(
  '/:id',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validateMiddleware(updateModuleSchema),
  updateModule,
);
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), deleteModule);
router.get('/:moduleId/lessons', listModuleLessons);
router.post(
  '/:moduleId/lessons',
  authMiddleware,
  roleMiddleware(['ADMIN']),
  validateMiddleware(createLessonSchema),
  createModuleLesson,
);

export default router;
