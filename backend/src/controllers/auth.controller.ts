import type { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';

export const register = async (req: Request, res: Response) => {
  const data = await authService.register(req.body);
  return res.status(201).json(data);
};

export const login = async (req: Request, res: Response) => {
  const data = await authService.login(req.body);
  return res.status(200).json(data);
};

export const refresh = async (req: Request, res: Response) => {
  const data = await authService.refreshTokens(req.body);
  return res.status(200).json(data);
};
