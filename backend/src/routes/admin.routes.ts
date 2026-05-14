import { Router } from 'express';
import { getAdminDashboardStats } from '../controllers/admin-dashboard.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { roleMiddleware } from '../middleware/role.middleware.js';

const router = Router();

router.use(authMiddleware, roleMiddleware(['ADMIN']));

router.get('/dashboard-stats', getAdminDashboardStats);

export default router;
