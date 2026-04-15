# EP-BE-03: Gestion de Cursos Backend

## Descripcion

Esta epica implementa toda la logica de negocio y endpoints API para la gestion de cursos, modulos y lecciones en LearnPath. Proporciona las operaciones CRUD completas que el panel de administracion consume para crear y administrar el contenido educativo de la plataforma.

La gestion de cursos es el nucleo del sistema, ya que todo el contenido educativo se estructura jerarquicamente: un curso contiene multiples modulos, y cada modulo contiene multiples lecciones. Los endpoints deben soportar operaciones anidadas (crear un modulo dentro de un curso, agregar una leccion a un modulo) y mantener la integridad referencial en todo momento. Se implementa validacion estricta de los datos de entrada y manejo de permisos (solo administradores pueden crear, editar y eliminar cursos).

Ademas del CRUD basico, se incluye la funcionalidad de asignacion de usuarios a cursos, que permite a los administradores controlar que estudiantes tienen acceso a que cursos. Los endpoints de listado soportan paginacion, filtrado y busqueda para manejar eficientemente catalogos grandes de cursos.

## Responsable(s)

| Rol | Nombre |
|-----|--------|
| Desarrollador | Edgar Chacon |
| QA | Daniel Soto |

## Temas React Asociados

No aplica (epica de backend).

## Historias de Usuario

| ID | Titulo | Prioridad | Semana |
|----|--------|-----------|--------|
| HU-BE-008 | CRUD de cursos (crear, listar, obtener, actualizar, eliminar) | Alta | S1 |
| HU-BE-009 | CRUD de modulos dentro de un curso | Alta | S1 |
| HU-BE-010 | CRUD de lecciones dentro de un modulo | Alta | S1 |
| HU-BE-011 | Asignacion y desasignacion de usuarios a cursos | Media | S2 |

### Detalle de Historias

#### HU-BE-008: CRUD de cursos (crear, listar, obtener, actualizar, eliminar)

**Como** administrador, **quiero** endpoints API para crear, listar, ver, editar y eliminar cursos, **para** gestionar el catalogo de contenido educativo de la plataforma desde el panel de administracion.

**Criterios de Aceptacion:**
- `POST /api/courses` — Crear curso. Body: `{ title, description, category, difficulty, coverImage? }`. Solo admin. Retorna curso creado con status 201.
- `GET /api/courses` — Listar cursos. Query params: `page`, `limit`, `search`, `category`, `difficulty`, `status`. Retorna lista paginada con metadata `{ data, total, page, totalPages }`.
- `GET /api/courses/:id` — Obtener curso por ID con modulos y lecciones incluidos. 404 si no existe.
- `PUT /api/courses/:id` — Actualizar curso. Solo admin y autor. Validacion parcial de campos.
- `DELETE /api/courses/:id` — Eliminar curso (soft delete o hard delete con confirmacion). Solo admin. Manejo de relaciones dependientes.
- Validacion con Zod en todos los endpoints.
- El listado para usuarios regulares solo muestra cursos con status `PUBLISHED`.
- El listado para admin muestra todos los cursos (draft, published, archived).

#### HU-BE-009: CRUD de modulos dentro de un curso

**Como** administrador, **quiero** endpoints para gestionar los modulos de un curso (crear, listar, editar, eliminar, reordenar), **para** organizar el contenido educativo en secciones logicas.

**Criterios de Aceptacion:**
- `POST /api/courses/:courseId/modules` — Crear modulo. Body: `{ title, description, order? }`. Auto-asigna order si no se proporciona.
- `GET /api/courses/:courseId/modules` — Listar modulos del curso ordenados por `order`.
- `PUT /api/courses/:courseId/modules/:moduleId` — Actualizar modulo. Verificar que el modulo pertenece al curso.
- `DELETE /api/courses/:courseId/modules/:moduleId` — Eliminar modulo y re-calcular order de los restantes.
- `PATCH /api/courses/:courseId/modules/reorder` — Reordenar modulos. Body: `{ moduleIds: string[] }` con el nuevo orden.
- Solo admin puede realizar estas operaciones.
- Validar existencia del curso padre antes de operar.

#### HU-BE-010: CRUD de lecciones dentro de un modulo

**Como** administrador, **quiero** endpoints para gestionar las lecciones dentro de un modulo (crear, listar, editar, eliminar, reordenar), **para** poblar cada modulo con contenido educativo.

**Criterios de Aceptacion:**
- `POST /api/modules/:moduleId/lessons` — Crear leccion. Body: `{ title, content, type, duration? }`. El campo `content` acepta JSON (formato Editor.js).
- `GET /api/modules/:moduleId/lessons` — Listar lecciones del modulo ordenadas por `order`.
- `GET /api/lessons/:lessonId` — Obtener leccion completa con contenido. Para usuarios inscritos al curso o admin.
- `PUT /api/lessons/:lessonId` — Actualizar leccion (titulo, contenido, tipo, duracion).
- `DELETE /api/lessons/:lessonId` — Eliminar leccion y re-calcular order.
- `PATCH /api/modules/:moduleId/lessons/reorder` — Reordenar lecciones.
- El tipo de leccion puede ser: `TEXT`, `VIDEO`, `INTERACTIVE`, `QUIZ`.
- Validacion del contenido JSON de Editor.js (estructura basica).
- Solo admin puede crear/editar/eliminar. Usuarios inscritos pueden leer.

#### HU-BE-011: Asignacion y desasignacion de usuarios a cursos

**Como** administrador, **quiero** endpoints para asignar y desasignar usuarios a cursos, **para** controlar el acceso de los estudiantes al contenido.

**Criterios de Aceptacion:**
- `POST /api/courses/:courseId/assign` — Asignar usuarios. Body: `{ userIds: string[] }`. Solo admin.
- `DELETE /api/courses/:courseId/assign/:userId` — Desasignar un usuario de un curso. Solo admin.
- `GET /api/courses/:courseId/users` — Listar usuarios asignados a un curso con paginacion.
- `GET /api/users/:userId/courses` — Listar cursos asignados a un usuario.
- Verificar que el usuario y el curso existen antes de asignar.
- No permitir asignaciones duplicadas (ignorar silenciosamente o retornar 409).
- Al asignar, crear automaticamente el registro de enrollment con status `ACTIVE`.
- Al desasignar, marcar el enrollment como `INACTIVE` (preservar progreso).

## Dependencias

- **Depende de:** EP-BE-01 (Setup - Prisma y esquema DB), EP-BE-02 (Autenticacion - middlewares de auth y roles).
- **Bloquea a:** EP-BE-04 (Learning Paths - necesita cursos y lecciones), EP-BE-05 (Quizzes - necesita lecciones), EP-BE-06 (IA - genera contenido de cursos).

## Definition of Done

- [ ] CRUD completo de cursos con paginacion, filtrado y busqueda.
- [ ] CRUD completo de modulos con reordenamiento.
- [ ] CRUD completo de lecciones con soporte para contenido JSON (Editor.js).
- [ ] Asignacion y desasignacion de usuarios a cursos funcional.
- [ ] Validacion con Zod en todos los endpoints.
- [ ] Permisos verificados: solo admin puede crear/editar/eliminar.
- [ ] Usuarios regulares solo ven cursos publicados y lecciones de cursos inscritos.
- [ ] Respuestas de error consistentes y tipadas.
- [ ] Paginacion correcta con metadata en las respuestas.
- [ ] Integridad referencial mantenida en todas las operaciones.
- [ ] Tipos TypeScript completos en controllers, services y validaciones.
- [ ] Logs de operaciones CRUD criticas.
