import { useLayout } from './LayoutContext';
import { SidebarNav } from './SidebarNav';
import { Sheet, SheetContent, SheetTitle } from '@/shared/components/ui/sheet';

export const SidebarMobile = () => {
  
  const { isCollapsed, toggleSidebar } = useLayout();

  return (
    <Sheet 
      open={!isCollapsed} 
      onOpenChange={(isOpen) => {
        if (isOpen === isCollapsed) {
          toggleSidebar();
        }
      }}
    >
      <SheetContent side="left" className="w-[280px] p-0 bg-background flex flex-col">
        <div className="sr-only">
          <SheetTitle>Menú de navegación</SheetTitle>
        </div>

        <div className="h-16 flex items-center px-6 border-b font-bold text-xl tracking-tight">
          LearnPath
        </div>

        <div 
          className="flex-1 overflow-y-auto overflow-x-hidden py-4"
          onClick={toggleSidebar}
        >
          <SidebarNav isCollapsed={false} />
        </div>
      </SheetContent>
    </Sheet>
  );
};