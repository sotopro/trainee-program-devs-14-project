import {
  type ComponentType,
  type RefAttributes,
  type ReactNode,
  createElement,
  forwardRef,
} from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthLoading } from '@/features/auth/components/AuthLoading';
import { useIsAuthenticated, useIsAuthHydrated } from '@/features/auth/store/authStore';

const getDisplayName = (Component: ComponentType<unknown>) => {
  return Component.displayName || Component.name || 'Component';
};

type ComponentWithRef<P extends object, R> = ComponentType<P & RefAttributes<R>>;

export function withAuth<P extends object, R = unknown>(WrappedComponent: ComponentType<P>) {
  const WithAuthComponent = forwardRef<R, P>((props, ref) => {
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

    const Component = WrappedComponent as ComponentWithRef<P, R>;
    // eslint-disable-next-line react-hooks/refs -- este HOC debe reenviar refs al componente envuelto.
    return createElement(Component, { ...(props as P), ref } as P & RefAttributes<R>);
  });

  WithAuthComponent.displayName = `withAuth(${getDisplayName(WrappedComponent as ComponentType<unknown>)})`;

  return WithAuthComponent;
}

export type WithAuthFallback = ReactNode;
