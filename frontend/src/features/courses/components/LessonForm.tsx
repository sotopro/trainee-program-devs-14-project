import { Controller, type Control, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CourseFormData } from '../schemas/course.schema';

type LessonFormProps = {
  moduleIndex: number;
  lessonIndex: number;
  control: Control<CourseFormData>;
  errors?: FieldErrors<CourseFormData>['modules'];
  register: UseFormRegister<CourseFormData>;
  onRemove: () => void;
  onDragStart: () => void;
  onDrop: () => void;
};

export function LessonForm({
  moduleIndex,
  lessonIndex,
  control,
  errors,
  register,
  onRemove,
  onDragStart,
  onDrop,
}: LessonFormProps) {
  const lessonErrors = errors?.[moduleIndex]?.lessons?.[lessonIndex];
  const fieldPrefix = `modules.${moduleIndex}.lessons.${lessonIndex}` as const;

  return (
    <div
      className="grid gap-3 rounded-lg border border-border bg-background p-4"
      draggable
      onDragStart={onDragStart}
      onDragOver={(event) => event.preventDefault()}
      onDrop={onDrop}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-foreground">Leccion {lessonIndex + 1}</p>
        <Button type="button" variant="destructive" size="sm" onClick={onRemove}>
          Eliminar leccion
        </Button>
      </div>

      <input type="hidden" {...register(`${fieldPrefix}.order`, { valueAsNumber: true })} />

      <label className="grid gap-2">
        <span className="font-semibold text-foreground">Titulo de la leccion</span>
        <Input {...register(`${fieldPrefix}.title`)} aria-invalid={Boolean(lessonErrors?.title)} />
        {lessonErrors?.title ? <span className="text-sm text-destructive">{lessonErrors.title.message}</span> : null}
      </label>

      <label className="grid gap-2">
        <span className="font-semibold text-foreground">Contenido</span>
        <Controller
          control={control}
          name={`${fieldPrefix}.content`}
          render={({ field }) => (
            <textarea
              className="min-h-32 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-base text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              placeholder="Escribe el contenido de la leccion"
              aria-invalid={Boolean(lessonErrors?.content)}
              {...field}
            />
          )}
        />
        {lessonErrors?.content ? <span className="text-sm text-destructive">{lessonErrors.content.message}</span> : null}
      </label>
    </div>
  );
}
