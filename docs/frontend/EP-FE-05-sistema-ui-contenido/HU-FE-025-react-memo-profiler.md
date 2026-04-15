# HU-FE-025: Optimización con React.memo y Profiler

## Descripción
Como desarrollador, quiero optimizar los componentes de la plataforma que sufren re-renders innecesarios para poder garantizar una experiencia de usuario fluida y educar al equipo sobre cuándo la memoización aporta valor real y cuándo es prematura.

Esta historia de usuario aplica técnicas de optimización de rendimiento en LearnPath utilizando `React.memo` y React DevTools Profiler. Se envuelven los componentes `CourseCard` y `LessonView` con `React.memo` para evitar re-renders cuando sus props no cambian. Para `CourseCard`, se implementa una función de comparación personalizada que solo considera cambios en `id`, `title` y `enrollmentCount` (ignorando callbacks u objetos reference-instables). Se crea un componente utilitario `ProfilerWrapper` que registra los tiempos de renderizado en desarrollo, facilitando la identificación de cuellos de botella. El trabajo incluye una sesión de profiling con React DevTools Profiler para identificar el punto de mayor impacto en el `CourseList` (antes y después de la optimización), documentando los hallazgos: cuándo `React.memo` genera mejoras medibles y cuándo constituye optimización prematura que añade complejidad sin beneficio.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Joshua Rodriguez |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #4:** React.memo & Profiler — Se aplica `React.memo` con función de comparación personalizada para evitar re-renders innecesarios en componentes de lista. Se utiliza el Profiler API de React para medir tiempos de renderizado y documentar el impacto real de las optimizaciones, diferenciando mejoras genuinas de optimización prematura.

## Criterios de Aceptación

### Funcionales
- [ ] **AC-1:** El componente `CourseCard` envuelto en `React.memo` no se re-renderiza cuando el componente padre se actualiza pero las props relevantes de la tarjeta (id, title, enrollmentCount) no han cambiado, verificable mediante React DevTools Profiler.
- [ ] **AC-2:** El componente `LessonView` envuelto en `React.memo` no se re-renderiza cuando el usuario interactúa con elementos del sidebar u otros componentes que no afectan el contenido de la lección actual.
- [ ] **AC-3:** El `ProfilerWrapper` registra en la consola del navegador (solo en desarrollo) el nombre del componente, la fase del render (mount/update), el tiempo de render actual y los renders acumulados, con formato legible y coloreado.
- [ ] **AC-4:** Se genera un documento de hallazgos que incluye capturas del Profiler mostrando el antes/después de la optimización del `CourseList`, con métricas de tiempos de render y análisis de cuándo memo es beneficioso vs innecesario.
- [ ] **AC-5:** La función de comparación personalizada de `CourseCard` permite que el componente se re-renderice cuando cambian datos visuales (id, title, description, thumbnail, enrollmentCount) pero no cuando cambian references de callbacks que son funcionalmente idénticos.

### Técnicos
- [ ] **AC-T1:** `CourseCard` se envuelve con `React.memo(CourseCard, arePropsEqual)` donde `arePropsEqual` compara: `prevProps.id === nextProps.id && prevProps.title === nextProps.title && prevProps.enrollmentCount === nextProps.enrollmentCount && prevProps.thumbnail === nextProps.thumbnail`.
- [ ] **AC-T2:** `LessonView` se envuelve con `React.memo(LessonView)` usando la comparación shallow por defecto, ya que sus props son primitivas o referencias estables provenientes de React Query.
- [ ] **AC-T3:** El `ProfilerWrapper` utiliza el Profiler API de React (`<Profiler id={name} onRender={callback}>`) y registra los datos con `console.group` coloreado, activándose solo cuando `process.env.NODE_ENV === 'development'`.
- [ ] **AC-T4:** Se documenta en comentarios del código los casos donde `React.memo` NO se aplica y por qué: componentes que reciben children (memo no puede comparar children eficientemente), componentes con props que cambian siempre (ej. objetos inline), y componentes que se renderizan raramente.

