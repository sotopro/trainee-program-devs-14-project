import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { ProtectedRoute, RoleGuard } from '@/features/auth';
import { Home, Login, Register, Unauthorized } from '@/pages';
import { SectionErrorBoundary } from '@/shared/providers';
import { AppLayout, PageShell } from '@/shared/components/layout';
import { Button } from '@/shared/components/ui/button';

function AdminDashboard() {
  return <h1>Panel de administracion</h1>;
}

// implementation example of the PageShell component for the Catalog section.
function Catalog() {
  return (
    <PageShell 
      title="Catálogo de Cursos" 
      actions={<Button>Nuevo Curso</Button>}
    >
      <div className="p-6 border-2 border-dashed border-muted-foreground/25 rounded-lg h-96 flex items-center justify-center text-muted-foreground">
        Aquí irá la cuadrícula (Grid) con las tarjetas de los cursos.
      </div>
    </PageShell>
  );
}

function Courses() {
  return <h1>Cursos</h1>;
}

function LearningPaths() {
  return <h1>Rutas de aprendizaje</h1>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute />}>

        <Route element={
          <AppLayout>
            <AppLayout.Header />
            <AppLayout.Sidebar />
            <AppLayout.Content>

              <Outlet /> 
            </AppLayout.Content>
            <AppLayout.Footer />
          </AppLayout>
        }>
      
          <Route
            path="/catalog"
            element={
              <SectionErrorBoundary name="Catalog">
                <Catalog />
              </SectionErrorBoundary>
            }
          />
          <Route
            path="/courses/*"
            element={
              <SectionErrorBoundary name="Courses">
                <Courses />
              </SectionErrorBoundary>
            }
          />
          <Route
            path="/learning-paths/*"
            element={
              <SectionErrorBoundary name="LearningPaths">
                <LearningPaths />
              </SectionErrorBoundary>
            }
          />

          <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
            <Route
              path="/admin/dashboard"
              element={
                <SectionErrorBoundary name="AdminDashboard" fallbackVariant="card">
                  <AdminDashboard />
                </SectionErrorBoundary>
              }
            />
          </Route>
        
        </Route>

      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
