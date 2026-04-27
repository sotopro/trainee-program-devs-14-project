import { Navigate, Route, Routes } from 'react-router-dom';
import { ProtectedRoute, RoleGuard } from '@/features/auth';
import { Home, Login, Register, Unauthorized } from '@/pages';

function AdminDashboard() {
  return <h1>Panel de administración</h1>;
}

function Catalog() {
  return <h1>Catálogo de cursos</h1>;
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
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/courses/*" element={<Courses />} />
        <Route path="/learning-paths/*" element={<LearningPaths />} />

        <Route element={<RoleGuard allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