### QA
- [ ] **QA-1:** Verificar con React DevTools Profiler que al actualizar el estado de búsqueda en el catálogo, los `CourseCard` que no cambian de props no se re-renderizan (aparecen grises en el flamegraph del Profiler).
- [ ] **QA-2:** Comprobar que el `ProfilerWrapper` solo produce logs en desarrollo y que en producción no genera ningún output ni overhead de rendimiento.
- [ ] **QA-3:** Validar que las optimizaciones no introducen bugs: al cambiar el enrollmentCount de un curso vía asignación, el `CourseCard` correspondiente SÍ se re-renderiza reflejando el nuevo conteo.

## Tareas

| ID | Tarea | Estimación | Prioridad |
|----|-------|-----------|-----------|
| T-FE-124 | Envolver `CourseCard` con `React.memo` y función de comparación personalizada `arePropsEqual` | 0.5h | Alta |
| T-FE-125 | Envolver `LessonView` con `React.memo` con comparación shallow por defecto | 0.5h | Alta |
| T-FE-126 | Crear componente `ProfilerWrapper` con Profiler API y logging condicional en desarrollo | 0.5h | Alta |
| T-FE-127 | Realizar sesión de profiling del `CourseList` antes y después de las optimizaciones, capturar métricas | 0.5h | Media |
| T-FE-128 | Documentar hallazgos: cuándo memo ayuda, cuándo es prematura, métricas medidas, y anti-patrones identificados como comentarios en código | 1h | Media |

## Notas Técnicas
- Función de comparación personalizada para `CourseCard`:
  ```typescript
  const arePropsEqual = (prevProps: CourseCardProps, nextProps: CourseCardProps): boolean => {
    return (
      prevProps.id === nextProps.id &&
      prevProps.title === nextProps.title &&
      prevProps.description === nextProps.description &&
      prevProps.thumbnail === nextProps.thumbnail &&
      prevProps.enrollmentCount === nextProps.enrollmentCount &&
      prevProps.moduleCount === nextProps.moduleCount
    );
    // Nota: NO comparamos onClick u otros callbacks porque son funcionalmente
    // equivalentes aunque cambien de referencia. Si esto causa problemas,
    // el componente padre debe estabilizar las callbacks con useCallback.
  };
  ```
- El `ProfilerWrapper` estructura:
  ```typescript
  const ProfilerWrapper = ({ id, children }) => {
    if (process.env.NODE_ENV !== 'development') return <>{children}</>;
    return (
      <Profiler id={id} onRender={(id, phase, actualDuration) => {
        console.groupCollapsed(`%c[Profiler] ${id}`, 'color: #6366f1');
        console.log(`Phase: ${phase}, Duration: ${actualDuration.toFixed(2)}ms`);
        console.groupEnd();
      }}>
        {children}
      </Profiler>
    );
  };
  ```
- Casos donde NO aplicar `React.memo` (documentar en el código):
  1. Componentes que reciben `children` como prop (la referencia de children cambia siempre).
  2. Componentes que reciben objetos o arrays creados inline (`style={{ ... }}`).
  3. Componentes que se renderizan solo una vez o muy raramente.
  4. Componentes cuyo costo de render es menor que el costo de la comparación de memo.
- El profiling debe realizarse con datos realistas: usar al menos 50 CourseCards en la lista para que la diferencia sea medible.
- React DevTools Profiler setting: activar "Highlight updates when components render" para visualizar re-renders en tiempo real durante el testing.

## Dependencias
- **Depende de:** HU-FE-015 (componente CourseCard y CatalogPage con CourseList), HU-FE-017 (componente LessonView)
- **Bloquea a:** Ninguna historia directamente; es una optimización que mejora la experiencia de usuario en páginas con muchos componentes renderizados
