# HU-FE-024: Code Splitting y Lazy Loading

## Descripción
Como usuario, quiero que la aplicación cargue rápidamente mostrando solo el código necesario para la página actual para poder empezar a interactuar con la plataforma sin esperas prolongadas.

Esta historia de usuario implementa code splitting y lazy loading en LearnPath para optimizar el rendimiento de carga inicial de la aplicación. Todas las páginas de nivel superior se cargan de forma diferida (lazy) utilizando `React.lazy`: AdminDashboard, CourseEditor, CatalogPage, LearningPage y ProfilePage. Cada lazy import se envuelve en un `Suspense` boundary con esqueletos de carga (skeletons) específicos para cada página, proporcionando una experiencia visual superior a los spinners genéricos. El code splitting se implementa a nivel de rutas en el archivo `router.tsx`, asegurando que al navegar a una ruta solo se descargue el chunk correspondiente. Adicionalmente, se implementa prefetch on hover para las rutas de navegación más comunes, precargando el chunk de la página destino cuando el usuario posa el cursor sobre el enlace, logrando navegación aparentemente instantánea. Se utiliza `vite-plugin-visualizer` para analizar el tamaño de los bundles y validar la efectividad del splitting.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Joshua Rodriguez |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #12:** Code Splitting — Se aplica `React.lazy` con `Suspense` para dividir el bundle principal en chunks por ruta, reduciendo el tamaño de carga inicial. Se demuestra el uso correcto de Suspense boundaries (uno por grupo de rutas relacionadas, no uno global) y el patrón de prefetch para optimizar navegaciones anticipadas.

## Criterios de Aceptación

### Funcionales
- [ ] **AC-1:** La carga inicial de la aplicación solo descarga el chunk del JavaScript necesario para la ruta actual, sin incluir código de páginas no visitadas (verificable en Network tab del DevTools).
- [ ] **AC-2:** Al navegar a una nueva página, si el chunk no está precargado, se muestra un skeleton de carga específico para esa página (no un spinner genérico) mientras se descarga el chunk correspondiente.
- [ ] **AC-3:** Al posar el cursor sobre un enlace de navegación principal (sidebar, header) durante más de 200ms, se inicia la precarga del chunk de la página destino, logrando que la navegación posterior sea instantánea.
- [ ] **AC-4:** Los skeletons de carga reflejan la estructura visual de la página destino: el skeleton del dashboard muestra rectángulos en grid para las tarjetas de stats, el del catálogo muestra un grid de tarjetas vacías, etc.
- [ ] **AC-5:** El análisis de bundle con `vite-plugin-visualizer` genera un reporte visual que confirma la separación efectiva de chunks por ruta.

### Técnicos
- [ ] **AC-T1:** Todas las páginas de nivel superior se importan con `React.lazy(() => import('./pages/XXX'))` en el archivo `router.tsx`, generando chunks separados en el build de producción.
- [ ] **AC-T2:** Se definen Suspense boundaries estratégicos: uno para el grupo de rutas de admin, uno para las rutas de aprendizaje y uno para las rutas públicas, cada uno con su fallback skeleton específico.
- [ ] **AC-T3:** El prefetch on hover se implementa con un custom hook `usePrefetch(importFn)` que ejecuta el import dinámico al dispararse `onMouseEnter` con un debounce de 200ms para evitar precargas accidentales.
- [ ] **AC-T4:** Se configura `vite-plugin-visualizer` en `vite.config.ts` para generar un reporte HTML del análisis de bundles que se puede revisar en cada build.

### QA
- [ ] **QA-1:** Verificar en la pestaña Network del DevTools que al cargar la URL `/catalog` solo se descarga el chunk de CatalogPage y los chunks compartidos, sin incluir AdminDashboard o CourseEditor.
- [ ] **QA-2:** Comprobar que al simular red lenta (3G) y navegar a una página nueva, el skeleton de carga específico se muestra correctamente durante la descarga del chunk y desaparece cuando el contenido está listo.
- [ ] **QA-3:** Validar que el prefetch on hover funciona: al posar el cursor sobre "Dashboard" en el sidebar y luego hacer clic, la navegación es instantánea (sin skeleton visible) porque el chunk ya se descargó durante el hover.

## Tareas

| ID | Tarea | Estimación | Prioridad |
|----|-------|-----------|-----------|
| T-FE-119 | Refactorizar `router.tsx` para usar `React.lazy` en todas las páginas de nivel superior con Suspense boundaries agrupados | 0.5h | Alta |
| T-FE-120 | Crear componentes skeleton específicos para cada página: `DashboardSkeleton`, `CatalogSkeleton`, `LearningPageSkeleton`, `ProfileSkeleton`, `CourseEditorSkeleton` | 1h | Alta |
| T-FE-121 | Implementar custom hook `usePrefetch` para precarga de chunks al hacer hover con debounce de 200ms | 0.5h | Alta |
| T-FE-122 | Integrar `usePrefetch` en los enlaces de navegación del sidebar y header | 0.5h | Media |
| T-FE-123 | Configurar `vite-plugin-visualizer` y generar reporte de análisis de bundles | 0.5h | Media |

## Notas Técnicas
- Estructura del lazy loading en el router:
  ```typescript
  const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
  const CatalogPage = lazy(() => import('@/pages/catalog/CatalogPage'));
  // ... resto de páginas

  // En las rutas:
  <Route path="/admin" element={
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminDashboard />
    </Suspense>
  } />
  ```
- El hook `usePrefetch` debe devolver handlers para `onMouseEnter` y `onMouseLeave` que inicien/cancelen un timeout de 200ms para la precarga.
- Los skeletons deben usar el componente `Skeleton` de shadcn/ui con dimensiones que aproximen el layout real de cada página. No necesitan ser pixel-perfect, sino comunicar la estructura general.
- Para el análisis de bundles, instalar `rollup-plugin-visualizer` (compatible con Vite 6) y configurar en `vite.config.ts`:
  ```typescript
  plugins: [visualizer({ open: true, gzipSize: true })]
  ```
- Considerar agregar `webpackChunkName` equivalente en Vite usando el comentario mágico `/* @vite-ignore */` o nombrar los chunks en `build.rollupOptions.output.manualChunks` para nombres descriptivos en el análisis.
- No aplicar lazy loading a componentes pequeños o que se usen en casi todas las páginas (como el Header o Sidebar), ya que el overhead del chunk separado no justifica la ganancia.

## Dependencias
- **Depende de:** Todas las páginas deben existir como componentes exportables: HU-FE-011 (AdminDashboard), HU-FE-012/013 (CourseEditor), HU-FE-015 (CatalogPage), HU-FE-017/018 (LearningPage), HU-FE-020 (Layout con navegación para prefetch)
- **Bloquea a:** Ninguna historia directamente; es una optimización transversal que mejora la experiencia de todas las páginas
