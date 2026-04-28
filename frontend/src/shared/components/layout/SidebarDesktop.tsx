import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLayout } from './LayoutContext';
import { SidebarNav } from './SidebarNav';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';

export const SidebarDesktop = () => {
  
  const { isCollapsed, toggleSidebar } = useLayout();

  return (
    <aside
      className={cn(
        "[grid-area:sidebar] hidden md:flex flex-col border-r bg-background transition-all duration-300 relative h-full",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        
        <SidebarNav isCollapsed={isCollapsed} />
      </div>

      <div className="p-2 border-t flex justify-center mt-auto bg-background">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 rounded-full"
          aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>
    </aside>
  );
};