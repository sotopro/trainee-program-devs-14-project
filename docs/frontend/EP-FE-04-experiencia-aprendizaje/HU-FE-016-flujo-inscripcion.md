# HU-FE-016: Flujo de Inscripción a Cursos

## Descripción
Como usuario autenticado, quiero inscribirme en cursos de mi interés mediante un flujo claro y sencillo para poder acceder al contenido de aprendizaje y hacer seguimiento de mi progreso.

El flujo de inscripción es el puente entre el descubrimiento de cursos en el catálogo y el inicio de la experiencia de aprendizaje en LearnPath. Desde la página de detalle de un curso, el usuario ve un botón prominente "Inscribirme" que al presionarse abre un modal de confirmación con un resumen del curso (número de módulos, duración estimada, descripción). Tras confirmar la inscripción, el sistema registra al usuario en el curso y lo redirige a la selección de learning path disponible para ese curso. Adicionalmente, se implementa la página "Mis Cursos" donde el usuario puede ver todos los cursos en los que está inscrito, su progreso en cada uno y acceder directamente a continuar donde lo dejó. La lógica de inscripción se encapsula en un custom hook `useEnrollment(courseId)` que gestiona el estado de la inscripción y las mutaciones correspondientes.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Jazir Olivera |
| QA | Daniel Soto |

## Criterios de Aceptación

### Funcionales
- [ ] **AC-1:** En la página de detalle del curso, se muestra un botón "Inscribirme" visible y prominente para usuarios no inscritos; para usuarios ya inscritos, el botón cambia a "Continuar curso" y redirige al learning path activo.
- [ ] **AC-2:** Al presionar "Inscribirme", se abre un modal de confirmación (Dialog de shadcn/ui) que muestra: título del curso, número de módulos, número de lecciones y un botón "Confirmar inscripción".
- [ ] **AC-3:** Tras confirmar la inscripción exitosamente, se muestra una notificación de éxito y el usuario es redirigido automáticamente a la selección de learning path del curso.
- [ ] **AC-4:** La página "Mis Cursos" muestra todos los cursos inscritos del usuario en tarjetas que incluyen: título, thumbnail, barra de progreso porcentual, número de lecciones completadas vs totales, y un botón "Continuar".
- [ ] **AC-5:** Si la inscripción falla (error de red, curso no disponible), se muestra un mensaje de error claro en el modal sin cerrarlo, permitiendo al usuario reintentar.

### Técnicos
- [ ] **AC-T1:** Se implementa un custom hook `useEnrollment(courseId)` que expone `{ isEnrolled, isLoading, enroll, enrollmentData }` y encapsula la query de verificación de inscripción y la mutación de inscripción.
- [ ] **AC-T2:** La mutación de inscripción usa `useMutation` de TanStack Query con invalidación de las queries `['enrollments']` y `['courses', courseId]` tras éxito para actualizar el estado en todas las vistas afectadas.
- [ ] **AC-T3:** La página "Mis Cursos" utiliza `useQuery` con clave `['enrollments', userId]` y renderiza un grid responsivo con estado vacío ("Aún no te has inscrito en ningún curso").
- [ ] **AC-T4:** La redirección post-inscripción utiliza `useNavigate` de React Router, navegando a `/courses/${courseId}/learning-path` con el estado de la inscripción.

### QA
- [ ] **QA-1:** Verificar que un usuario no autenticado no puede ver el botón "Inscribirme" (o al presionarlo se redirige al login) y que un usuario ya inscrito ve "Continuar curso" en lugar de "Inscribirme".
- [ ] **QA-2:** Comprobar que tras inscribirse exitosamente en un curso, este aparece inmediatamente en la página "Mis Cursos" con progreso al 0% y que la redirección al learning path ocurre sin errores.
- [ ] **QA-3:** Validar que al simular un error de red durante la inscripción, el modal permanece abierto con un mensaje de error visible y que al reintentar con conexión restaurada, la inscripción se completa correctamente.

## Tareas

| ID | Tarea | Estimación | Prioridad |
|----|-------|-----------|-----------|
| T-FE-071 | Implementar custom hook `useEnrollment(courseId)` con query de estado y mutación de inscripción | 1h | Alta |
| T-FE-072 | Desarrollar componente `EnrollButton` con estados condicionales (inscribirme/continuar/cargando) | 0.5h | Alta |
| T-FE-073 | Crear modal de confirmación de inscripción con resumen del curso usando Dialog de shadcn/ui | 0.5h | Alta |
| T-FE-074 | Implementar página "Mis Cursos" (`MyCoursesPage`) con grid de cursos inscritos, progreso y estado vacío | 1h | Alta |
| T-FE-075 | Integrar redirección post-inscripción al learning path y manejo de errores con retry | 0.5h | Media |
| T-FE-076 | Agregar ruta `/my-courses` al router y enlace en el menú de navegación del usuario | 0.5h | Media |

## Notas Técnicas
- El hook `useEnrollment(courseId)` debe combinar un `useQuery` para verificar el estado de inscripción con un `useMutation` para la acción de inscribirse, manteniendo ambos sincronizados.
- Para el modal de confirmación, usar `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` y `DialogFooter` de shadcn/ui.
- La barra de progreso en "Mis Cursos" puede usar el componente `Progress` de shadcn/ui, calculando el porcentaje como `(leccionesCompletadas / totalLecciones) * 100`.
- Considerar pre-cargar la información del learning path después de la inscripción usando `queryClient.prefetchQuery` para que la siguiente página cargue instantáneamente.
- El botón "Continuar" en "Mis Cursos" debe navegar a la última lección vista por el usuario, no al inicio del curso, para retomar donde lo dejó.
- Si el usuario no está autenticado, el botón "Inscribirme" debe redirigir a `/login?redirect=/courses/${courseId}` para volver al curso tras el login.

## Dependencias
- **Depende de:** HU-FE-015 (catálogo de cursos desde donde se navega al detalle), HU-BE-012 (API de inscripciones: crear, listar, verificar estado)
- **Bloquea a:** HU-FE-017 (vista de lección accesible solo tras inscripción), HU-FE-018 (selección de learning path post-inscripción)
