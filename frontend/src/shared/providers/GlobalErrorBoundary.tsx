import { Component, type ErrorInfo, type ReactNode } from 'react';
import { ErrorFallback } from '@/shared/components/feedback/ErrorFallback';
import { notifyError } from './notificationEvents';

type GlobalErrorBoundaryProps = {
  children: ReactNode;
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

export class GlobalErrorBoundary extends Component<GlobalErrorBoundaryProps, ErrorBoundaryState> {
  state = initialState;

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      componentStack: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GlobalErrorBoundary caught:', error, errorInfo.componentStack);
    notifyError(error, 'GlobalErrorBoundary');
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
          variant="full-page"
        />
      );
    }

    return this.props.children;
  }
}
