import { type ReactNode } from 'react';
import { useLayout } from './LayoutContext';

interface LayoutSidebarProps {
  children?: ReactNode;
}

export const LayoutSidebar = ({ children }: LayoutSidebarProps) => {
  
  useLayout();

  return (
    <aside className="[grid-area:sidebar] border-r bg-background">
      {children}
    </aside>
  );
};