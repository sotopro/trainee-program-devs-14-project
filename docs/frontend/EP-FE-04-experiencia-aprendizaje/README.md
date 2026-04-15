# EP-FE-04: Experiencia de Aprendizaje

## Descripcion

Esta epica construye toda la interfaz de experiencia de aprendizaje del usuario final en LearnPath. Abarca desde el catalogo de cursos disponibles hasta la vista detallada de lecciones, pasando por el sistema de inscripcion, la visualizacion de rutas de aprendizaje (learning paths) y el seguimiento de progreso del estudiante.

Una de las funcionalidades mas innovadoras de esta epica es el sistema de bifurcacion (fork) de rutas de aprendizaje. Similar al concepto de fork en Git, los usuarios pueden tomar una ruta de aprendizaje existente y crear su propia version personalizada, reordenando modulos, omitiendo lecciones o agregando contenido adicional de otros cursos. Esta funcionalidad requiere una visualizacion clara del arbol de rutas y sus relaciones.

La epica hace uso intensivo de TanStack Query para el data fetching y cache management, incluyendo optimistic updates para mejorar la percepcion de rendimiento cuando el usuario marca lecciones como completadas o actualiza su progreso. Se implementan patrones de comunicacion entre componentes (props callbacks, lifting state) para coordinar las multiples vistas que componen la experiencia de aprendizaje, y useEffect para sincronizar el estado del progreso con el backend.

## Responsable(s)

| Rol | Nombre |
|-----|--------|
| Desarrollador | Jazir Olivera |
| QA | Daniel Soto |

## Temas React Asociados

| # | Tema | Descripcion Breve |
|---|------|-------------------|
| 2 | Efectos y Ciclo de Vida | `useEffect` para sincronizar progreso con el backend, suscripcion a cambios y cleanup |
| 6 | Comunicacion entre Componentes | Props callbacks, lifting state up para coordinar catalogo, inscripcion y vista de leccion |
| 10 | Data Fetching con TanStack Query | Queries para catalogo y lecciones, mutations para inscripcion y progreso, optimistic updates |

## Historias de Usuario

| ID | Titulo | Prioridad | Semana |
|----|--------|-----------|--------|
| HU-FE-015 | Catalogo de cursos con busqueda y filtros | Alta | S1 |
| HU-FE-016 | Detalle de curso e inscripcion | Alta | S1 |
| HU-FE-017 | Vista de leccion y navegacion entre contenidos | Alta | S1 |
| HU-FE-018 | Visualizacion de ruta de aprendizaje y fork de paths | Alta | S2 |
| HU-FE-019 | Seguimiento de progreso con optimistic updates | Alta | S2 |

### Detalle de Historias

#### HU-FE-015: Catalogo de cursos con busqueda y filtros

**Como** usuario, **quiero** explorar un catalogo de cursos disponibles con capacidades de busqueda y filtrado, **para** encontrar facilmente los cursos que se ajusten a mis intereses y nivel.

**Criterios de Aceptacion:**
- Grid/lista de tarjetas de cursos con imagen, titulo, descripcion breve, nivel y numero de modulos.
- Barra de busqueda por titulo y descripcion.
- Filtros por categoria, nivel de dificultad y duracion estimada.
- Paginacion o scroll infinito para listas largas.
- Uso de `useQuery` de TanStack Query con cache para evitar refetches innecesarios.
- `useEffect` para sincronizar los filtros con los query params de la URL.
- Estado de carga (skeletons) y estado vacio (no hay resultados).
- Tarjetas clickeables que navegan al detalle del curso.

#### HU-FE-016: Detalle de curso e inscripcion

**Como** usuario, **quiero** ver el detalle completo de un curso y poder inscribirme con un click, **para** evaluar si el curso me interesa y comenzar a aprender rapidamente.

**Criterios de Aceptacion:**
- Pagina de detalle con: titulo, descripcion completa, imagen de portada, instructor, duracion, nivel, lista de modulos y lecciones.
- Boton de inscripcion prominente para usuarios no inscritos.
- Indicador de "Ya inscrito" para usuarios que ya estan en el curso.
- Mutation de TanStack Query para la inscripcion con feedback de exito/error.
- Comunicacion entre el componente de detalle y el boton de inscripcion via props callbacks.
- Despues de inscribirse, redirect automatico a la primera leccion o al learning path.
- Si el usuario no esta autenticado, redirect a login con retorno al curso tras autenticacion.

