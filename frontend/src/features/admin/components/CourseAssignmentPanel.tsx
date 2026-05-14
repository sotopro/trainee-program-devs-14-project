import { useCallback, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useCourses } from '@/features/courses';
import { useDebounce } from '@/shared/hooks';
import { notify } from '@/shared/providers/notificationEvents';
import { useAssignableUsers, useAssignCourse, useUnassignCourse } from '../hooks/useCourseAssignments';
import type { AssignmentUser } from '../types/course-assignment.types';
import { AdminSidebar } from './AdminSidebar';
import { UserRow } from './UserRow';

const pageSize = 10;

export function CourseAssignmentPanel() {
  const [searchParams, setSearchParams] = useSearchParams();
  const coursesQuery = useCourses({ status: 'ALL', page: 1, pageSize: 100 });
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(() => new Set());
  const [selectedUsersById, setSelectedUsersById] = useState<Map<string, AssignmentUser>>(() => new Map());
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const currentPage = Number(searchParams.get('page') ?? '1') || 1;

  const courses = useMemo(() => coursesQuery.data?.courses ?? [], [coursesQuery.data?.courses]);
  const activeCourseId = selectedCourseId || courses[0]?.id || '';
  const selectedCourse = courses.find((course) => course.id === activeCourseId);
  const assignableUsersQuery = useAssignableUsers(activeCourseId, {
    search: debouncedSearchTerm,
    page: currentPage,
    limit: pageSize,
  });
  const assignCourse = useAssignCourse(activeCourseId);
  const unassignCourse = useUnassignCourse(activeCourseId);
  const visibleUsers = assignableUsersQuery.data?.users ?? [];
  const totalPages = assignableUsersQuery.data?.totalPages ?? 1;
  const safeCurrentPage = assignableUsersQuery.data?.currentPage ?? Math.min(currentPage, totalPages);

  const selectedCount = selectedUserIds.size;
  const selectedUsers = useMemo(() => {
    return Array.from(selectedUsersById.values()).filter((user) => selectedUserIds.has(user.id));
  }, [selectedUserIds, selectedUsersById]);
  const hasAssignableSelection = selectedUsers.some((user) => !user.assignedAt);
  const hasUnassignableSelection = selectedUsers.some((user) => Boolean(user.assignedAt));

  const setPage = useCallback(
    (page: number) => {
      setSearchParams((current) => {
        const nextParams = new URLSearchParams(current);
        nextParams.set('page', String(page));
        return nextParams;
      });
    },
    [setSearchParams],
  );

  const toggleUserSelection = useCallback((user: AssignmentUser) => {
    setSelectedUserIds((current) => {
      const nextSelection = new Set(current);

      if (nextSelection.has(user.id)) {
        nextSelection.delete(user.id);
      } else {
        nextSelection.add(user.id);
      }

      return nextSelection;
    });
    setSelectedUsersById((current) => {
      const nextUsers = new Map(current);

      if (nextUsers.has(user.id)) {
        nextUsers.delete(user.id);
      } else {
        nextUsers.set(user.id, user);
      }

      return nextUsers;
    });
  }, []);

  const handleCourseChange = useCallback(
    (courseId: string) => {
      setSelectedCourseId(courseId);
      setSelectedUserIds(new Set());
      setSelectedUsersById(new Map());
      setPage(1);
    },
    [setPage],
  );

  const handleAssign = useCallback((userId: string) => {
    assignCourse.mutate(userId, {
      onSuccess: () => {
        void assignableUsersQuery.refetch();
        notify({
          title: 'Usuario asignado',
          description: 'El usuario fue asignado al curso seleccionado.',
          variant: 'success',
        });
      },
      onError: () => {
        notify({
          title: 'Asignacion pendiente de API',
          description: 'La UI quedo actualizada localmente, pero el endpoint de asignacion aun no respondio correctamente.',
          variant: 'info',
        });
      },
    });
  }, [assignCourse, assignableUsersQuery]);

  const handleUnassign = useCallback((userId: string) => {
    unassignCourse.mutate(userId, {
      onSuccess: () => {
        void assignableUsersQuery.refetch();
        notify({
          title: 'Usuario desasignado',
          description: 'El usuario fue removido del curso seleccionado.',
          variant: 'success',
        });
      },
      onError: () => {
        notify({
          title: 'Desasignacion pendiente de API',
          description: 'La UI quedo actualizada localmente, pero el endpoint de desasignacion aun no respondio correctamente.',
          variant: 'info',
        });
      },
    });
  }, [assignableUsersQuery, unassignCourse]);

  const handleBulkAssign = useCallback(() => {
    const assignableCount = selectedUsers.filter((user) => !user.assignedAt).length;

    setSelectedUserIds(new Set());
    setSelectedUsersById(new Map());
    Promise.all(selectedUsers.filter((user) => !user.assignedAt).map((user) => assignCourse.mutateAsync(user.id)))
      .then(() => {
        void assignableUsersQuery.refetch();
        notify({
          title: 'Usuarios asignados',
          description: `${assignableCount} ${assignableCount === 1 ? 'usuario fue asignado' : 'usuarios fueron asignados'} correctamente.`,
          variant: 'success',
        });
      })
      .catch(() => {
        notify({
          title: 'Asignaciones pendientes de API',
          description: 'La UI quedo actualizada localmente, pero el endpoint de asignacion aun no respondio correctamente.',
          variant: 'info',
        });
      });
  }, [assignCourse, assignableUsersQuery, selectedUsers]);

  const handleBulkUnassign = useCallback(() => {
    const unassignableCount = selectedUsers.filter((user) => Boolean(user.assignedAt)).length;

    setSelectedUserIds(new Set());
    setSelectedUsersById(new Map());
    Promise.all(selectedUsers.filter((user) => user.assignedAt).map((user) => unassignCourse.mutateAsync(user.id)))
      .then(() => {
        void assignableUsersQuery.refetch();
        notify({
          title: 'Usuarios desasignados',
          description: `${unassignableCount} ${
            unassignableCount === 1 ? 'usuario fue desasignado' : 'usuarios fueron desasignados'
          } correctamente.`,
          variant: 'success',
        });
      })
      .catch(() => {
        notify({
          title: 'Desasignaciones pendientes de API',
          description: 'La UI quedo actualizada localmente, pero el endpoint de desasignacion aun no respondio correctamente.',
          variant: 'info',
        });
      });
  }, [assignableUsersQuery, selectedUsers, unassignCourse]);

  return (
    <main className="min-h-svh bg-[var(--bg)]">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6 md:px-6 lg:grid-cols-[240px_1fr]">
        <AdminSidebar />

        <section className="grid gap-6" aria-labelledby="course-assignment-title">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Panel de administracion</p>
            <h1 id="course-assignment-title" className="text-3xl font-bold">
              Asignacion de cursos
            </h1>
          </div>
          <Button asChild variant="outline">
            <Link to="/admin/dashboard">Volver al dashboard</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Curso a asignar</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {coursesQuery.isLoading ? (
              <Skeleton className="h-10 w-full max-w-xl" />
            ) : coursesQuery.error ? (
              <div className="grid gap-3 rounded-lg border border-destructive bg-[var(--danger-bg)] p-4">
                <p className="font-semibold text-destructive">No pudimos cargar los cursos.</p>
                <Button className="w-fit" type="button" onClick={() => void coursesQuery.refetch()}>
                  Reintentar
                </Button>
              </div>
            ) : courses.length > 0 ? (
              <label className="grid max-w-xl gap-2">
                <span className="font-semibold text-foreground">Selecciona un curso</span>
                <select
                  className="h-10 rounded-lg border border-input bg-background px-3 text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                  value={activeCourseId}
                  onChange={(event) => handleCourseChange(event.target.value)}
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                No hay cursos disponibles para asignar.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios disponibles</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            {selectedCourse ? (
              <p className="text-sm text-muted-foreground">
                Mostrando usuarios disponibles para asignar a {selectedCourse.title}.
              </p>
            ) : null}
            {assignableUsersQuery.error ? (
              <p className="rounded-lg border border-border bg-[var(--bg)] p-3 text-sm text-muted-foreground">
                No pudimos cargar los usuarios disponibles. Revisa la conexion con el API e intenta nuevamente.
              </p>
            ) : null}

            <label className="grid max-w-xl gap-2">
              <span className="font-semibold text-foreground">Buscar usuario</span>
              <Input
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setPage(1);
                }}
                placeholder="Buscar por nombre o email"
              />
            </label>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-[var(--bg)] p-3">
              <p className="text-sm font-semibold text-foreground">
                {selectedCount} {selectedCount === 1 ? 'usuario seleccionado' : 'usuarios seleccionados'}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  onClick={handleBulkAssign}
                  disabled={!activeCourseId || selectedCount === 0 || !hasAssignableSelection}
                >
                  Asignar seleccionados
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBulkUnassign}
                  disabled={!activeCourseId || selectedCount === 0 || !hasUnassignableSelection}
                >
                  Desasignar seleccionados
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table className="min-w-[860px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Seleccion</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Fecha de asignacion</TableHead>
                    <TableHead className="text-right">Accion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                      {assignableUsersQuery.isLoading
                    ? Array.from({ length: pageSize }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell className="p-4" colSpan={6}>
                            <Skeleton className="h-8 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    : visibleUsers.map((user) => (
                        <UserRow
                          key={user.id}
                          user={user}
                          isSelected={selectedUserIds.has(user.id)}
                          isCourseSelected={Boolean(activeCourseId)}
                          onAssign={handleAssign}
                          onToggleSelection={toggleUserSelection}
                          onUnassign={handleUnassign}
                        />
                      ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                Pagina {safeCurrentPage} de {totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={safeCurrentPage <= 1}
                  onClick={() => setPage(Math.max(1, safeCurrentPage - 1))}
                >
                  Anterior
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={safeCurrentPage >= totalPages}
                  onClick={() => setPage(Math.min(totalPages, safeCurrentPage + 1))}
                >
                  Siguiente
                </Button>
              </div>
            </div>
            {!assignableUsersQuery.isLoading && visibleUsers.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                No hay usuarios que coincidan con la busqueda.
              </p>
            ) : null}
          </CardContent>
        </Card>
        </section>
      </div>
    </main>
  );
}
