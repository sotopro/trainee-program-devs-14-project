import { type ReactNode } from 'react';
import { useLayout } from './LayoutContext';

interface LayoutHeaderProps {
  children?: ReactNode;
}

export const LayoutHeader = ({ children }: LayoutHeaderProps) => {
  
  useLayout(); 
  
  return (
    <header className="[grid-area:header] border-b bg-background">
      {children}
    </header>
  );
};