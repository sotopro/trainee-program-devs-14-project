import { type ReactNode } from 'react';
import { useLayout } from './LayoutContext';

interface LayoutFooterProps {
  children?: ReactNode;
}

export const LayoutFooter = ({ children }: LayoutFooterProps) => {
  
  useLayout();

  const currentYear = new Date().getFullYear();

  return (
    <footer className="[grid-area:footer] border-t bg-background py-4 px-6 flex items-center justify-center text-sm text-muted-foreground">
      {children ? (
        children
      ) : (
        <p>© {currentYear} LearnPath. Todos los derechos reservados.</p>
      )}
    </footer>
  );
};