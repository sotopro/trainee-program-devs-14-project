import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { notify } from '@/shared/providers/notificationEvents';
import { CourseForm } from '../components/CourseForm';
import { ModuleAccordion } from '../components/ModuleAccordion';
import { coursesQueryKey, useCourse, useUpdateCourse } from '../hooks/useCourses';
import { useCreateLesson, useDeleteLesson, useReorderLessons, useUpdateLesson } from '../hooks/useLessons';
import { useCreateModule, useDeleteModule, useReorderModules, useUpdateModule } from '../hooks/useModules';
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

const normalizeModulesOrder = (modules: CourseDetail['modules']): CourseDetail['modules'] =>
  modules.map((module, moduleIndex) => ({
    ...module,
    order: moduleIndex + 1,
    lessons: module.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      order: lessonIndex + 1,
    })),
  }));

export function AdminCourseEditPage() {
  const { courseId } = useParams();
  const queryClient = useQueryClient();
  const courseQuery = useCourse(courseId);
  const updateCourse = useUpdateCourse(courseId ?? '');
  const createModule = useCreateModule(courseId ?? '');
  const updateModule = useUpdateModule(courseId ?? '');
  const deleteModule = useDeleteModule(courseId ?? '');
  const reorderModules = useReorderModules(courseId ?? '');
  const createLesson = useCreateLesson(courseId ?? '');
  const updateLesson = useUpdateLesson(courseId ?? '');
  const deleteLesson = useDeleteLesson(courseId ?? '');
  const reorderLessons = useReorderLessons(courseId ?? '');
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

  const updateCourseCache = (nextCourse: CourseDetail) => {
    queryClient.setQueryData<CourseDetail>([...coursesQueryKey, courseId], nextCourse);
  };

  const handleReorderModules = (sourceModuleId: string, targetModuleId: string) => {
    if (!courseQuery.data) {
      return;
    }

    const nextCourse = {
      ...courseQuery.data,
      modules: reorderById(courseQuery.data.modules, sourceModuleId, targetModuleId),
    };

    updateCourseCache(nextCourse);
    void reorderModules.mutateAsync({ modules: nextCourse.modules }).catch(() => {
      notify({
        title: 'No pudimos reordenar los modulos',
        description: 'La UI se actualizo localmente, pero el servidor rechazo el nuevo orden.',
        variant: 'info',
      });
    });
  };

  const handleReorderLessons = (moduleId: string, sourceLessonId: string, targetLessonId: string) => {
    if (!courseQuery.data) {
      return;
    }

    const nextCourse = {
      ...courseQuery.data,
      modules: courseQuery.data.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              lessons: reorderById(module.lessons, sourceLessonId, targetLessonId),
            }
          : module,
      ),
    };
    const nextModule = nextCourse.modules.find((module) => module.id === moduleId);

    updateCourseCache(nextCourse);
    void reorderLessons.mutateAsync({ moduleId, lessons: nextModule?.lessons ?? [] }).catch(() => {
      notify({
        title: 'Reordenamiento pendiente de API',
        description: 'La UI se actualizo localmente, pero el endpoint de reordenamiento de lecciones aun no respondio correctamente.',
        variant: 'info',
      });
    });
  };

  const handleUpdateModuleTitle = (moduleId: string, title: string) => {
    if (!courseQuery.data) {
      return;
    }

    const currentModule = courseQuery.data.modules.find((module) => module.id === moduleId);
    const nextCourse = {
      ...courseQuery.data,
      modules: courseQuery.data.modules.map((module) =>
        module.id === moduleId
          ? {
              ...module,
              title,
            }
          : module,
      ),
    };

    updateCourseCache(nextCourse);
    void updateModule
      .mutateAsync({
        moduleId,
        title,
        description: currentModule?.description,
      })
      .catch(() => {
        notify({
          title: 'No pudimos actualizar el modulo',
          description: 'La UI se actualizo localmente, pero el servidor rechazo el cambio.',
          variant: 'info',
        });
      });
  };

  const handleUpdateLessonTitle = (moduleId: string, lessonId: string, title: string) => {
    if (!courseQuery.data) {
      return;
    }

    const currentLesson = courseQuery.data.modules
      .find((module) => module.id === moduleId)
      ?.lessons.find((lesson) => lesson.id === lessonId);
    const nextCourse = {
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
    };

    updateCourseCache(nextCourse);
    void updateLesson
      .mutateAsync({
        lessonId,
        title,
        content: currentLesson?.content ?? '{"blocks":[]}',
      })
      .catch(() => {
        notify({
          title: 'Edicion pendiente de API',
          description: 'La UI se actualizo localmente, pero el endpoint de actualizacion de lecciones aun no respondio correctamente.',
          variant: 'info',
        });
      });
  };

  const handleAddModule = () => {
    if (!courseQuery.data) {
      return;
    }

    const nextCourse = {
      ...courseQuery.data,
      modules: normalizeModulesOrder([
        ...courseQuery.data.modules,
        {
          title: 'Nuevo modulo',
          description: '',
          order: courseQuery.data.modules.length + 1,
          lessons: [],
        },
      ]),
    };

    updateCourseCache(nextCourse);
    void createModule.mutateAsync({ title: 'Nuevo modulo', description: '' }).catch(() => {
      notify({
        title: 'No pudimos crear el modulo',
        description: 'La UI se actualizo localmente, pero el servidor rechazo la creacion.',
        variant: 'info',
      });
    });
  };

  const handleAddLesson = (moduleId: string) => {
    if (!courseQuery.data) {
      return;
    }

    const title = 'Nueva leccion';
    const content = '{"blocks":[]}';
    const nextCourse = {
      ...courseQuery.data,
      modules: normalizeModulesOrder(
        courseQuery.data.modules.map((module) =>
          module.id === moduleId
            ? {
                ...module,
                lessons: [
                  ...module.lessons,
                  {
                    title,
                    content,
                    order: module.lessons.length + 1,
                  },
                ],
              }
            : module,
        ),
      ),
    };

    updateCourseCache(nextCourse);
    void createLesson.mutateAsync({ moduleId, title, content }).catch(() => {
      notify({
        title: 'Creacion pendiente de API',
        description: 'La UI se actualizo localmente, pero el endpoint de creacion de lecciones aun no respondio correctamente.',
        variant: 'info',
      });
    });
  };

  const handleDeleteModule = (moduleId: string) => {
    if (!courseQuery.data) {
      return;
    }

    const nextCourse = {
      ...courseQuery.data,
      modules: normalizeModulesOrder(courseQuery.data.modules.filter((module) => module.id !== moduleId)),
    };

    updateCourseCache(nextCourse);
    void deleteModule.mutateAsync(moduleId).catch(() => {
      notify({
        title: 'No pudimos eliminar el modulo',
        description: 'La UI se actualizo localmente, pero el servidor rechazo la eliminacion.',
        variant: 'info',
      });
    });
  };

  const handleDeleteLesson = (lessonId: string) => {
    if (!courseQuery.data) {
      return;
    }

    const nextCourse = {
      ...courseQuery.data,
      modules: normalizeModulesOrder(
        courseQuery.data.modules.map((module) => ({
          ...module,
          lessons: module.lessons.filter((lesson) => lesson.id !== lessonId),
        })),
      ),
    };

    updateCourseCache(nextCourse);
    void deleteLesson.mutateAsync(lessonId).catch(() => {
      notify({
        title: 'Eliminacion pendiente de API',
        description: 'La UI se actualizo localmente, pero el endpoint de eliminacion de lecciones aun no respondio correctamente.',
        variant: 'info',
      });
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
                  isSaving={
                    updateCourse.isPending ||
                    createModule.isPending ||
                    updateModule.isPending ||
                    deleteModule.isPending ||
                    reorderModules.isPending ||
                    createLesson.isPending ||
                    updateLesson.isPending ||
                    deleteLesson.isPending ||
                    reorderLessons.isPending
                  }
                  onAddModule={handleAddModule}
                  onAddLesson={handleAddLesson}
                  onDeleteModule={handleDeleteModule}
                  onDeleteLesson={handleDeleteLesson}
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
