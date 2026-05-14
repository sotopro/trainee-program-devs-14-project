import { Navigate, Route, Routes } from 'react-router-dom';
import { AdminDashboard, CourseAssignmentPanel } from '@/features/admin';
import { ProtectedRoute, RoleGuard } from '@/features/auth';
import { AdminCourseCreatePage, AdminCourseEditPage, AdminCoursesPage } from '@/features/courses';
import { Home, Login, Register, Unauthorized } from '@/pages';
import { SectionErrorBoundary } from '@/shared/providers';

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

        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route element={<RoleGuard allowedRoles={['ADMIN']} redirectTo="/" />}>
          <Route
            path="/admin/dashboard"
            element={
              <SectionErrorBoundary name="AdminDashboard" fallbackVariant="card">
                <AdminDashboard />
              </SectionErrorBoundary>
            }
          />
          <Route
            path="/admin/courses"
            element={
              <SectionErrorBoundary name="AdminCourses" fallbackVariant="card">
                <AdminCoursesPage />
              </SectionErrorBoundary>
            }
          />
          <Route
            path="/admin/courses/new"
            element={
              <SectionErrorBoundary name="AdminCourseCreate" fallbackVariant="card">
                <AdminCourseCreatePage />
              </SectionErrorBoundary>
            }
          />
          <Route
            path="/admin/courses/:courseId/edit"
            element={
              <SectionErrorBoundary name="AdminCourseEdit" fallbackVariant="card">
                <AdminCourseEditPage />
              </SectionErrorBoundary>
            }
          />
          <Route
            path="/admin/users"
            element={
              <SectionErrorBoundary name="CourseAssignmentPanel" fallbackVariant="card">
                <CourseAssignmentPanel />
              </SectionErrorBoundary>
            }
          />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
