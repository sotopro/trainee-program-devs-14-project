# HU-FE-011: Dashboard del Administrador

## Descripción
Como administrador, quiero ver un panel principal con estadísticas clave y accesos rápidos para poder monitorear el estado general de la plataforma de aprendizaje de un vistazo.

El Dashboard del Administrador es la página principal que se presenta al usuario con rol de administrador tras iniciar sesión. Esta vista centraliza la información más relevante de la plataforma LearnPath: tarjetas de estadísticas mostrando el total de cursos creados, usuarios registrados e inscripciones activas, una sección de actividad reciente que lista las últimas acciones realizadas (nuevas inscripciones, cursos publicados, quizzes completados), y un área de acciones rápidas con botones para crear un nuevo curso, gestionar usuarios o ver reportes. El layout utiliza un grid responsivo con tarjetas de shadcn/ui y los datos se obtienen mediante React Query para garantizar una experiencia fluida con datos siempre actualizados.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Edgar Chacon |
| QA | Daniel Soto |

## Criterios de Aceptación

### Funcionales
- [ ] **AC-1:** El dashboard muestra tres tarjetas de estadísticas principales: total de cursos, total de usuarios registrados y total de inscripciones activas, cada una con su ícono representativo y valor numérico actualizado.
- [ ] **AC-2:** Se presenta una sección de "Actividad Reciente" que lista las últimas 10 acciones realizadas en la plataforma (inscripciones, publicaciones de cursos, completación de quizzes) con timestamp relativo (ej. "hace 5 minutos").
- [ ] **AC-3:** El área de "Acciones Rápidas" contiene botones funcionales para: crear nuevo curso, gestionar usuarios y ver catálogo de cursos, cada uno redirigiendo a la ruta correspondiente.
- [ ] **AC-4:** El layout del dashboard es completamente responsivo: en desktop muestra un grid de 3 columnas para las tarjetas de stats, en tablet 2 columnas, y en móvil 1 columna apilada.
- [ ] **AC-5:** Mientras los datos se cargan, se muestran esqueletos de carga (skeletons) en lugar de spinners, proporcionando una mejor experiencia visual al usuario.

### Técnicos
- [ ] **AC-T1:** Los datos del dashboard se obtienen mediante `useQuery` de TanStack Query v5 con una clave de query `['admin', 'dashboard-stats']` y un `staleTime` de 30 segundos para evitar refetches innecesarios.
- [ ] **AC-T2:** Se implementa un custom hook `useDashboardStats()` que encapsula la lógica de fetching y expone `{ stats, recentActivity, isLoading, error }`.
- [ ] **AC-T3:** Los componentes de tarjetas estadísticas utilizan `Card`, `CardHeader`, `CardTitle` y `CardContent` de shadcn/ui para mantener consistencia con el sistema de diseño.
- [ ] **AC-T4:** El componente `AdminDashboard` está protegido y solo es accesible para usuarios con rol `admin`, redirigiendo al home si el rol no es válido.

### QA
- [ ] **QA-1:** Verificar que al acceder al dashboard como administrador, las tres tarjetas de estadísticas cargan correctamente con datos reales del API y se actualizan al hacer refocus en la ventana.
- [ ] **QA-2:** Comprobar que el layout responsivo se adapta correctamente en resoluciones de 320px, 768px y 1024px sin desbordamientos ni solapamientos de contenido.
- [ ] **QA-3:** Validar que si el API de estadísticas falla, se muestra un mensaje de error amigable con opción de reintentar, y que los skeletons de carga aparecen durante la petición.

## Tareas

| ID | Tarea | Estimación | Prioridad |
|----|-------|-----------|-----------|
| T-FE-041 | Crear custom hook `useDashboardStats()` con React Query para obtener estadísticas del backend | 1h | Alta |
| T-FE-042 | Implementar componente `StatsCard` reutilizable con shadcn/ui Card que reciba ícono, título y valor | 0.5h | Alta |
| T-FE-043 | Desarrollar sección de grid de estadísticas con layout responsivo (3/2/1 columnas) | 0.5h | Alta |
| T-FE-044 | Crear componente `RecentActivityList` que muestre las últimas acciones con timestamps relativos | 1h | Media |
| T-FE-045 | Implementar sección de acciones rápidas con navegación a rutas correspondientes | 0.5h | Media |
| T-FE-046 | Agregar estados de carga (skeletons) y error con opción de retry | 0.5h | Media |

## Notas Técnicas
- Utilizar `date-fns` o `Intl.RelativeTimeFormat` para formatear los timestamps relativos en la actividad reciente.
- El grid responsivo se implementa con clases de Tailwind: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`.
- Para los skeletons, usar el componente `Skeleton` de shadcn/ui aplicado dentro de cada `StatsCard` cuando `isLoading` es `true`.
- Considerar implementar `refetchOnWindowFocus: true` en la query para mantener datos actualizados cuando el admin regresa a la pestaña.
- La ruta del dashboard debe ser `/admin` o `/admin/dashboard` y estar registrada dentro del layout de administración.

## Dependencias
- **Depende de:** HU-FE-007 (rutas protegidas y guards de autenticación), HU-BE-008 (API de estadísticas del dashboard)
- **Bloquea a:** HU-FE-014 (panel de asignación de cursos accede desde el dashboard)
