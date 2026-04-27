import { Component, type ErrorInfo, type ReactNode } from 'react';
import {
  ErrorFallback,
  type ErrorFallbackVariant,
} from '@/shared/components/feedback/ErrorFallback';
import { notifyError } from './notificationEvents';

type SectionErrorBoundaryProps = {
  children: ReactNode;
  fallbackVariant?: Extract<ErrorFallbackVariant, 'inline' | 'card'>;
  name?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
  componentStack: string | null;
};

const initialState: ErrorBoundaryState = {
  hasError: false,
  error: null,
  componentStack: null,
};

export class SectionErrorBoundary extends Component<
  SectionErrorBoundaryProps,
  ErrorBoundaryState
> {
  state = initialState;

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      componentStack: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const source = this.props.name ?? 'SectionErrorBoundary';
    console.error(`${source} caught:`, error, errorInfo.componentStack);
    notifyError(error, source);
    this.setState({ componentStack: errorInfo.componentStack ?? null });
  }

  private handleReset = () => {
    this.setState(initialState);
  };

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          componentStack={this.state.componentStack}
          resetErrorBoundary={this.handleReset}
          variant={this.props.fallbackVariant ?? 'inline'}
        />
      );
    }

    return this.props.children;
  }
}
