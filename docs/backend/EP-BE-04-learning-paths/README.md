# EP-BE-04: Learning Paths y Enrollment Backend

## Descripcion

Esta epica implementa la logica de negocio para las rutas de aprendizaje (learning paths), el sistema de inscripcion (enrollment) y el seguimiento de progreso de los estudiantes en LearnPath. Las rutas de aprendizaje son secuencias personalizables de lecciones y modulos que guian al estudiante a traves de un recorrido educativo estructurado.

La funcionalidad mas distintiva de esta epica es el sistema de bifurcacion (fork) de rutas de aprendizaje, inspirado en el modelo de branching de Git. Un usuario puede tomar una ruta de aprendizaje publica (creada por un admin o por otro usuario) y crear su propia copia personalizada, reordenando los elementos, omitiendo lecciones que no le interesan o agregando lecciones de otros cursos. El sistema mantiene la relacion entre la ruta original y la forkeada para poder mostrar el arbol de derivaciones.

El modulo de progreso registra el avance del estudiante en cada leccion y curso, calculando porcentajes de completitud, tiempos de estudio y rachas de aprendizaje. Esta informacion alimenta tanto el dashboard del estudiante como el sistema de recomendaciones de IA. Los endpoints estan disenados para soportar optimistic updates del frontend, respondiendo rapidamente y procesando actualizaciones de forma eficiente.

## Responsable(s)

| Rol | Nombre |
|-----|--------|
| Desarrollador | Jazir Olivera |
| QA | Daniel Soto |

## Temas React Asociados

No aplica (epica de backend).

## Historias de Usuario

| ID | Titulo | Prioridad | Semana |
|----|--------|-----------|--------|
| HU-BE-012 | Sistema de enrollment (inscripcion a cursos) | Alta | S1 |
| HU-BE-013 | CRUD de learning paths | Alta | S1-S2 |
| HU-BE-014 | Fork de rutas de aprendizaje | Alta | S2 |
| HU-BE-015 | Seguimiento de progreso del estudiante | Alta | S2 |

### Detalle de Historias

#### HU-BE-012: Sistema de enrollment (inscripcion a cursos)

**Como** usuario, **quiero** poder inscribirme y desinscribirme de cursos a traves del API, **para** acceder al contenido educativo que me interesa.

**Criterios de Aceptacion:**
- `POST /api/enrollments` — Inscribirse a un curso. Body: `{ courseId }`. Requiere autenticacion.
- `DELETE /api/enrollments/:enrollmentId` — Cancelar inscripcion. Soft delete (marcar como INACTIVE).
- `GET /api/enrollments/me` — Listar mis inscripciones activas con info del curso.
- `GET /api/enrollments/me/:courseId` — Verificar si estoy inscrito en un curso especifico.
- No permitir inscripcion duplicada al mismo curso (409 si ya existe y esta activa).
- Al inscribirse, crear automaticamente un learning path predeterminado con las lecciones del curso en orden.
- Al inscribirse, inicializar registros de progreso en 0 para cada leccion.
- Verificar que el curso existe y esta publicado antes de permitir la inscripcion.
- Retornar el enrollment creado con status 201.

#### HU-BE-013: CRUD de learning paths

**Como** usuario inscrito, **quiero** poder ver, crear y editar mis rutas de aprendizaje, **para** organizar mi recorrido educativo de la forma que mejor se adapte a mis necesidades.

**Criterios de Aceptacion:**
- `POST /api/learning-paths` — Crear ruta personalizada. Body: `{ name, description, items: [{ lessonId, order }] }`.
- `GET /api/learning-paths/me` — Listar mis rutas de aprendizaje.
- `GET /api/learning-paths/:pathId` — Obtener detalle de una ruta con items y progreso.
- `PUT /api/learning-paths/:pathId` — Actualizar ruta (nombre, descripcion).
- `PATCH /api/learning-paths/:pathId/items` — Actualizar items de la ruta (agregar, eliminar, reordenar).
- `DELETE /api/learning-paths/:pathId` — Eliminar una ruta personalizada (no la predeterminada del enrollment).
- Cada ruta tiene items ordenados que referencian lecciones.
- Los items incluyen estado de completitud individual.
- Solo el propietario puede editar/eliminar sus rutas.
- Las rutas predeterminadas (creadas al inscribirse) no se pueden eliminar, solo personalizar.

