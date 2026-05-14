import { useState } from 'react';
import { useFieldArray, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CourseFormData } from '../schemas/course.schema';
import { LessonForm } from './LessonForm';

type ModuleFormProps = {
  moduleIndex: number;
  control: Control<CourseFormData>;
  errors: FieldErrors<CourseFormData>;
  register: UseFormRegister<CourseFormData>;
  onRemove: () => void;
  onDragStart: () => void;
  onDrop: () => void;
};

const createEmptyLesson = (order: number) => ({
  title: '',
  content: '',
  order,
});

export function ModuleForm({
  moduleIndex,
  control,
  errors,
  register,
  onRemove,
  onDragStart,
  onDrop,
}: ModuleFormProps) {
  const lessonsArray = useFieldArray({
    control,
    name: `modules.${moduleIndex}.lessons`,
  });
  const moduleErrors = errors.modules?.[moduleIndex];
  const [draggedLessonIndex, setDraggedLessonIndex] = useState<number | null>(null);

  const moveLesson = (targetIndex: number) => {
    if (draggedLessonIndex === null || draggedLessonIndex === targetIndex) {
      return;
    }

    lessonsArray.move(draggedLessonIndex, targetIndex);
    setDraggedLessonIndex(null);
  };

  return (
    <section
      className="grid gap-4 rounded-lg border border-border bg-[var(--bg)] p-4"
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
      aria-labelledby={`module-${moduleIndex}-title`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 id={`module-${moduleIndex}-title`} className="text-lg font-semibold">
          Modulo {moduleIndex + 1}
        </h3>
        <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
          Eliminar modulo
        </Button>
      </div>

      <input type="hidden" {...register(`modules.${moduleIndex}.order`, { valueAsNumber: true })} />

      <label className="grid gap-2">
        <span className="font-semibold text-foreground">Titulo del modulo</span>
        <Input {...register(`modules.${moduleIndex}.title`)} aria-invalid={Boolean(moduleErrors?.title)} />
        {moduleErrors?.title ? <span className="text-sm text-destructive">{moduleErrors.title.message}</span> : null}
      </label>

      <label className="grid gap-2">
        <span className="font-semibold text-foreground">Descripcion del modulo</span>
        <textarea
          className="min-h-24 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          {...register(`modules.${moduleIndex}.description`)}
          aria-invalid={Boolean(moduleErrors?.description)}
        />
        {moduleErrors?.description ? (
          <span className="text-sm text-destructive">{moduleErrors.description.message}</span>
        ) : null}
      </label>

      <div className="grid gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-semibold text-foreground">Lecciones</p>
          <Button
            type="button"
            variant="outline"
            onClick={() => lessonsArray.append(createEmptyLesson(lessonsArray.fields.length + 1))}
          >
            Agregar leccion
          </Button>
        </div>

        {lessonsArray.fields.length > 0 ? (
          lessonsArray.fields.map((lesson, lessonIndex) => (
            <LessonForm
              key={lesson.id}
              moduleIndex={moduleIndex}
              lessonIndex={lessonIndex}
              control={control}
              errors={errors.modules}
              register={register}
              onRemove={() => lessonsArray.remove(lessonIndex)}
              onDragStart={() => setDraggedLessonIndex(lessonIndex)}
              onDrop={() => moveLesson(lessonIndex)}
            />
          ))
        ) : (
          <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            Este modulo todavia no tiene lecciones.
          </p>
        )}
      </div>
    </section>
  );
}
