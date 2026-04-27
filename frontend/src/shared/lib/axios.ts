import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios';
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

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const isAuthEndpoint = (url?: string) => {
  return Boolean(url?.includes('/api/auth/login') || url?.includes('/api/auth/register') || url?.includes('/api/auth/refresh'));
};

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorPayload>) => {
    if (!error.response) {
      return Promise.reject(new ApiError('No pudimos conectar con el servidor. Intenta nuevamente.'));
    }

    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !isAuthEndpoint(originalRequest.url)
    ) {
      originalRequest._retry = true;

      try {
        await useAuthStore.getState().refreshSession();
        const nextAccessToken = useAuthStore.getState().accessToken;

        if (nextAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
        }

        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        return Promise.reject(new ApiError('Tu sesion expiro. Inicia sesion nuevamente.', 401));
      }
    }

    const message = error.response.data?.message ?? 'Ocurrio un error inesperado.';
    return Promise.reject(new ApiError(message, error.response.status));
  },
);
