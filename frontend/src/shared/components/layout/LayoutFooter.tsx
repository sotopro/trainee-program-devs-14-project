import { type ReactNode } from 'react';
import { useLayout } from './LayoutContext';

interface LayoutFooterProps {
  children?: ReactNode;
}

export const LayoutFooter = ({ children }: LayoutFooterProps) => {
  
  useLayout();

  return (
    <footer className="[grid-area:footer] border-t bg-background">
      {children}
    </footer>
  );
};