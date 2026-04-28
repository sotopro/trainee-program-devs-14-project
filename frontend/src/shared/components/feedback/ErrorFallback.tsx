import { Button } from '@/shared/components/ui/button';
import { env } from '@/config/env';

export type ErrorFallbackVariant = 'full-page' | 'inline' | 'card';

export type ErrorFallbackProps = {
  error: Error | null;
  componentStack?: string | null;
  resetErrorBoundary: () => void;
  variant: ErrorFallbackVariant;
};

const variantClassName: Record<ErrorFallbackVariant, string> = {
  'full-page': 'error-fallback error-fallback--full-page',
  inline: 'error-fallback error-fallback--inline',
  card: 'error-fallback error-fallback--card',
};

export function ErrorFallback({
  error,
  componentStack,
  resetErrorBoundary,
  variant,
}: ErrorFallbackProps) {
  const isFullPage = variant === 'full-page';
  const showDebugInfo = env.DEBUG || env.APP_ENV === 'development';

  return (
    <div className={variantClassName[variant]} role="alert">
      {isFullPage ? (
        <div className="error-fallback__illustration" aria-hidden="true">
          !
        </div>
      ) : null}

      <div className="error-fallback__content">
        <p className="error-fallback__eyebrow">LearnPath</p>
        <h1>{isFullPage ? 'Algo salio mal' : 'No pudimos cargar esta seccion'}</h1>
        <p>
          Ocurrio un error inesperado. Reintenta y, si sigue pasando, avisa al equipo.
        </p>

        <Button type="button" onClick={resetErrorBoundary} className="error-fallback__action">
          Reintentar
        </Button>

        {showDebugInfo ? (
          <details className="error-fallback__debug">
            <summary>Informacion tecnica</summary>
            <pre>{error?.stack ?? error?.message ?? 'Error desconocido'}</pre>
            {componentStack ? <pre>{componentStack}</pre> : null}
          </details>
        ) : null}
      </div>
    </div>
  );
}
