/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface LayoutContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  setCollapsed: (value: boolean) => void;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

const STORAGE_KEY = 'learnpath-sidebar-collapsed';

export const LayoutProvider = ({ children }: { children: ReactNode }) => {
  
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isCollapsed));
  }, [isCollapsed]);

  const toggleSidebar = () => setIsCollapsed((prev) => !prev);
  const setCollapsed = (value: boolean) => setIsCollapsed(value);

  return (
    <LayoutContext.Provider value={{ isCollapsed, toggleSidebar, setCollapsed }}>
      {children}
    </LayoutContext.Provider>
  );
};

export const useLayout = () => {
  const context = useContext(LayoutContext);
  
  if (context === undefined) {
    throw new Error('useLayout debe ser usado dentro de un LayoutProvider (AppLayout)');
  }
  
  return context;
};