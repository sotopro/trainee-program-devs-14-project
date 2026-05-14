import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { courseSchema, type CourseFormData } from '../schemas/course.schema';
import { ModuleForm } from './ModuleForm';

type CourseFormProps = {
  initialValues?: CourseFormData;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (values: CourseFormData) => void;
  formError?: string | null;
};

const emptyCourse: CourseFormData = {
  title: '',
  description: '',
  thumbnail: '',
  isPublic: false,
  modules: [],
};

const createEmptyModule = (order: number) => ({
  title: '',
  description: '',
  order,
  lessons: [],
});

const normalizeOrder = (values: CourseFormData): CourseFormData => ({
  ...values,
  modules: values.modules.map((module, moduleIndex) => ({
    ...module,
    order: moduleIndex + 1,
    lessons: module.lessons.map((lesson, lessonIndex) => ({
      ...lesson,
      order: lessonIndex + 1,
    })),
  })),
});

export function CourseForm({ initialValues, isSubmitting, submitLabel, onSubmit, formError }: CourseFormProps) {
  const [draggedModuleIndex, setDraggedModuleIndex] = useState<number | null>(null);
  const {
    control,
    formState: { errors, isValid },
    handleSubmit,
    register,
    reset,
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: initialValues ?? emptyCourse,
    mode: 'onChange',
  });

  const modulesArray = useFieldArray({
    control,
    name: 'modules',
  });

  useEffect(() => {
    reset(initialValues ?? emptyCourse);
  }, [initialValues, reset]);

  const moveModule = (targetIndex: number) => {
    if (draggedModuleIndex === null || draggedModuleIndex === targetIndex) {
      return;
    }

    modulesArray.move(draggedModuleIndex, targetIndex);
    setDraggedModuleIndex(null);
  };

  return (
    <form className="grid gap-5" onSubmit={handleSubmit((values) => onSubmit(normalizeOrder(values)))} noValidate>
      {formError ? (
        <div className="rounded-lg border border-destructive bg-[var(--danger-bg)] p-4 text-destructive" role="alert">
          {formError}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Informacion del curso</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <label className="grid gap-2">
            <span className="font-semibold text-foreground">Titulo</span>
            <Input {...register('title')} aria-invalid={Boolean(errors.title)} />
            {errors.title ? <span className="text-sm text-destructive">{errors.title.message}</span> : null}
          </label>

          <label className="grid gap-2">
            <span className="font-semibold text-foreground">Descripcion</span>
            <textarea
              className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              {...register('description')}
              aria-invalid={Boolean(errors.description)}
            />
            {errors.description ? <span className="text-sm text-destructive">{errors.description.message}</span> : null}
          </label>

          <label className="grid gap-2">
            <span className="font-semibold text-foreground">Thumbnail URL</span>
            <Input type="url" {...register('thumbnail')} aria-invalid={Boolean(errors.thumbnail)} />
            {errors.thumbnail ? <span className="text-sm text-destructive">{errors.thumbnail.message}</span> : null}
          </label>

          <label className="flex items-center gap-3 rounded-lg border border-border p-3">
            <input className="size-5 accent-[var(--accent)]" type="checkbox" {...register('isPublic')} />
            <span className="font-semibold text-foreground">Publicar</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div>
            <CardTitle>Modulos y lecciones</CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">Arrastra modulos o lecciones para reordenarlos.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => modulesArray.append(createEmptyModule(modulesArray.fields.length + 1))}
          >
            Agregar modulo
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4">
          {modulesArray.fields.length > 0 ? (
            modulesArray.fields.map((module, moduleIndex) => (
              <ModuleForm
                key={module.id}
                moduleIndex={moduleIndex}
                control={control}
                errors={errors}
                register={register}
                onRemove={() => modulesArray.remove(moduleIndex)}
                onDragStart={() => setDraggedModuleIndex(moduleIndex)}
                onDrop={() => moveModule(moduleIndex)}
              />
            ))
          ) : (
            <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
              Agrega el primer modulo para estructurar el curso.
            </p>
          )}
        </CardContent>
      </Card>

      <Button type="submit" disabled={!isValid || isSubmitting} aria-busy={isSubmitting} className="w-fit min-w-44">
        {isSubmitting ? 'Guardando...' : submitLabel}
      </Button>
    </form>
  );
}
