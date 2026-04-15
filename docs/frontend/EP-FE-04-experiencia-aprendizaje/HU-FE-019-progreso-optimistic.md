# HU-FE-019: Progreso y Optimistic Updates

## Descripción
Como usuario, quiero que mi progreso se actualice instantáneamente al completar lecciones para poder percibir una experiencia de aprendizaje fluida y sin latencia, incluso cuando la conexión sea lenta.

Esta historia de usuario implementa el sistema de progreso de LearnPath con actualizaciones optimistas (optimistic updates) que proporcionan feedback inmediato al usuario. Cuando el usuario marca una lección como completada, la UI se actualiza al instante: la barra de progreso avanza, el indicador de la lección cambia a completada y el porcentaje se recalcula, todo antes de que la respuesta del servidor llegue. Si la petición al API falla, la UI revierte automáticamente al estado anterior (rollback) y muestra una notificación de error informando al usuario. Este patrón se aplica tanto al progreso de lecciones como a la acción de inscripción en cursos, utilizando el patrón de optimistic updates de TanStack Query con los callbacks `onMutate` (aplicar cambio optimista), `onError` (rollback) y `onSettled` (re-sincronizar con servidor). Se implementan barras de progreso por módulo y una barra de progreso general del curso.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Jazir Olivera |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #10:** Optimistic Updates — Se aplica el patrón de actualizaciones optimistas de TanStack Query donde la UI refleja el cambio esperado inmediatamente en `onMutate`, guarda un snapshot para rollback en `onError` si la mutación falla, y re-sincroniza la cache con el servidor en `onSettled` para garantizar consistencia eventual.

## Criterios de Aceptación

### Funcionales
- [ ] **AC-1:** Al marcar una lección como completada, la barra de progreso del módulo y la barra de progreso general del curso se actualizan instantáneamente sin esperar la respuesta del servidor.
- [ ] **AC-2:** La barra de progreso por módulo muestra el porcentaje de lecciones completadas de ese módulo específico, y la barra de progreso general muestra el porcentaje total del curso (lecciones completadas / total de lecciones).
- [ ] **AC-3:** Si la petición de completar lección falla, la barra de progreso revierte al valor anterior con una animación suave y se muestra una notificación de error tipo toast indicando "No se pudo guardar el progreso. Intenta de nuevo".
- [ ] **AC-4:** La acción de inscripción en un curso también es optimista: al confirmar la inscripción, la UI muestra inmediatamente el curso como inscrito y redirige al learning path, sin esperar la confirmación del servidor.
- [ ] **AC-5:** El progreso se persiste y se muestra correctamente al recargar la página o al volver a la página "Mis Cursos", reflejando el estado real sincronizado con el servidor.

### Técnicos
- [ ] **AC-T1:** Las mutaciones de progreso implementan el patrón completo de optimistic updates de TanStack Query: `onMutate` cancela queries en vuelo, guarda snapshot del estado actual y aplica el cambio optimista en la cache; `onError` restaura el snapshot; `onSettled` invalida la query para re-sincronizar.
- [ ] **AC-T2:** Se implementa un custom hook `useProgressMutation(courseId)` que encapsula la lógica de la mutación optimista y expone `{ markComplete, isUpdating, progress }`.
- [ ] **AC-T3:** El cálculo del progreso se realiza en el cliente basándose en los datos de la cache de React Query: `progress = completedLessons.length / totalLessons.length * 100`, actualizando la cache directamente en `onMutate` mediante `queryClient.setQueryData`.
- [ ] **AC-T4:** La mutación de inscripción optimista sigue el mismo patrón: actualiza `['enrollments']` optimísticamente en `onMutate`, agrega el curso a la lista local de inscripciones, y revierte si falla.

### QA
- [ ] **QA-1:** Verificar que al completar una lección con conexión lenta simulada (throttle de red), la barra de progreso se actualiza inmediatamente al hacer clic y no espera la respuesta del servidor.
- [ ] **QA-2:** Comprobar que al completar una lección con el servidor apagado o devolviendo error 500, la barra de progreso revierte al valor anterior, se muestra la notificación de error, y el usuario puede reintentar la acción.
- [ ] **QA-3:** Validar que tras completar varias lecciones seguidas rápidamente (clics rápidos), el progreso final reflejado es consistente tanto en la UI como en el servidor, sin condiciones de carrera.

## Tareas

| ID | Tarea | Estimación | Prioridad |
|----|-------|-----------|-----------|
| T-FE-089 | Implementar custom hook `useProgressMutation(courseId)` con patrón completo de optimistic update (onMutate, onError, onSettled) | 1.5h | Alta |
| T-FE-090 | Crear componente `ProgressBar` reutilizable que reciba porcentaje y se anime suavemente entre valores | 0.5h | Alta |
| T-FE-091 | Integrar barras de progreso por módulo en el sidebar de lecciones y barra general en el header del curso | 0.5h | Alta |
| T-FE-092 | Implementar lógica de rollback con restauración de snapshot y notificación de error al usuario | 0.5h | Alta |
| T-FE-093 | Adaptar la mutación de inscripción en `useEnrollment` para utilizar el patrón de optimistic update | 1h | Media |
| T-FE-094 | Testing manual de escenarios de red lenta, error de servidor y clics rápidos para validar consistencia | 1h | Media |

## Notas Técnicas
- Estructura del optimistic update en `onMutate`:
  ```typescript
  onMutate: async (lessonId) => {
    await queryClient.cancelQueries({ queryKey: ['progress', courseId] });
    const previousProgress = queryClient.getQueryData(['progress', courseId]);
    queryClient.setQueryData(['progress', courseId], (old) => ({
      ...old,
      completedLessons: [...old.completedLessons, lessonId]
    }));
    return { previousProgress }; // snapshot para rollback
  },
  onError: (err, lessonId, context) => {
    queryClient.setQueryData(['progress', courseId], context.previousProgress);
    toast.error('No se pudo guardar el progreso');
  },
  onSettled: () => {
    queryClient.invalidateQueries({ queryKey: ['progress', courseId] });
  }
  ```
- La barra de progreso debe usar `transition: width 300ms ease` en CSS para animaciones suaves entre valores, tanto para avance como para rollback.
- Para evitar condiciones de carrera con clics rápidos, cada mutación en vuelo debe manejar su propio snapshot. TanStack Query maneja esto internamente cuando se usa `onMutate` correctamente.
- Considerar un indicador visual sutil (pulsación o brillo) en la barra de progreso mientras la mutación está en vuelo, para indicar que el cambio aún no está confirmado por el servidor.
- El componente `Progress` de shadcn/ui puede usarse como base y extenderse con la animación y el indicador de sincronización.

## Dependencias
- **Depende de:** HU-FE-018 (learning paths con reducer que gestiona COMPLETE_LESSON), HU-BE-015 (API de progreso: marcar lección completada, obtener progreso del usuario)
- **Bloquea a:** Ninguna historia directamente, pero es un componente transversal usado por HU-FE-017 (vista de lección) y HU-FE-016 (inscripción)
