import { Link, NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  {
    label: 'Dashboard',
    to: '/admin/dashboard',
  },
  {
    label: 'Cursos',
    to: '/admin/courses',
  },
  {
    label: 'Asignaciones',
    to: '/admin/users',
  },
];

export function AdminSidebar() {
  return (
    <aside className="rounded-lg border border-border bg-background p-4 lg:sticky lg:top-6 lg:h-[calc(100svh-48px)]">
      <Link to="/admin/dashboard" className="admin-brand block text-lg font-bold no-underline">
        LearnPath Admin
      </Link>
      <nav className="mt-6 grid gap-2" aria-label="Administracion">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            className={({ isActive }) =>
              cn('admin-nav-link rounded-lg px-3 py-2 text-sm font-semibold no-underline', isActive && 'admin-nav-link--active')
            }
            to={item.to}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
