import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { CourseDetail } from '../types/course.types';
import { InlineEdit } from './InlineEdit';

type PendingDelete =
  | {
      type: 'module';
      moduleId: string;
      title: string;
      lessonCount: number;
    }
  | {
      type: 'lesson';
      moduleId: string;
      lessonId: string;
      title: string;
    };

type ModuleAccordionProps = {
  modules: CourseDetail['modules'];
  isSaving?: boolean;
  onAddModule?: () => void;
  onAddLesson?: (moduleId: string) => void;
  onEditModule?: (moduleId: string) => void;
  onDeleteModule?: (moduleId: string) => void;
  onMoveModule?: (moduleId: string, direction: 'up' | 'down') => void;
  onReorderModules?: (sourceModuleId: string, targetModuleId: string) => void;
  onUpdateModuleTitle?: (moduleId: string, title: string) => void | Promise<void>;
  onEditLesson?: (lessonId: string) => void;
  onDeleteLesson?: (lessonId: string) => void;
  onMoveLesson?: (moduleId: string, lessonId: string, direction: 'up' | 'down') => void;
  onReorderLessons?: (moduleId: string, sourceLessonId: string, targetLessonId: string) => void;
  onUpdateLessonTitle?: (moduleId: string, lessonId: string, title: string) => void | Promise<void>;
};

