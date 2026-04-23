import axios, { AxiosError } from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/features/auth/store/authStore';

export type ApiErrorPayload = {
  message?: string;
  error?: string;
};

export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export const api = axios.create({
  baseURL: env.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorPayload>) => {
    if (!error.response) {
      return Promise.reject(new ApiError('No pudimos conectar con el servidor. Intenté nuevamente.'));
    }

    const message = error.response.data?.message ?? 'Ocurrió un error inesperado.';
    return Promise.reject(new ApiError(message, error.response.status));
  },
);