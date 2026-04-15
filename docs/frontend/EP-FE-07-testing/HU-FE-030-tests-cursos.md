# HU-FE-030: Tests de Gestion de Cursos

## Descripcion
Como equipo de desarrollo, quiero contar con una suite completa de tests unitarios e integracion para el modulo de gestion de cursos, para asegurar que los formularios de creacion y edicion, la validacion de datos y las interacciones de UI funcionan correctamente.

La suite de tests del modulo de cursos abarca tests unitarios para las piezas de logica aislada: validacion del schema `courseSchema` con Zod (campos requeridos, longitudes, formatos), y el hook `useCourseFilters` que maneja el estado de filtrado y busqueda de cursos. Los tests de integracion cubren flujos completos de usuario: el componente `CourseForm` con escenarios de errores de validacion y envio exitoso; el componente `ModuleAccordion` con interacciones de expandir y colapsar modulos; y la funcionalidad de reordenamiento por drag-and-drop de modulos y lecciones. Se incluyen tests especificos para las mutaciones de React Query, verificando que la cache se invalida correctamente despues de operaciones de creacion, actualizacion y eliminacion de cursos. Todos los tests siguen las mejores practicas de RTL y Vitest.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Edgar Chacon |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #15:** Testing (Vitest/RTL) — Esta historia aplica testing avanzado con React Query, verificando la invalidacion de cache y las actualizaciones optimistas en el contexto de gestion de cursos.

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** Existen tests unitarios para `courseSchema` que verifican: campos requeridos (titulo, descripcion), longitud minima y maxima del titulo, y formato de datos valido para todos los campos.
- [ ] **AC-2:** Existen tests unitarios para el hook `useCourseFilters` que verifican el cambio de filtros (categoria, nivel, estado), la busqueda por texto y el reseteo de filtros.
- [ ] **AC-3:** Existe un test de integracion para `CourseForm` que verifica la visualizacion de errores de validacion al enviar campos vacios o invalidos.
- [ ] **AC-4:** Existe un test de integracion para `CourseForm` que verifica el envio exitoso del formulario y la llamada correcta a la mutacion de creacion/actualizacion.
- [ ] **AC-5:** Existe un test de integracion para `ModuleAccordion` que verifica la expansion y contraccion de modulos al hacer clic en el encabezado.
- [ ] **AC-6:** Existen tests que verifican la invalidacion de cache de React Query: al crear un curso, la query `['courses']` se invalida; al actualizar, la query `['courses', courseId]` se invalida; al eliminar, ambas se invalidan.

### Tecnicos
- [ ] **AC-T1:** Los tests de `useCourseFilters` usan `renderHook` de RTL para testear el hook de forma aislada, sin necesidad de un componente contenedor.
- [ ] **AC-T2:** Los tests de mutaciones de React Query verifican la invalidacion de cache usando `queryClient.getQueryState()` o espiando `queryClient.invalidateQueries()`.
- [ ] **AC-T3:** Los tests de drag-and-drop mockean los eventos de arrastre usando `fireEvent.dragStart`, `fireEvent.dragOver` y `fireEvent.drop` o una libreria auxiliar.
- [ ] **AC-T4:** Los tests no dependen de timers reales; usan `vi.useFakeTimers()` cuando es necesario verificar debounce o delays.

### QA
- [ ] **QA-1:** La cobertura de tests del modulo de cursos (`src/modules/courses/`) alcanza al menos 80% en lineas y ramas.
- [ ] **QA-2:** Los tests se ejecutan de forma aislada y no fallan cuando se ejecutan individualmente o en paralelo.
- [ ] **QA-3:** Al cambiar la logica de validacion del `courseSchema`, al menos un test unitario falla, demostrando que los tests detectan regresiones.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-206 | Escribir tests unitarios para `courseSchema` (campos requeridos, longitudes, formatos) | 0.5h | Alta |
| T-FE-207 | Escribir tests unitarios para hook `useCourseFilters` con `renderHook` | 0.5h | Alta |
| T-FE-208 | Configurar mocks de API para endpoints de cursos (CRUD) | 0.5h | Alta |
| T-FE-209 | Escribir tests de integracion para `CourseForm` (validacion y envio exitoso) | 1h | Alta |
| T-FE-210 | Escribir tests de integracion para `ModuleAccordion` (expandir/colapsar) | 0.5h | Media |
| T-FE-211 | Escribir tests de invalidacion de cache de React Query para operaciones CRUD | 0.5h | Alta |
| T-FE-212 | Escribir tests de drag-and-drop para reordenamiento de modulos | 0.5h | Baja |

## Notas Tecnicas
- Para testear hooks con `renderHook`:
  ```typescript
  const { result } = renderHook(() => useCourseFilters(), {
    wrapper: createWrapper(), // incluye QueryClientProvider
  });
  act(() => result.current.setCategory('programming'));
  expect(result.current.filters.category).toBe('programming');
  ```
- Para verificar invalidacion de cache, espiar la funcion `invalidateQueries`:
  ```typescript
  const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
  // ... ejecutar mutacion ...
  expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ['courses'] });
  ```
- Los tests de drag-and-drop pueden ser fragiles; considerar abstraer la logica de reordenamiento en un hook y testear ese hook directamente.
- Usar `vi.useFakeTimers()` para el debounce del filtro de busqueda por texto, avanzando el timer con `vi.advanceTimersByTime(300)`.

## Dependencias
- **Depende de:** HU-FE-011 (Dashboard Admin), HU-FE-012 (CourseForm), HU-FE-013 (ModuleAccordion)
- **Bloquea a:** Ninguna
