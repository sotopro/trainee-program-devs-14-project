import type { ComponentType } from 'react';
import { SectionErrorBoundary } from '@/shared/providers';
import type { ErrorFallbackVariant } from '../feedback';

type BoundaryVariant = Extract<ErrorFallbackVariant, 'inline' | 'card'>;

const getDisplayName = (Component: ComponentType<unknown>) => {
  return Component.displayName || Component.name || 'Component';
};

export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  fallbackVariant: BoundaryVariant = 'inline',
) {
  function WithErrorBoundaryComponent(props: P) {
    return (
      <SectionErrorBoundary
        fallbackVariant={fallbackVariant}
        name={`withErrorBoundary(${getDisplayName(WrappedComponent as ComponentType<unknown>)})`}
      >
        <WrappedComponent {...props} />
      </SectionErrorBoundary>
    );
  }

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${getDisplayName(
    WrappedComponent as ComponentType<unknown>,
  )})`;

  return WithErrorBoundaryComponent;
}
