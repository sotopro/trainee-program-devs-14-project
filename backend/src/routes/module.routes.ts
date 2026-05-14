import { Router } from 'express';
import { listModuleLessons } from '../controllers/lesson.controller.js';

const router = Router();

router.get('/:moduleId/lessons', listModuleLessons);

export default router;
