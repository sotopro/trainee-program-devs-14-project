import type { Request, Response } from 'express';
import { adminDashboardService } from '../services/admin-dashboard.service.js';

export const getAdminDashboardStats = async (_req: Request, res: Response) => {
  const result = await adminDashboardService.listDashboardStats();

  return res.status(200).json(result);
};
