# HU-FE-010: Error Boundaries

## Descripcion
Como usuario de la plataforma, quiero que cuando ocurra un error inesperado en la aplicacion, se me muestre un mensaje amigable con la opcion de reintentar en lugar de una pantalla en blanco, para poder continuar usando LearnPath sin perder mi progreso.

Los Error Boundaries son un mecanismo esencial de resiliencia en aplicaciones React. En LearnPath, se implementan en dos niveles: un `GlobalErrorBoundary` que envuelve toda la aplicacion y captura errores no manejados que de otra forma causarian una pantalla en blanco, y un `SectionErrorBoundary` que envuelve secciones individuales de features para que un error en una seccion (como el editor de contenido) no afecte al resto de la aplicacion (como la navegacion o el sidebar). Ambos utilizan el componente `ErrorFallback` que ofrece diferentes variantes de presentacion segun el contexto: pagina completa para errores globales, inline para secciones, y card para widgets. Adicionalmente, los error boundaries se integran con el sistema de notificaciones (NotificationProvider) para mostrar toasts informativos cuando se captura un error, permitiendo al equipo de desarrollo recibir informacion de depuracion mientras el usuario ve un mensaje amigable. Esta implementacion sigue las mejores practicas de React para manejo de errores y garantiza que la experiencia del usuario sea robusta incluso ante fallos inesperados.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #14:** Error Boundaries — Esta historia implementa directamente el patron de Error Boundaries de React. Se exploran los conceptos de `componentDidCatch` y `getDerivedStateFromError` en componentes de clase (ya que los Error Boundaries solo pueden implementarse como class components), la estrategia de error boundaries anidados para granularidad de recuperacion, y la integracion con sistemas de logging y notificaciones. Tambien se demuestra como crear un wrapper funcional para facilitar su uso con la API moderna de React.

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El `GlobalErrorBoundary` envuelve toda la aplicacion y, ante un error no capturado, muestra una pagina de error amigable con el mensaje "Algo salio mal" y un boton "Reintentar" que recarga la seccion.
- [ ] **AC-2:** El `SectionErrorBoundary` envuelve features individuales y, ante un error, muestra un mensaje de error inline sin afectar al resto de la aplicacion (navegacion, sidebar, etc. siguen funcionando).
- [ ] **AC-3:** El componente `ErrorFallback` tiene tres variantes: `full-page` (pagina completa con ilustracion), `inline` (banner dentro de la seccion), `card` (tarjeta compacta para widgets).
- [ ] **AC-4:** El boton "Reintentar" en el ErrorFallback resetea el error boundary y vuelve a intentar renderizar el componente hijo.
- [ ] **AC-5:** Cuando se captura un error, se muestra un toast de notificacion con informacion resumida del error usando el NotificationProvider.
- [ ] **AC-6:** En modo desarrollo (`DEBUG=true`), el ErrorFallback muestra informacion tecnica adicional (stack trace, component stack) para facilitar la depuracion.

### Tecnicos
- [ ] **AC-T1:** El `GlobalErrorBoundary` y `SectionErrorBoundary` estan implementados como class components (requisito de React para error boundaries) con `componentDidCatch` y `getDerivedStateFromError`.
- [ ] **AC-T2:** Se provee un wrapper funcional `withErrorBoundary(Component, fallbackVariant)` para facilitar el uso con componentes funcionales.
- [ ] **AC-T3:** Los error boundaries registran errores en consola con informacion completa del componente que fallo (componentStack) para depuracion.
- [ ] **AC-T4:** El `ErrorFallback` es un componente funcional puro que recibe `error`, `resetErrorBoundary` y `variant` como props.

### QA
- [ ] **QA-1:** Forzar un error en un componente dentro de un `SectionErrorBoundary` y verificar que el resto de la aplicacion sigue funcionando normalmente.
- [ ] **QA-2:** Forzar un error global y verificar que el `GlobalErrorBoundary` muestra la pagina de error con el boton de reintentar funcional.
- [ ] **QA-3:** En modo desarrollo, verificar que el ErrorFallback muestra el stack trace completo y la informacion del component stack.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-066 | Crear componente `ErrorFallback` con variantes full-page, inline y card | 0.5h | Alta |
| T-FE-067 | Crear class component `GlobalErrorBoundary` con captura de errores global | 0.5h | Alta |
| T-FE-068 | Crear class component `SectionErrorBoundary` con captura de errores por seccion | 0.5h | Alta |
| T-FE-069 | Crear HOC `withErrorBoundary` como wrapper funcional para los error boundaries | 0.25h | Media |
| T-FE-070 | Integrar error boundaries con NotificationProvider para mostrar toasts de error | 0.25h | Media |
| T-FE-071 | Integrar `GlobalErrorBoundary` en el punto de entrada de la aplicacion (`App.tsx`) | 0.25h | Alta |
| T-FE-072 | Envolver features principales con `SectionErrorBoundary` en la configuracion del router | 0.25h | Media |
| T-FE-073 | Escribir tests unitarios para los error boundaries y el ErrorFallback | 0.5h | Media |

## Notas Tecnicas
- Implementacion base del GlobalErrorBoundary:
  ```typescript
  interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
  }

  class GlobalErrorBoundary extends React.Component<
    { children: React.ReactNode },
    ErrorBoundaryState
  > {
    state: ErrorBoundaryState = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
      return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      console.error('GlobalErrorBoundary caught:', error, errorInfo.componentStack);
      // Aqui se podria enviar a un servicio de logging
    }

    handleReset = () => {
      this.setState({ hasError: false, error: null });
    };

    render() {
      if (this.state.hasError) {
        return (
          <ErrorFallback
            error={this.state.error}
            resetErrorBoundary={this.handleReset}
            variant="full-page"
          />
        );
      }
      return this.props.children;
    }
  }
  ```
- El `ErrorFallback` con variantes:
  ```typescript
  interface ErrorFallbackProps {
    error: Error | null;
    resetErrorBoundary: () => void;
    variant: 'full-page' | 'inline' | 'card';
  }

  const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetErrorBoundary, variant }) => {
    const isDebug = env.DEBUG;

    // Renderizar segun la variante
    switch (variant) {
      case 'full-page':
        return (/* Pagina completa con ilustracion y boton */);
      case 'inline':
        return (/* Banner inline con mensaje y boton */);
      case 'card':
        return (/* Tarjeta compacta con mensaje y boton */);
    }
  };
  ```
- Los error boundaries se ubican en `src/shared/components/feedback/` para el ErrorFallback y en `src/shared/providers/` para los boundaries.
- En produccion, considerar integrar con un servicio como Sentry para reporting automatico de errores.
- Los Error Boundaries NO capturan errores en: event handlers (usar try/catch), codigo asincrono (usar .catch()), server-side rendering, o errores dentro del propio boundary. Documentar estas limitaciones.
- Para el toast de notificacion, el error boundary puede usar un callback o un ref al NotificationProvider. Otra opcion es emitir un evento personalizado que el provider escuche.

## Dependencias
- **Depende de:** HU-FE-001, HU-FE-003
- **Bloquea a:** Todas las historias de features (se recomienda tener error boundaries antes de implementar features complejas)
