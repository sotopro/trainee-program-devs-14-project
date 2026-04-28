import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import { ProtectedRoute, RoleGuard } from '@/features/auth';
import { Home, Login, Register, Unauthorized } from '@/pages';
import { SectionErrorBoundary } from '@/shared/providers';
import { AppLayout } from '@/shared/components/layout';

function AdminDashboard() {
  return <h1>Panel de administracion</h1>;
}

function Catalog() {
  return <h1>Catalogo de cursos</h1>;
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
