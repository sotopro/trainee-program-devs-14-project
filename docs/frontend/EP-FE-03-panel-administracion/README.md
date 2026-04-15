# EP-FE-03: Panel de Administracion

## Descripcion

Esta epica cubre la construccion completa del panel de administracion de LearnPath, el area desde donde los administradores gestionan los cursos, modulos, lecciones y asignaciones de usuarios. El dashboard de administracion es una de las interfaces mas complejas del sistema, ya que involucra multiples operaciones CRUD, formularios anidados y gestion de estado complejo.

El panel incluye un dashboard principal con metricas y accesos rapidos, una interfaz de gestion de cursos con operaciones CRUD completas (crear, leer, actualizar, eliminar), un sistema de gestion de modulos y lecciones dentro de cada curso (con reordenamiento drag-and-drop cuando sea posible), y una interfaz de asignacion de usuarios a cursos. Todos los formularios se implementan con React Hook Form integrado con Zod para validacion de esquemas robusta.

Se hara uso intensivo de patrones de estado complejo con `useReducer` para manejar los flujos de edicion multi-paso, HOCs para la autorizacion granular dentro del panel, y optimizaciones con `useMemo` y `useCallback` para evitar re-renders innecesarios en listas grandes de cursos y usuarios.

## Responsable(s)

| Rol | Nombre |
|-----|--------|
| Desarrollador | Edgar Chacon |
| QA | Daniel Soto |

## Temas React Asociados

| # | Tema | Descripcion Breve |
|---|------|-------------------|
| 3 | Manejo de Estado Complejo | Uso de `useReducer` para flujos de edicion multi-paso y gestion de formularios complejos en el dashboard |
| 9 | Formularios Avanzados | Implementacion de React Hook Form + Zod para CRUD de cursos, modulos y lecciones con validacion en tiempo real |
| 13 | Patrones HOC y Render Props | HOCs para autorizacion granular dentro del panel admin y wrappers de layout reutilizables |

## Historias de Usuario

| ID | Titulo | Prioridad | Semana |
|----|--------|-----------|--------|
| HU-FE-011 | Dashboard de administracion con metricas y navegacion | Alta | S1 |
| HU-FE-012 | CRUD de cursos - Listado, creacion y edicion | Alta | S1 |
| HU-FE-013 | Gestion de modulos y lecciones dentro de un curso | Alta | S1 |
| HU-FE-014 | Asignacion de usuarios a cursos | Media | S2 |

### Detalle de Historias

#### HU-FE-011: Dashboard de administracion con metricas y navegacion

**Como** administrador, **quiero** un dashboard con metricas generales y accesos rapidos a las distintas secciones de gestion, **para** tener una vision general del estado de la plataforma y navegar eficientemente.

**Criterios de Aceptacion:**
- Layout de dashboard con sidebar de navegacion y area principal de contenido.
- Tarjetas de metricas: total de cursos, total de usuarios, cursos publicados, inscripciones activas.
- Tabla de cursos recientes con acciones rapidas (editar, ver, eliminar).
- Accesos directos a: crear curso, gestionar usuarios, ver reportes.
- El dashboard se renderiza solo para usuarios con rol admin (HOC `withAdminAccess`).
- Se usa `useReducer` para manejar el estado del dashboard (filtros, paginacion, vista activa).
- Responsive: funcional en desktop y tablet.

#### HU-FE-012: CRUD de cursos - Listado, creacion y edicion

**Como** administrador, **quiero** poder crear, ver, editar y eliminar cursos desde el panel de administracion, **para** gestionar el catalogo de contenido de la plataforma.

**Criterios de Aceptacion:**
- Listado de cursos con busqueda, filtros (estado, categoria) y paginacion.
- Formulario de creacion de curso con campos: titulo, descripcion, categoria, imagen de portada, nivel de dificultad.
- Formulario de edicion pre-poblado con los datos existentes del curso.
- Confirmacion antes de eliminar un curso (modal de confirmacion).
- Validacion con React Hook Form + Zod en todos los formularios.
- Estados de carga y error manejados correctamente.
- Uso de `useReducer` para manejar el estado complejo del flujo de creacion/edicion.
- `useMemo` para filtrado y busqueda de la lista de cursos.
- `useCallback` para handlers de eventos en la lista.

#### HU-FE-013: Gestion de modulos y lecciones dentro de un curso

**Como** administrador, **quiero** poder agregar, editar, reordenar y eliminar modulos y lecciones dentro de un curso, **para** estructurar el contenido educativo de forma organizada y logica.

**Criterios de Aceptacion:**
- Vista de detalle de curso mostrando modulos y lecciones en estructura de arbol.
- Formulario para crear/editar modulo (titulo, descripcion, orden).
- Formulario para crear/editar leccion dentro de un modulo (titulo, contenido, tipo, duracion estimada).
- Posibilidad de reordenar modulos y lecciones (drag-and-drop o botones arriba/abajo).
- Validacion con Zod para cada formulario.
- Modal de confirmacion para eliminacion de modulos/lecciones.
- El estado de la estructura del curso se maneja con `useReducer` para operaciones anidadas.

#### HU-FE-014: Asignacion de usuarios a cursos

**Como** administrador, **quiero** poder asignar y desasignar usuarios a cursos especificos, **para** controlar el acceso de los estudiantes al contenido.

**Criterios de Aceptacion:**
- Vista de asignacion con lista de usuarios disponibles y busqueda.
- Checkbox o toggle para asignar/desasignar usuarios de un curso.
- Busqueda y filtrado de usuarios por nombre o email.
- Indicador visual de usuarios ya asignados al curso.
- Confirmacion de cambios antes de guardar las asignaciones.
- Feedback visual de exito/error al guardar.

## Dependencias

- **Depende de:** EP-FE-01 (Setup), EP-FE-02 (Autenticacion - rutas protegidas y auth store), EP-BE-03 (Gestion de Cursos Backend).
- **Bloquea a:** EP-FE-04 (parcialmente - los cursos deben existir para que los usuarios se inscriban).

## Definition of Done

- [ ] Dashboard de administracion renderizado y funcional con metricas.
- [ ] CRUD completo de cursos (crear, leer, actualizar, eliminar).
- [ ] Gestion de modulos y lecciones con operaciones CRUD y reordenamiento.
- [ ] Asignacion de usuarios a cursos funcional.
- [ ] Todos los formularios validados con React Hook Form + Zod.
- [ ] `useReducer` implementado para estados complejos del dashboard y edicion.
- [ ] HOCs de autorizacion aplicados a todas las vistas admin.
- [ ] `useMemo` y `useCallback` aplicados para optimizacion de rendimiento.
- [ ] Estados de carga, error y vacios manejados con UIs apropiadas.
- [ ] Interfaz responsive (desktop y tablet como minimo).
- [ ] Todos los componentes con tipos TypeScript completos.
