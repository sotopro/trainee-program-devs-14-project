import {
  type ComponentType,
  type RefAttributes,
  type ReactNode,
  createElement,
  forwardRef,
} from 'react';
import { Navigate } from 'react-router-dom';
import { AuthLoading } from '@/features/auth/components/AuthLoading';
import { useAuthUser, useIsAuthHydrated } from '@/features/auth/store/authStore';
import type { UserRole } from '@/features/auth/types/auth.types';

const getDisplayName = (Component: ComponentType<unknown>) => {
  return Component.displayName || Component.name || 'Component';
};

type ComponentWithRef<P extends object, R> = ComponentType<P & RefAttributes<R>>;

type WithRoleOptions = {
  fallback?: ReactNode;
  redirectTo?: string;
};

export function withRole(...roles: UserRole[]) {
  return function withRoleWrapper<P extends object, R = unknown>(
    WrappedComponent: ComponentType<P>,
    options: WithRoleOptions = {},
  ) {
    const WithRoleComponent = forwardRef<R, P>((props, ref) => {
      const isHydrated = useIsAuthHydrated();
      const user = useAuthUser();

      if (!isHydrated) {
        return <AuthLoading />;
      }

      if (!user || !roles.includes(user.role)) {
        if (options.fallback !== undefined) {
          return <>{options.fallback}</>;
        }

        return <Navigate to={options.redirectTo ?? '/unauthorized'} replace />;
      }

      const Component = WrappedComponent as ComponentWithRef<P, R>;
      // eslint-disable-next-line react-hooks/refs -- este HOC debe reenviar refs al componente envuelto.
      return createElement(Component, { ...(props as P), ref } as P & RefAttributes<R>);
    });

    WithRoleComponent.displayName = `withRole(${roles.join(',')})(${getDisplayName(
      WrappedComponent as ComponentType<unknown>,
    )})`;

    return WithRoleComponent;
  };
}
