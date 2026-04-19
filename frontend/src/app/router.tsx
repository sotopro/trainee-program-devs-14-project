/**
 * Placeholder para la configuración de rutas de la aplicación.
 */

import type { ReactNode } from 'react';

interface RouterPlaceholderProps {
  children?: ReactNode;
}

export function AppRouter({ children }: RouterPlaceholderProps) {
  return <>{children}</>;
}