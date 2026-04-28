import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Library, 
  GraduationCap, 
  User, 
  BookOpen, 
  Users 
} from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';

interface SidebarNavProps {
  isCollapsed: boolean;
}

const mainLinks = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/' }, 
  { title: 'Catálogo', icon: Library, href: '/catalog' },
  { title: 'Mis Cursos', icon: GraduationCap, href: '/courses' },
  { title: 'Perfil', icon: User, href: '/perfil' }, // Placeholder
];

const adminLinks = [
  { title: 'Dashboard Admin', icon: LayoutDashboard, href: '/admin/dashboard' },
  { title: 'Gestión de Cursos', icon: BookOpen, href: '/admin/cursos' }, // Placeholder
  { title: 'Usuarios', icon: Users, href: '/admin/usuarios' }, // Placeholder
];

export const SidebarNav = ({ isCollapsed }: SidebarNavProps) => {
  
  const location = useLocation();

  return (
    <nav className="flex flex-col gap-4 py-4 w-full">
      <div className="flex flex-col gap-1 px-2">
        {mainLinks.map((link) => {
          
          const isActive = location.pathname === link.href || 
                          (link.href !== '/' && location.pathname.startsWith(link.href));

          return (
            <Button
              key={link.title}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start transition-all duration-200",
                isCollapsed ? "px-0 justify-center" : "px-4"
              )}
              title={isCollapsed ? link.title : undefined}
              asChild 
            >
              <Link to={link.href}>
                <link.icon className={cn("h-5 w-5 shrink-0", isCollapsed ? "mr-0" : "mr-3")} />
                {!isCollapsed && <span className="truncate">{link.title}</span>}
              </Link>
            </Button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1 px-2">
        {!isCollapsed ? (
          <h4 className="px-4 mt-2 mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Administración
          </h4>
        ) : (
          <div className="mx-4 mt-2 mb-1 border-t border-border" />
        )}

        {adminLinks.map((link) => {
          const isActive = location.pathname.startsWith(link.href);

          return (
            <Button
              key={link.title}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start transition-all duration-200",
                isCollapsed ? "px-0 justify-center" : "px-4"
              )}
              title={isCollapsed ? link.title : undefined}
              asChild
            >
              <Link to={link.href}>
                <link.icon className={cn("h-5 w-5 shrink-0", isCollapsed ? "mr-0" : "mr-3")} />
                {!isCollapsed && <span className="truncate">{link.title}</span>}
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
};