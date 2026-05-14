import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useCourses, useDeleteCourse } from '../hooks/useCourses';
import type { CourseStatus } from '../types/course.types';

const pageSize = 10;

const statusLabels: Record<CourseStatus | 'ALL', string> = {
  ALL: 'Todos',
  DRAFT: 'Borrador',
  PUBLISHED: 'Publicado',
  ARCHIVED: 'Archivado',
};

export function AdminCoursesPage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<CourseStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(1);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);
  const coursesQuery = useCourses({ search, status, page, pageSize });
  const deleteCourse = useDeleteCourse();

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil((coursesQuery.data?.total ?? 0) / pageSize));
  }, [coursesQuery.data?.total]);

  const handleDelete = async () => {
    if (!courseToDelete) {
      return;
    }

    await deleteCourse.mutateAsync(courseToDelete);
    setCourseToDelete(null);
  };

  return (
    <main className="min-h-svh bg-[var(--bg)] px-4 py-6 md:px-6">
      <section className="mx-auto grid max-w-7xl gap-6" aria-labelledby="courses-title">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Panel de administracion</p>
            <h1 id="courses-title" className="text-3xl font-bold">
              Cursos
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/admin/dashboard">Volver al dashboard</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/courses/new">Crear nuevo curso</Link>
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Gestion de cursos</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-[1fr_220px]">
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por titulo"
              />
              <select
                className="h-8 rounded-lg border border-input bg-background px-2 text-foreground"
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value as CourseStatus | 'ALL');
                  setPage(1);
                }}
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {coursesQuery.isLoading ? (
              <div className="grid gap-3">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Skeleton key={index} className="h-16 w-full" />
                ))}
              </div>
            ) : coursesQuery.error ? (
              <div className="grid gap-3 rounded-lg border border-destructive bg-[var(--danger-bg)] p-4">
                <p className="font-semibold text-destructive">No pudimos cargar los cursos.</p>
                <Button className="w-fit" type="button" onClick={() => void coursesQuery.refetch()}>
                  Reintentar
                </Button>
              </div>
            ) : coursesQuery.data?.courses.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse text-left">
                  <thead>
                    <tr className="border-b border-border text-sm text-muted-foreground">
                      <th className="py-3 pr-4">Curso</th>
                      <th className="py-3 pr-4">Estado</th>
                      <th className="py-3 pr-4">Visibilidad</th>
                      <th className="py-3 pr-4">Actualizado</th>
                      <th className="py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coursesQuery.data.courses.map((course) => (
                      <tr key={course.id} className="border-b border-border last:border-b-0">
                        <td className="py-4 pr-4">
                          <p className="font-semibold text-foreground">{course.title}</p>
                          <p className="line-clamp-1 text-sm text-muted-foreground">{course.description}</p>
                        </td>
                        <td className="py-4 pr-4">{statusLabels[course.status]}</td>
                        <td className="py-4 pr-4">{course.isPublic ? 'Publico' : 'Privado'}</td>
                        <td className="py-4 pr-4">{new Date(course.updatedAt).toLocaleDateString('es-PE')}</td>
                        <td className="py-4">
                          <div className="flex justify-end gap-2">
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/courses/${course.id}`}>Ver</Link>
                            </Button>
                            <Button asChild variant="outline" size="sm">
                              <Link to={`/admin/courses/${course.id}/edit`}>Editar</Link>
                            </Button>
                            <Button type="button" variant="destructive" size="sm" onClick={() => setCourseToDelete(course.id)}>
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                No hay cursos que coincidan con los filtros.
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Pagina {page} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button type="button" variant="outline" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {courseToDelete ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Eliminar curso</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p>Esta accion no se puede deshacer. Confirma que quieres eliminar este curso.</p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setCourseToDelete(null)}>
                  Cancelar
                </Button>
                <Button type="button" variant="destructive" disabled={deleteCourse.isPending} onClick={() => void handleDelete()}>
                  {deleteCourse.isPending ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </main>
  );
}
