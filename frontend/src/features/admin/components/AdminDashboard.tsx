import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDashboardStats } from '../hooks/useDashboardStats';
import { AdminSidebar } from './AdminSidebar';
import { QuickActions } from './QuickActions';
import { RecentActivityList } from './RecentActivityList';
import { StatsCard } from './StatsCard';

function CoursesIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function EnrollmentsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function AdminDashboard() {
  const { stats, recentActivity, isLoading, error, refetch } = useDashboardStats();

  return (
    <main className="min-h-svh bg-[var(--bg)]">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[240px_1fr]">
        <AdminSidebar />

        <section className="grid gap-6" aria-labelledby="admin-dashboard-title">
          <div className="grid gap-2">
            <p className="text-sm font-semibold uppercase text-primary">Panel de administracion</p>
            <h1 id="admin-dashboard-title" className="text-3xl font-bold">
              Dashboard
            </h1>
            <p>Metricas principales, actividad reciente y accesos de gestion.</p>
          </div>

          {error ? (
            <Card className="border-destructive bg-[var(--danger-bg)]">
              <CardHeader>
                <CardTitle>No pudimos cargar el dashboard</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <p>Intenta nuevamente. Si el problema continua, revisa la conexion con el API.</p>
                <Button className="w-fit" type="button" onClick={() => void refetch()}>
                  Reintentar
                </Button>
              </CardContent>
            </Card>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <StatsCard title="Total de cursos" value={stats?.totalCourses} icon={<CoursesIcon />} isLoading={isLoading} />
            <StatsCard title="Usuarios registrados" value={stats?.totalUsers} icon={<UsersIcon />} isLoading={isLoading} />
            <StatsCard
              title="Inscripciones activas"
              value={stats?.activeEnrollments}
              icon={<EnrollmentsIcon />}
              isLoading={isLoading}
            />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
            <RecentActivityList items={recentActivity} isLoading={isLoading} />
            <QuickActions />
          </div>
        </section>
      </div>
    </main>
  );
}
