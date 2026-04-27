import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthUser, useIsAuthHydrated } from '../store/authStore';
import type { UserRole } from '../types/auth.types';
import { AuthLoading } from './AuthLoading';

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children?: ReactNode;
};

export function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const isHydrated = useIsAuthHydrated();
  const user = useAuthUser();

  if (!isHydrated) {
    return <AuthLoading />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ?? <Outlet />;
}
