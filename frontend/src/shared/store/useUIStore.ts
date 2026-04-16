import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { env } from '../../config/env';

interface UIState {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>()(
  devtools(
    (set) => ({
      isSidebarOpen: true,
      toggleSidebar: () =>
        set((state) => ({ isSidebarOpen: !state.isSidebarOpen }), false, 'ui/toggleSidebar'),
      setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }, false, 'ui/setSidebarOpen'),
    }),
    {
      name: 'UIStore',
      enabled: env.APP_ENV === 'development' || env.DEBUG,
    },
  ),
);
