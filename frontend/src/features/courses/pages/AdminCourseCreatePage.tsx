import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CourseForm } from '../components/CourseForm';
import { useCreateCourse } from '../hooks/useCourses';
import type { CourseFormData } from '../schemas/course.schema';

export function AdminCourseCreatePage() {
  const navigate = useNavigate();
  const createCourse = useCreateCourse();
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (values: CourseFormData) => {
    setFormError(null);

    try {
      const course = await createCourse.mutateAsync(values);
      navigate(`/admin/courses/${course.id}/edit`, { replace: true });
    } catch {
      setFormError('No pudimos crear el curso. Revisa los datos e intenta nuevamente.');
    }
  };

  return (
    <main className="min-h-svh bg-[var(--bg)] px-4 py-6 md:px-6">
      <section className="mx-auto grid max-w-5xl gap-6" aria-labelledby="course-create-title">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase text-primary">Panel de administracion</p>
            <h1 id="course-create-title" className="text-3xl font-bold">
              Crear curso
            </h1>
          </div>
          <Button asChild variant="outline">
            <Link to="/admin/courses">Volver al listado</Link>
          </Button>
        </div>

        <CourseForm
          submitLabel="Crear curso"
          isSubmitting={createCourse.isPending}
          onSubmit={(values) => void handleSubmit(values)}
          formError={formError}
        />
      </section>
    </main>
  );
}
