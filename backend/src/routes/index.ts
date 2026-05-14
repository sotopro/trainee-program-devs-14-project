import { Router } from 'express';
import healthRoutes from './health.routes.js';
import aiRoutes from './ai.routes.js';
import authRoutes from './auth.routes.js';
import courseRoutes from './course.routes.js';
import adminRoutes from './admin.routes.js';
import lessonRoutes from './lesson.routes.js';
import moduleRoutes from './module.routes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/ai', aiRoutes);
router.use('/auth', authRoutes);
router.use('/courses', courseRoutes);
router.use('/admin', adminRoutes);
router.use('/lessons', lessonRoutes);
router.use('/modules', moduleRoutes);

export default router;
