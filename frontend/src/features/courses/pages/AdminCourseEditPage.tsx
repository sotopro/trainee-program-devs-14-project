import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CourseForm } from '../components/CourseForm';
import { ModuleAccordion } from '../components/ModuleAccordion';
import { useCourse, useUpdateCourse } from '../hooks/useCourses';
import type { CourseFormData } from '../schemas/course.schema';
import type { CourseDetail } from '../types/course.types';

const toFormData = (course: CourseFormData): CourseFormData => ({
  title: course.title,
  description: course.description,
  thumbnail: course.thumbnail,
  isPublic: course.isPublic,
  modules: course.modules,
});

const reorderById = <T extends { id?: string; order: number }>(items: T[], sourceId: string, targetId: string): T[] => {
  const sourceIndex = items.findIndex((item) => item.id === sourceId);
  const targetIndex = items.findIndex((item) => item.id === targetId);

  if (sourceIndex < 0 || targetIndex < 0 || sourceIndex === targetIndex) {
    return items;
  }

  const nextItems = [...items];
  const [movedItem] = nextItems.splice(sourceIndex, 1);
  nextItems.splice(targetIndex, 0, movedItem);

  return nextItems.map((item, index) => ({
    ...item,
    order: index + 1,
  }));
};

export function AdminCourseEditPage() {
  const { courseId } = useParams();
  const courseQuery = useCourse(courseId);
  const updateCourse = useUpdateCourse(courseId ?? '');
  const [formError, setFormError] = useState<string | null>(null);

  if (!courseId) {
    return <Navigate to="/admin/courses" replace />;
  }

  const handleSubmit = async (values: CourseFormData) => {
    setFormError(null);

    try {
      await updateCourse.mutateAsync(values);
    } catch {
      setFormError('No pudimos guardar los cambios. Revisa los datos e intenta nuevamente.');
    }
  };

  const persistCourseStructure = async (nextCourse: CourseDetail) => {
    setFormError(null);

    try {
      await updateCourse.mutateAsync(toFormData(nextCourse));
    } catch {
      setFormError('No pudimos guardar la estructura del curso. Intenta nuevamente.');
    }
  };

  const handleReorderModules = (sourceModuleId: string, targetModuleId: string) => {
    if (!courseQuery.data) {
      return;
    }

    void persistCourseStructure({
      ...courseQuery.data,
      modules: reorderById(courseQuery.data.modules, sourceModuleId, targetModuleId),
    });
  };

  const handleReorderLessons = (moduleId: string, sourceLessonId: string, targetLessonId: string) => {
    if (!courseQuery.data) {
      return;
    }

    void persistCourseStructure({
      ...courseQuery.data,
      modules: courseQuery.data.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: reorderById(module.lessons, sourceLessonId, targetLessonId),
            }
          : module,
      ),
    });
  };

  const handleUpdateModuleTitle = (moduleId: string, title: string) => {
    if (!courseQuery.data) {
      return;
    }

    void persistCourseStructure({
      ...courseQuery.data,
      modules: courseQuery.data.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              title,
            }
          : module,
      ),
    });
  };

  const handleUpdateLessonTitle = (moduleId: string, lessonId: string, title: string) => {
    if (!courseQuery.data) {
      return;
    }

    void persistCourseStructure({
      ...courseQuery.data,
      modules: courseQuery.data.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: module.lessons.map((lesson) =>
                lesson.id === lessonId
                  ? {
                      ...lesson,
                      title,
                    }
                  : lesson,
              ),
            }
          : module,
      ),
    });
  };

  return (
    <main className="min-h-svh bg-[var(--bg)] px-4 py-6 md:px-6">
      <section className="mx-auto grid max-w-5xl gap-6" aria-labelledby="course-edit-title">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Panel de administracion</p>
            <h1 id="course-edit-title" className="text-3xl font-bold">
              Editar curso
            </h1>
          </div>
          <Button asChild variant="outline">
            <Link to="/admin/courses">Volver al listado</Link>
          </Button>
        </div>

        {courseQuery.isLoading ? (
          <Card>
            <CardHeader>
              <CardTitle>Cargando curso</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ) : courseQuery.error || !courseQuery.data ? (
          <Card className="border-destructive bg-[var(--danger-bg)]">
            <CardHeader>
              <CardTitle>No pudimos cargar el curso</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              <p>Intenta nuevamente o vuelve al listado de cursos.</p>
              <Button className="w-fit" type="button" onClick={() => void courseQuery.refetch()}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle>Estructura del curso</CardTitle>
              </CardHeader>
              <CardContent>
                <ModuleAccordion
                  modules={courseQuery.data.modules}
                  onReorderModules={handleReorderModules}
                  onReorderLessons={handleReorderLessons}
                  onUpdateModuleTitle={handleUpdateModuleTitle}
                  onUpdateLessonTitle={handleUpdateLessonTitle}
                />
              </CardContent>
            </Card>

            <CourseForm
              initialValues={toFormData(courseQuery.data)}
              submitLabel="Guardar cambios"
              isSubmitting={updateCourse.isPending}
              onSubmit={(values) => void handleSubmit(values)}
              formError={formError}
            />
          </>
        )}
      </section>
    </main>
  );
}
