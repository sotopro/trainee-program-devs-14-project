import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { env } from '@/config/env';
import type { AuthUser, LoginResponse } from '../types/auth.types';

const AUTH_STORAGE_KEY = 'learnpath.auth';

type PersistedAuthState = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (payload: LoginResponse) => void;
  logout: () => void;
};

const readPersistedAuth = (): PersistedAuthState | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawAuth = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawAuth) {
    return null;
  }

  try {
    return JSON.parse(rawAuth) as PersistedAuthState;
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

const persistedAuth = readPersistedAuth();

export const useAuthStore = create<AuthState>()(
  devtools(
    (set) => ({
      accessToken: persistedAuth?.accessToken ?? null,
      refreshToken: persistedAuth?.refreshToken ?? null,
      user: persistedAuth?.user ?? null,
      isAuthenticated: Boolean(persistedAuth?.accessToken),
      login: ({ accessToken, refreshToken, user }) => {
        const nextAuth = { accessToken, refreshToken, user };
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
        set({ ...nextAuth, isAuthenticated: true }, false, 'auth/login');
      },
      logout: () => {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
        set(
          { accessToken: null, refreshToken: null, user: null, isAuthenticated: false },
          false,
          'auth/logout',
        );
      },
    }),
    {
      name: 'AuthStore',
      enabled: env.APP_ENV === 'development' || env.DEBUG,
    },
  ),
);