import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useIsAuthenticated, useIsAuthHydrated } from '../store/authStore';
import { AuthLoading } from './AuthLoading';

type ProtectedRouteProps = {
  children?: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const isHydrated = useIsAuthHydrated();
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isHydrated) {
    return <AuthLoading />;
  }

  if (!isAuthenticated) {
    const redirect = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
  }

  return children ?? <Outlet />;
}
