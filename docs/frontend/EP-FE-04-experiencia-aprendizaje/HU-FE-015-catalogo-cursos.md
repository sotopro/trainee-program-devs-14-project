# HU-FE-015: Catálogo de Cursos

## Descripción
Como usuario, quiero explorar un catálogo de cursos disponibles con opciones de búsqueda y filtrado para poder encontrar fácilmente los cursos que me interesan e inscribirme.

El Catálogo de Cursos es la vitrina principal de LearnPath donde los usuarios pueden descubrir los cursos disponibles en la plataforma. La vista presenta una colección de tarjetas de curso (`CourseCard`) organizadas en un grid responsivo, con una barra de búsqueda en la parte superior que permite buscar por título o descripción, filtros por categoría para refinar los resultados, opciones de ordenamiento (más recientes, más populares, alfabético) y un toggle para alternar entre vista de cuadrícula y vista de lista. Los datos se obtienen mediante React Query con un `staleTime` configurado para optimizar el caching y reducir peticiones innecesarias. Toda la lógica de filtrado y búsqueda se encapsula en un custom hook `useCourseFilters()` que centraliza el manejo de parámetros y su sincronización con la URL.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Jazir Olivera |
| QA | Daniel Soto |

## Criterios de Aceptación

### Funcionales
- [ ] **AC-1:** El catálogo muestra los cursos disponibles como tarjetas (`CourseCard`) en un grid responsivo, donde cada tarjeta incluye: thumbnail, título, descripción truncada, cantidad de módulos y número de inscripciones.
- [ ] **AC-2:** La barra de búsqueda permite filtrar cursos por título o descripción, actualizando los resultados en tiempo real con debounce de 300ms.
- [ ] **AC-3:** Los filtros por categoría se presentan como chips/tags seleccionables que permiten selección múltiple, filtrando los cursos visibles al activarse.
- [ ] **AC-4:** El selector de ordenamiento permite ordenar por: "Más recientes", "Más populares" (por inscripciones) y "Alfabético (A-Z)", aplicándose inmediatamente al cambiar.
- [ ] **AC-5:** Un toggle permite alternar entre vista de cuadrícula (grid de tarjetas) y vista de lista (filas con más detalle), y la preferencia se mantiene durante la sesión del usuario.
- [ ] **AC-6:** Cuando no hay resultados que coincidan con los filtros aplicados, se muestra un estado vacío amigable con sugerencia de limpiar filtros.

### Técnicos
- [ ] **AC-T1:** Los datos del catálogo se obtienen con `useQuery` de TanStack Query v5 con clave `['courses', filters]` y `staleTime` de 5 minutos para aprovechar el cache y minimizar peticiones al servidor.
- [ ] **AC-T2:** Se implementa un custom hook `useCourseFilters()` que encapsula la lógica de búsqueda, filtros, ordenamiento y paginación, exponiendo `{ filters, setSearch, setCategory, setSortBy, setViewMode, clearFilters }`.
- [ ] **AC-T3:** Los parámetros de filtrado se sincronizan con los query params de la URL (`?search=react&category=frontend&sort=popular`) para permitir compartir enlaces filtrados y mantener el estado al navegar.
- [ ] **AC-T4:** El componente `CourseCard` es un componente presentacional puro que recibe props tipadas y no gestiona estado interno de fetching.

### QA
- [ ] **QA-1:** Verificar que al buscar "React" en la barra de búsqueda, solo se muestran cursos cuyo título o descripción contengan el término, y que al limpiar la búsqueda se restaura el catálogo completo.
- [ ] **QA-2:** Comprobar que al seleccionar un filtro de categoría y un ordenamiento simultáneamente, ambos se aplican correctamente y los query params de la URL reflejan la combinación.
- [ ] **QA-3:** Validar que el toggle de vista grid/lista funciona correctamente en todas las resoluciones (móvil, tablet, desktop) y que la vista de lista muestra información adicional como la descripción completa.

## Tareas

| ID | Tarea | Estimación | Prioridad |
|----|-------|-----------|-----------|
| T-FE-065 | Implementar custom hook `useCourseFilters()` con manejo de estado de filtros sincronizado con URL query params | 1h | Alta |
| T-FE-066 | Crear componente `CourseCard` con thumbnail, título, descripción, conteo de módulos e inscripciones usando shadcn/ui Card | 0.5h | Alta |
| T-FE-067 | Desarrollar vista `CatalogPage` con grid responsivo, barra de búsqueda con debounce y filtros de categoría | 1h | Alta |
| T-FE-068 | Implementar lógica de ordenamiento y toggle de vista grid/lista | 0.5h | Media |
| T-FE-069 | Integrar React Query para fetching de cursos con `staleTime` optimizado y estado de carga con skeletons | 0.5h | Alta |
| T-FE-070 | Crear estado vacío y manejo de errores con opción de limpiar filtros o reintentar | 0.5h | Media |

## Notas Técnicas
- El custom hook `useCourseFilters()` debe utilizar `useSearchParams` de React Router para sincronizar los filtros con la URL, permitiendo deep-linking y navegación con botón atrás.
- Para el grid responsivo, usar Tailwind: `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`.
- La vista de lista puede reutilizar `CourseCard` con una prop `variant="list"` que cambie el layout de vertical a horizontal.
- El debounce de búsqueda debe usar el mismo hook `useDebounce` definido en HU-FE-014 para mantener consistencia.
- Considerar `placeholderData` (anteriormente `keepPreviousData`) de React Query para evitar que el catálogo parpadee al cambiar filtros, manteniendo los datos anteriores mientras se cargan los nuevos.
- Las thumbnails de los cursos deben tener un fallback visual (imagen placeholder) si la URL del thumbnail no está definida o falla al cargar.

## Dependencias
- **Depende de:** HU-FE-001 (setup del proyecto con React Query y React Router configurados), HU-BE-008 (API de listado de cursos con soporte de filtros y paginación)
- **Bloquea a:** HU-FE-016 (flujo de inscripción parte desde la vista de detalle accedida desde el catálogo), HU-FE-025 (optimización con React.memo del CourseCard)