#### HU-BE-014: Fork de rutas de aprendizaje

**Como** usuario, **quiero** poder hacer fork de rutas de aprendizaje publicas para crear mi propia version personalizada, **para** adaptar rutas existentes a mis necesidades sin empezar desde cero.

**Criterios de Aceptacion:**
- `POST /api/learning-paths/:pathId/fork` — Crear una copia de la ruta con todos sus items.
- La nueva ruta tiene `isForked: true` y `originalPathId` referenciando la ruta original.
- El propietario de la ruta forkeada es el usuario que hizo el fork.
- Se copian todos los items de la ruta original, pero el progreso se inicia en 0.
- `GET /api/learning-paths/:pathId/forks` — Listar las rutas que han sido forkeadas de una ruta original.
- `GET /api/learning-paths/:pathId/origin` — Obtener la ruta original de una ruta forkeada.
- Solo se pueden forkear rutas marcadas como publicas o compartidas.
- El usuario puede editar libremente su ruta forkeada (reordenar, agregar, eliminar items).
- Limite de forks por usuario por ruta: 1 (para evitar duplicados).

#### HU-BE-015: Seguimiento de progreso del estudiante

**Como** estudiante, **quiero** que mi progreso se registre automaticamente al completar lecciones, y poder consultar mi avance general, **para** saber cuanto he avanzado y que me falta por completar.

**Criterios de Aceptacion:**
- `POST /api/progress` — Registrar progreso. Body: `{ lessonId, courseId, completed?, timeSpent? }`.
- `GET /api/progress/me` — Obtener resumen de progreso: cursos activos, lecciones completadas, tiempo total.
- `GET /api/progress/me/course/:courseId` — Progreso detallado de un curso: porcentaje, lecciones completadas por modulo.
- `GET /api/progress/me/streak` — Obtener racha de aprendizaje (dias consecutivos con actividad).
- `PATCH /api/progress/:progressId` — Actualizar progreso existente (marcar completado, agregar tiempo).
- El endpoint de progreso esta optimizado para responder rapido (soportar optimistic updates del FE).
- Si ya existe un registro de progreso para esa leccion, se actualiza en lugar de crear uno nuevo.
- El porcentaje de curso se calcula como: `(lecciones completadas / total lecciones) * 100`.
- La racha se calcula basandose en registros de progreso con fecha de los ultimos dias.
- Los datos de progreso alimentan el endpoint de recomendaciones de IA (EP-BE-06).

## Dependencias

- **Depende de:** EP-BE-01 (Setup), EP-BE-02 (Autenticacion), EP-BE-03 (Gestion de Cursos - los cursos y lecciones deben existir).
- **Bloquea a:** EP-BE-06 (IA - las recomendaciones se basan en progreso), EP-BE-07 (Testing).

## Definition of Done

- [ ] Sistema de enrollment funcional con creacion automatica de learning path y progreso.
- [ ] CRUD completo de learning paths con gestion de items.
- [ ] Fork de rutas de aprendizaje funcional con trazabilidad de origen.
- [ ] Seguimiento de progreso con porcentajes, tiempos y racha.
- [ ] Endpoints optimizados para soportar optimistic updates.
- [ ] Validacion con Zod en todos los endpoints.
- [ ] Permisos verificados: usuarios solo acceden a su propio progreso y rutas.
- [ ] Integridad referencial mantenida (enrollment -> progress -> path).
- [ ] Respuestas de error consistentes y tipadas.
- [ ] Tipos TypeScript completos en controllers, services y validaciones.
- [ ] Calculos de porcentaje y racha correctos y probados.