#### HU-FE-017: Vista de leccion y navegacion entre contenidos

**Como** estudiante inscrito, **quiero** poder ver el contenido de cada leccion y navegar facilmente entre lecciones y modulos, **para** seguir el curso de forma fluida y organizada.

**Criterios de Aceptacion:**
- Vista de leccion con contenido renderizado (texto, imagenes, bloques de codigo).
- Sidebar con la estructura del curso (modulos y lecciones) indicando progreso.
- Navegacion prev/next entre lecciones.
- Indicadores visuales de lecciones completadas, actual y pendientes.
- Boton "Marcar como completada" al final de cada leccion.
- Comunicacion entre sidebar y area de contenido via lifting state up.
- `useEffect` para registrar tiempo de lectura y scroll position.

#### HU-FE-018: Visualizacion de ruta de aprendizaje y fork de paths

**Como** estudiante, **quiero** visualizar mi ruta de aprendizaje y poder hacer fork de rutas existentes para personalizarlas, **para** adaptar mi experiencia educativa a mis necesidades especificas.

**Criterios de Aceptacion:**
- Visualizacion de la ruta de aprendizaje como un grafo o timeline (nodos = lecciones/modulos, conexiones = dependencias).
- Indicadores de progreso en cada nodo (completado, en progreso, pendiente).
- Boton "Fork" en rutas publicas para crear una copia personalizable.
- Interfaz de edicion de ruta forkeada: reordenar modulos, omitir lecciones.
- Vista de comparacion entre ruta original y ruta forkeada.
- Queries de TanStack Query para obtener datos del path y sus relaciones.
- Mutations para crear fork y modificar ruta personalizada.

#### HU-FE-019: Seguimiento de progreso con optimistic updates

**Como** estudiante, **quiero** que mi progreso se actualice instantaneamente al completar actividades y se sincronice con el servidor en segundo plano, **para** tener una experiencia fluida sin esperas visibles.

**Criterios de Aceptacion:**
- Barra de progreso general del curso (porcentaje de lecciones completadas).
- Progreso por modulo visible en la sidebar.
- Al marcar una leccion como completada, la UI se actualiza inmediatamente (optimistic update).
- Si la sincronizacion con el servidor falla, se revierte la UI y se muestra error.
- `useMutation` con `onMutate` (optimistic), `onError` (rollback) y `onSettled` (invalidate).
- `useEffect` para auto-guardar progreso periodicamente (tiempo de lectura, ultimo scroll).
- Dashboard de progreso personal con estadisticas: cursos activos, lecciones completadas, racha de dias.

## Dependencias

- **Depende de:** EP-FE-01 (Setup), EP-FE-02 (Autenticacion), EP-FE-05 (Layout y componentes UI), EP-BE-03 (Cursos Backend), EP-BE-04 (Learning Paths Backend).
- **Bloquea a:** EP-FE-07 (Testing - necesita componentes para testear).

## Definition of Done

- [ ] Catalogo de cursos funcional con busqueda, filtros y paginacion.
- [ ] Detalle de curso con informacion completa e inscripcion funcional.
- [ ] Vista de leccion con renderizado de contenido y navegacion prev/next.
- [ ] Sidebar de estructura del curso con indicadores de progreso.
- [ ] Visualizacion de learning path como grafo/timeline.
- [ ] Fork de rutas de aprendizaje funcional.
- [ ] Optimistic updates implementados para progreso del usuario.
- [ ] Rollback automatico en caso de errores de sincronizacion.
- [ ] TanStack Query configurado con cache, staleTime y invalidacion apropiados.
- [ ] useEffect usado correctamente con cleanup functions donde sea necesario.
- [ ] Comunicacion entre componentes implementada sin prop drilling excesivo.
- [ ] Estados de carga, error y vacio manejados en todas las vistas.
- [ ] Todos los componentes con tipos TypeScript completos.
