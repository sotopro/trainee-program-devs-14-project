import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';

export const register = async (req: Request, res: Response) => {
  const data = await authService.register(req.body);
  return res.status(201).json(data);
};