export function ModuleAccordion({
  modules,
  isSaving = false,
  onAddModule,
  onAddLesson,
  onEditModule,
  onDeleteModule,
  onMoveModule,
  onReorderModules,
  onUpdateModuleTitle,
  onEditLesson,
  onDeleteLesson,
  onMoveLesson,
  onReorderLessons,
  onUpdateLessonTitle,
}: ModuleAccordionProps) {
  const [activeEditKey, setActiveEditKey] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);

  if (modules.length === 0) {
    return (
      <div className="grid gap-3 rounded-lg border border-dashed border-border p-4">
        <p className="text-sm text-muted-foreground">Este curso todavia no tiene modulos.</p>
        {onAddModule ? (
          <Button className="w-fit" type="button" variant="outline" onClick={onAddModule} disabled={isSaving}>
            Agregar modulo
          </Button>
        ) : null}
      </div>
    );
  }

  const firstModuleValue = modules[0]?.id ?? String(modules[0]?.order);
  const deleteDescription =
    pendingDelete?.type === 'module'
      ? pendingDelete.lessonCount === 1
        ? 'Este modulo contiene 1 leccion que tambien se eliminara.'
        : `Este modulo contiene ${pendingDelete?.lessonCount ?? 0} lecciones que tambien se eliminaran.`
      : 'Esta leccion se eliminara del modulo y ya no aparecera en la estructura del curso.';

  const confirmDelete = () => {
    if (!pendingDelete) {
      return;
    }

    if (pendingDelete.type === 'module') {
      onDeleteModule?.(pendingDelete.moduleId);
    } else {
      onDeleteLesson?.(pendingDelete.lessonId);
    }

    setPendingDelete(null);
  };

  return (
    <>
      <div className="mb-4 flex justify-end">
        {onAddModule ? (
          <Button type="button" variant="outline" onClick={onAddModule} disabled={isSaving}>
            Agregar modulo
          </Button>
        ) : null}
      </div>

      <Accordion type="multiple" defaultValue={firstModuleValue ? [firstModuleValue] : []}>
        {modules.map((module, index) => (
          <AccordionItem
            key={module.id ?? module.order}
            value={module.id ?? String(module.order)}
            draggable={Boolean(module.id && onReorderModules)}
            onDragStart={(event) => {
              if (!module.id) {
                return;
              }

              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('application/learnpath-module-id', module.id);
            }}
            onDragOver={(event) => {
              if (onReorderModules) {
                event.preventDefault();
              }
            }}
            onDrop={(event) => {
              const sourceModuleId = event.dataTransfer.getData('application/learnpath-module-id');

              if (module.id && sourceModuleId && sourceModuleId !== module.id) {
                event.preventDefault();
                onReorderModules?.(sourceModuleId, module.id);
              }
            }}
            className="transition-shadow data-[drag-over=true]:shadow-lg"
          >
          <AccordionTrigger>
            <span className="grid gap-1">
              <span className="font-semibold" onDoubleClick={(event) => event.stopPropagation()}>
                {module.id && onUpdateModuleTitle ? (
                  <InlineEdit
                    value={module.title}
                    ariaLabel={`Editar titulo del modulo ${module.title}`}
                    isEditing={activeEditKey === `module:${module.id}`}
                    onEditingChange={(isEditing) => {
                      if (!isEditing && activeEditKey === `module:${module.id}`) {
                        setActiveEditKey(null);
                      }
                    }}
                    maxLength={80}
                    onSave={(title) => {
                      if (module.id) {
                        return onUpdateModuleTitle(module.id, title);
                      }
                    }}
                  />
                ) : (
                  module.title
                )}
              </span>
              <span className="text-sm text-muted-foreground">
                {module.lessons.length} {module.lessons.length === 1 ? 'leccion' : 'lecciones'}
              </span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <div className="grid gap-4">
              {module.description ? <p className="text-sm text-muted-foreground">{module.description}</p> : null}

              <div className="flex flex-wrap gap-2" aria-label={`Acciones para ${module.title}`}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (module.id && onUpdateModuleTitle) {
                      setActiveEditKey(`module:${module.id}`);
                      return;
                    }

                    if (module.id) {
                      onEditModule?.(module.id);
                    }
                  }}
                  disabled={!module.id}
                >
                  Editar
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() =>
                    module.id &&
                    setPendingDelete({
                      type: 'module',
                      moduleId: module.id,
                      title: module.title,
                      lessonCount: module.lessons.length,
                    })
                  }
                  disabled={!module.id || isSaving}
                >
                  Eliminar
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => module.id && onMoveModule?.(module.id, 'up')}
                  disabled={!module.id || index === 0}
                >
                  Subir
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => module.id && onMoveModule?.(module.id, 'down')}
                  disabled={!module.id || index === modules.length - 1}
                >
                  Bajar
                </Button>
              </div>

              <div className="grid gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">Lecciones</p>
                  {module.id && onAddLesson ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (module.id) {
                          onAddLesson(module.id);
                        }
                      }}
                      disabled={isSaving}
                    >
                      Agregar leccion
                    </Button>
                  ) : null}
                </div>
                {module.lessons.length > 0 ? (
                  <ol className="grid gap-2">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <li
                        key={lesson.id ?? lesson.order}
                        className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[auto_1fr_auto] md:items-center"
                        draggable={Boolean(module.id && lesson.id && onReorderLessons)}
                        onDragStart={(event) => {
                          if (!lesson.id) {
                            return;
                          }

                          event.stopPropagation();
                          event.dataTransfer.effectAllowed = 'move';
                          event.dataTransfer.setData('application/learnpath-lesson-id', lesson.id);
                        }}
                        onDragOver={(event) => {
                          if (onReorderLessons) {
                            event.preventDefault();
                          }
                        }}
                        onDrop={(event) => {
                          const sourceLessonId = event.dataTransfer.getData('application/learnpath-lesson-id');

                          if (module.id && lesson.id && sourceLessonId && sourceLessonId !== lesson.id) {
                            event.preventDefault();
                            event.stopPropagation();
                            onReorderLessons?.(module.id, sourceLessonId, lesson.id);
                          }
                        }}
                      >
                        <span className="grid size-8 place-items-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                          {lesson.order}
                        </span>
                        <div>
                          <p className="font-semibold text-foreground">
                            {module.id && lesson.id && onUpdateLessonTitle ? (
                              <InlineEdit
                                value={lesson.title}
                                ariaLabel={`Editar titulo de la leccion ${lesson.title}`}
                                isEditing={activeEditKey === `lesson:${lesson.id}`}
                                onEditingChange={(isEditing) => {
                                  if (!isEditing && activeEditKey === `lesson:${lesson.id}`) {
                                    setActiveEditKey(null);
                                  }
                                }}
                                maxLength={100}
                                onSave={(title) => {
                                  if (module.id && lesson.id) {
                                    return onUpdateLessonTitle(module.id, lesson.id, title);
                                  }
                                }}
                              />
                            ) : (
                              lesson.title
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">Orden {lesson.order}</p>
                        </div>
                        <div className="flex flex-wrap gap-2" aria-label={`Acciones para ${lesson.title}`}>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (lesson.id && onUpdateLessonTitle) {
                                setActiveEditKey(`lesson:${lesson.id}`);
                                return;
                              }

                              if (lesson.id) {
                                onEditLesson?.(lesson.id);
                              }
                            }}
                            disabled={!lesson.id}
                          >
                            Editar
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() =>
                              module.id &&
                              lesson.id &&
                              setPendingDelete({
                                type: 'lesson',
                                moduleId: module.id,
                                lessonId: lesson.id,
                                title: lesson.title,
                              })
                            }
                            disabled={!lesson.id || isSaving}
                          >
                            Eliminar
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => module.id && lesson.id && onMoveLesson?.(module.id, lesson.id, 'up')}
                            disabled={!module.id || !lesson.id || lessonIndex === 0}
                          >
                            Subir
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => module.id && lesson.id && onMoveLesson?.(module.id, lesson.id, 'down')}
                            disabled={!module.id || !lesson.id || lessonIndex === module.lessons.length - 1}
                          >
                            Bajar
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ol>
                ) : (
                  <p className="rounded-lg border border-dashed border-border p-3 text-sm text-muted-foreground">
                    Este modulo todavia no tiene lecciones.
                  </p>
                )}
              </div>
            </div>
          </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <Dialog open={Boolean(pendingDelete)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Eliminar {pendingDelete?.type === 'module' ? 'modulo' : 'leccion'}
            </DialogTitle>
            <DialogDescription>
              {pendingDelete ? `Vas a eliminar "${pendingDelete.title}". ${deleteDescription}` : null}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPendingDelete(null)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button type="button" variant="destructive" onClick={confirmDelete} disabled={isSaving}>
              Confirmar eliminacion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
