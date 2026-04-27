import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';
import { devtools, persist } from 'zustand/middleware';
import { env } from '@/config/env';
import type { LoginResponse, RefreshSessionResponse, User } from '../types/auth.types';

const AUTH_STORAGE_KEY = 'learnpath-auth';
const LEGACY_AUTH_STORAGE_KEY = 'learnpath.auth';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

export interface AuthActions {
  login: (payload: LoginResponse) => void;
  logout: () => void;
  refreshSession: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
};

const hasActiveSession = (state: Pick<AuthState, 'accessToken' | 'user'>) => {
  return Boolean(state.accessToken && state.user);
};

const clearPersistedAuth = () => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  window.localStorage.removeItem(LEGACY_AUTH_STORAGE_KEY);
};

export const useAuthStore = create<AuthStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        login: ({ accessToken, refreshToken, user }) => {
          set(
            {
              accessToken,
              refreshToken,
              user,
              isAuthenticated: hasActiveSession({ accessToken, user }),
            },
            false,
            'auth/login',
          );
        },
        logout: () => {
          set(initialState, false, 'auth/logout');
          clearPersistedAuth();
        },
        refreshSession: async () => {
          const currentRefreshToken = get().refreshToken;

          if (!currentRefreshToken) {
            get().logout();
            return;
          }

          const response = await fetch(`${env.API_URL}/api/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken: currentRefreshToken }),
          });

          if (!response.ok) {
            get().logout();
            throw new Error('No pudimos refrescar la sesion.');
          }

          const data = (await response.json()) as RefreshSessionResponse;

          set(
            {
              accessToken: data.accessToken,
              refreshToken: data.refreshToken,
              isAuthenticated: hasActiveSession({
                accessToken: data.accessToken,
                user: get().user,
              }),
            },
            false,
            'auth/refreshSession',
          );
        },
      }),
      {
        name: AUTH_STORAGE_KEY,
        partialize: ({ user, accessToken, refreshToken, isAuthenticated }) => ({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: hasActiveSession({ user, accessToken }) && isAuthenticated,
        }),
        onRehydrateStorage: () => (state) => {
          if (!state) {
            return;
          }

          state.isAuthenticated = hasActiveSession(state);
        },
      },
    ),
    {
      name: 'AuthStore',
      enabled: env.APP_ENV === 'development' || env.DEBUG,
    },
  ),
);

export const useAuthUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () =>
  useAuthStore((state) => hasActiveSession({ accessToken: state.accessToken, user: state.user }));
export const useAccessToken = () => useAuthStore((state) => state.accessToken);
export const useRefreshToken = () => useAuthStore((state) => state.refreshToken);
export const useAuthActions = () =>
  useAuthStore(
    useShallow((state) => ({
      login: state.login,
      logout: state.logout,
      refreshSession: state.refreshSession,
    })),
  );
