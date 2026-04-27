import { Navigate, Route, Routes } from 'react-router-dom';
import { Home, Login, Register } from '@/pages';

function AdminDashboard() {
  return <h1>Panel de administración</h1>;
}

function Catalog() {
  return <h1>Catálogo de cursos</h1>;
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
