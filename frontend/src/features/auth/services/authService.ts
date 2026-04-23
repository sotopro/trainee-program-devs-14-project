import { api } from '@/shared/lib/axios';
import type { LoginCredentials, LoginResponse } from '../types/auth.types';

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>('/api/auth/login', credentials);
    return data;
  },
};