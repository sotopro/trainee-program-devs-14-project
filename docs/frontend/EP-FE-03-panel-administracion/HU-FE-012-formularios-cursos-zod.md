# HU-FE-012: Formularios de Cursos con Zod + React Hook Form

## Descripción
Como administrador, quiero crear y editar cursos con formularios validados y estructurados para poder definir la información de cada curso, sus módulos y lecciones de manera confiable y sin errores.

Este historia de usuario abarca la implementación de los formularios principales del panel de administración para la gestión de cursos en LearnPath. Se crean tres formularios interrelacionados: **CourseForm** (título, descripción, thumbnail, toggle de visibilidad pública), **ModuleForm** (título, descripción, orden con reordenamiento por drag) y **LessonForm** (título, contenido con Editor.js, orden). Todos los formularios utilizan esquemas de Zod para la validación de datos y React Hook Form para la gestión del estado del formulario. Se implementa un patrón de formularios anidados donde desde el formulario de curso se pueden agregar módulos, y desde cada módulo se pueden agregar lecciones, utilizando `useFieldArray` de RHF para manejar las colecciones dinámicas. Este enfoque garantiza validación en tiempo real, mensajes de error claros y una experiencia de edición fluida.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Edgar Chacon |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #13:** Patrones de Form (Pro) — Se aplican patrones avanzados de formularios con React Hook Form y Zod, incluyendo validación con esquemas tipados, formularios anidados con `useFieldArray`, y gestión eficiente del estado del formulario minimizando re-renders innecesarios mediante el registro controlado de campos.

## Criterios de Aceptación

### Funcionales
- [ ] **AC-1:** El formulario de curso (`CourseForm`) permite ingresar título (obligatorio, 3-100 caracteres), descripción (obligatorio, 10-500 caracteres), subir/seleccionar thumbnail (URL válida) y alternar la visibilidad pública del curso mediante un toggle.
- [ ] **AC-2:** El formulario de módulo (`ModuleForm`) permite ingresar título (obligatorio, 3-80 caracteres) y descripción (opcional, máx. 300 caracteres), y los módulos pueden reordenarse arrastrándolos dentro de la lista.
- [ ] **AC-3:** El formulario de lección (`LessonForm`) permite ingresar título (obligatorio, 3-100 caracteres) y contenido mediante el editor Editor.js, con reordenamiento por drag dentro del módulo correspondiente.
- [ ] **AC-4:** Se muestran mensajes de validación en español debajo de cada campo cuando la validación falla, indicando claramente el error (ej. "El título debe tener al menos 3 caracteres").
- [ ] **AC-5:** Desde el formulario de curso se pueden agregar múltiples módulos dinámicamente, y desde cada módulo se pueden agregar múltiples lecciones, todo sin perder el estado del formulario padre.
- [ ] **AC-6:** El botón de envío se deshabilita mientras el formulario es inválido o mientras se procesa la petición, mostrando un indicador de carga durante el envío.

### Técnicos
- [ ] **AC-T1:** Cada formulario utiliza un esquema Zod tipado (`courseSchema`, `moduleSchema`, `lessonSchema`) que define las reglas de validación y se integra con React Hook Form mediante `zodResolver`.
- [ ] **AC-T2:** Los formularios anidados utilizan `useFieldArray` de React Hook Form para gestionar las colecciones de módulos y lecciones, permitiendo operaciones de append, remove, swap y move.
- [ ] **AC-T3:** Los esquemas Zod exportan los tipos TypeScript inferidos (`CourseFormData`, `ModuleFormData`, `LessonFormData`) mediante `z.infer<typeof schema>` para garantizar type-safety end-to-end.
- [ ] **AC-T4:** Las mutaciones de creación/edición utilizan `useMutation` de TanStack Query con invalidación de cache adecuada tras operaciones exitosas (`queryClient.invalidateQueries(['courses'])`).

### QA
- [ ] **QA-1:** Verificar que al enviar el formulario de curso con campos vacíos o inválidos, se muestran todos los mensajes de validación correspondientes sin realizar la petición al API.
- [ ] **QA-2:** Comprobar que se pueden agregar 3+ módulos a un curso y 3+ lecciones a un módulo, reordenarlos mediante drag & drop, y que el orden se persiste correctamente al guardar.
- [ ] **QA-3:** Validar que al editar un curso existente, los formularios se pre-cargan con los datos actuales y las modificaciones se guardan correctamente sin perder la estructura anidada.

## Tareas

| ID | Tarea | Estimación | Prioridad |
|----|-------|-----------|-----------|
| T-FE-047 | Definir esquemas Zod para `courseSchema`, `moduleSchema` y `lessonSchema` con validaciones y mensajes en español | 0.5h | Alta |
| T-FE-048 | Implementar componente `CourseForm` con React Hook Form, zodResolver y campos de título, descripción, thumbnail y toggle público | 1h | Alta |
| T-FE-049 | Implementar `ModuleForm` con `useFieldArray` para agregar/eliminar/reordenar módulos dentro del curso | 1h | Alta |
| T-FE-050 | Implementar `LessonForm` con `useFieldArray` anidado e integración del campo de contenido con Editor.js | 1.5h | Alta |
| T-FE-051 | Integrar drag & drop para reordenamiento de módulos y lecciones dentro de los formularios | 1h | Media |
| T-FE-052 | Crear mutaciones con `useMutation` para crear/editar curso con invalidación de cache y manejo de errores | 1h | Alta |

## Notas Técnicas
- Los esquemas Zod deben definirse en un archivo separado `src/schemas/course.schema.ts` para facilitar reutilización y testing.
- Para el drag & drop, considerar `@dnd-kit/core` y `@dnd-kit/sortable` que se integran bien con React Hook Form.
- El campo de contenido de Editor.js en el `LessonForm` debe registrarse como un campo controlado usando `Controller` de RHF, ya que Editor.js maneja su propio estado interno.
- Para los mensajes de validación en español, definir mensajes personalizados directamente en el esquema Zod: `z.string().min(3, { message: "El título debe tener al menos 3 caracteres" })`.
- Considerar usar `formState.dirtyFields` para enviar solo los campos modificados en modo edición, reduciendo la carga del payload.
- La estructura de datos al enviar debe reflejar la jerarquía: `{ title, description, thumbnail, isPublic, modules: [{ title, description, order, lessons: [...] }] }`.

## Dependencias
- **Depende de:** HU-FE-001 (setup del proyecto con React Hook Form y Zod instalados), HU-BE-008 (API CRUD de cursos), HU-BE-009 (API CRUD de módulos), HU-BE-010 (API CRUD de lecciones)
- **Bloquea a:** HU-FE-013 (gestión de módulos y lecciones reutiliza estos formularios)
