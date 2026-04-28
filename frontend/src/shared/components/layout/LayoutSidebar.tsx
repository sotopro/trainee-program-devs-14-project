import { SidebarDesktop } from './SidebarDesktop';
import { SidebarMobile } from './SidebarMobile';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';

export const LayoutSidebar = () => {
  
  const isDesktop = useMediaQuery('(min-width: 768px)');

  return isDesktop ? <SidebarDesktop /> : <SidebarMobile />;
};