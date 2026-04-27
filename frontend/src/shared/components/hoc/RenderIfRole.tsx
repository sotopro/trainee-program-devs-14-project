import type { ReactNode } from 'react';
import { useAuthUser } from '@/features/auth/store/authStore';
import type { User, UserRole } from '@/features/auth/types/auth.types';

type RenderIfRoleChildren = ReactNode | ((user: User) => ReactNode);

type RenderIfRoleProps = {
  role?: UserRole;
  roles?: UserRole[];
  children: RenderIfRoleChildren;
  fallback?: ReactNode;
};

export function RenderIfRole({ role, roles, children, fallback = null }: RenderIfRoleProps) {
  const user = useAuthUser();
  const allowedRoles = roles ?? (role ? [role] : []);

  if (!user || !allowedRoles.includes(user.role)) {
    return <>{fallback}</>;
  }

  return <>{typeof children === 'function' ? children(user) : children}</>;
}
