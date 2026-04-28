
import { type ReactNode } from 'react';
import { useLayout } from './LayoutContext';

interface LayoutContentProps {
  children?: ReactNode;
}

export const LayoutContent = ({ children }: LayoutContentProps) => {
  
  useLayout();

  return (
    <main className="[grid-area:content] overflow-auto bg-muted/10">
      {children}
    </main>
  );
};