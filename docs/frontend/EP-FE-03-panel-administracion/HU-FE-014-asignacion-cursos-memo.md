# HU-FE-014: Asignación de Cursos y Optimización con Memoización

## Descripción
Como administrador, quiero asignar cursos a usuarios específicos desde un panel optimizado para poder gestionar las inscripciones de forma eficiente incluso con listas grandes de usuarios.

Esta historia de usuario implementa el panel de asignación de cursos en LearnPath, donde el administrador puede buscar usuarios, filtrarlos y asignarles cursos de forma individual o masiva. La interfaz incluye un campo de búsqueda con debounce para filtrar la lista de usuarios, una tabla paginada que muestra los usuarios con su estado de asignación, y acciones en lote para asignar/desasignar cursos a múltiples usuarios simultáneamente. Dado que las listas de usuarios pueden ser extensas, se aplican técnicas de memoización con `useMemo` para la lista filtrada de usuarios (evitando recalcular el filtrado en cada render) y `useCallback` para los handlers de asignación (garantizando referencias estables que no provoquen re-renders innecesarios en los componentes hijos de la tabla).

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Edgar Chacon |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #3:** useMemo & useCallback — Se aplica `useMemo` para memoizar la lista filtrada de usuarios evitando recalcular el filtro en cada render, y `useCallback` para estabilizar los handlers de asignación/desasignación que se pasan como props a cada fila de la tabla, previniendo re-renders en cascada de componentes hijos.

## Criterios de Aceptación

### Funcionales
- [ ] **AC-1:** El panel muestra un selector de curso en la parte superior que permite elegir el curso a asignar, y debajo una tabla con la lista de usuarios disponibles para la asignación.
- [ ] **AC-2:** El campo de búsqueda filtra usuarios por nombre o email con un debounce de 300ms, actualizando la lista visible sin realizar nuevas peticiones al API cuando los datos ya están en cache.
- [ ] **AC-3:** La tabla de usuarios muestra: checkbox de selección, nombre, email, estado de asignación (asignado/no asignado) y fecha de asignación si aplica, con paginación de 10 usuarios por página.
- [ ] **AC-4:** Se pueden seleccionar múltiples usuarios mediante checkboxes y ejecutar acciones en lote: "Asignar seleccionados" y "Desasignar seleccionados" mediante botones en la barra de acciones superior.
- [ ] **AC-5:** Tras cada asignación exitosa, se muestra una notificación de éxito y el estado del usuario en la tabla se actualiza inmediatamente sin necesidad de recargar.

### Técnicos
- [ ] **AC-T1:** La lista filtrada de usuarios se calcula con `useMemo` que depende de `[users, searchTerm, currentPage]`, evitando recalcular el filtrado cuando otros estados del componente cambian.
- [ ] **AC-T2:** Los handlers `handleAssign`, `handleUnassign` y `handleBulkAssign` se envuelven en `useCallback` con las dependencias correctas para mantener referencias estables y evitar re-renders innecesarios de los componentes `UserRow`.
- [ ] **AC-T3:** El debounce del campo de búsqueda se implementa con un custom hook `useDebounce(value, delay)` que retorna el valor debounced.
- [ ] **AC-T4:** La tabla utiliza componentes de shadcn/ui (`Table`, `TableHeader`, `TableRow`, `TableCell`) y la paginación se maneja con estado local sincronizado con los parámetros de la query.

### QA
- [ ] **QA-1:** Verificar que al buscar un usuario por nombre parcial, la lista se filtra correctamente tras el debounce de 300ms y que al limpiar el campo de búsqueda se restaura la lista completa.
- [ ] **QA-2:** Comprobar que la asignación en lote de 5+ usuarios funciona correctamente: todos los usuarios seleccionados quedan asignados, se muestra notificación de éxito, y los checkboxes se limpian tras la acción.
- [ ] **QA-3:** Validar que al navegar entre páginas de la tabla y volver, el estado de selección y el término de búsqueda se mantienen correctamente.

## Tareas

| ID | Tarea | Estimación | Prioridad |
|----|-------|-----------|-----------|
| T-FE-059 | Crear custom hook `useDebounce(value, delay)` y hook compuesto `useUserSearch()` con lógica de filtrado memoizada | 0.5h | Alta |
| T-FE-060 | Implementar componente `CourseAssignmentPanel` con selector de curso y tabla de usuarios con shadcn/ui | 1.5h | Alta |
| T-FE-061 | Desarrollar componente `UserRow` con checkbox, datos del usuario y estado de asignación, optimizado con `React.memo` | 0.5h | Alta |
| T-FE-062 | Implementar lógica de selección múltiple y acciones en lote (asignar/desasignar) con `useCallback` para handlers estables | 1h | Alta |
| T-FE-063 | Integrar mutaciones de asignación/desasignación con React Query incluyendo invalidación de cache y notificaciones | 1h | Alta |
| T-FE-064 | Implementar paginación de la tabla de usuarios con navegación y estado sincronizado | 0.5h | Media |

## Notas Técnicas
- El custom hook `useDebounce` debe implementarse con `useEffect` y `setTimeout`/`clearTimeout`, retornando el valor después del delay especificado.
- Para la lista filtrada memoizada: `const filteredUsers = useMemo(() => users.filter(u => u.name.toLowerCase().includes(debouncedSearch) || u.email.toLowerCase().includes(debouncedSearch)), [users, debouncedSearch])`.
- Los handlers con `useCallback` deben tener las dependencias mínimas necesarias. Por ejemplo, `handleAssign` solo necesita `[courseId, queryClient]` como dependencias.
- Considerar envolver `UserRow` con `React.memo` para evitar re-renders cuando solo cambia la selección de otras filas. Esto complementa el `useCallback` de los handlers.
- Para la asignación en lote, usar `Promise.all` con las mutaciones individuales o un endpoint dedicado de asignación masiva si el backend lo soporta.
- La paginación puede ser client-side (filtrar datos ya cargados) o server-side (pasar `page` y `limit` al API) dependiendo del volumen esperado de usuarios.

## Dependencias
- **Depende de:** HU-FE-011 (dashboard de admin desde donde se navega a este panel), HU-BE-011 (API de asignación de cursos a usuarios)
- **Bloquea a:** Ninguna historia directamente, pero complementa el flujo de inscripción del lado del usuario (HU-FE-016)
