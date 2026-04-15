# HU-FE-008: HOCs withAuth y withRole

## Descripcion
Como desarrollador, quiero contar con Higher-Order Components (HOCs) reutilizables para autenticacion y autorizacion para proteger componentes individuales de forma declarativa sin duplicar logica de verificacion.

Los HOCs de autenticacion y autorizacion complementan el sistema de rutas protegidas ofreciendo una forma alternativa y mas granular de proteger componentes individuales. Mientras que `ProtectedRoute` y `RoleGuard` operan a nivel de ruta, los HOCs `withAuth` y `withRole` permiten proteger cualquier componente en cualquier punto del arbol de componentes. Esto es especialmente util para proteger componentes que se renderizan condicionalmente dentro de una pagina, como botones de administracion en una vista compartida, o secciones de configuracion avanzada. Adicionalmente, se implementa el componente `<RenderIfRole>` que utiliza el patron de render props para renderizar contenido condicionalmente basado en el rol del usuario, ofreciendo una API mas declarativa para casos simples de renderizado condicional. Estos patrones son fundamentales en el aprendizaje de React y demuestran como los HOCs y render props resuelven problemas transversales de forma elegante.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #11:** HOCs y Render Props — Esta historia implementa directamente ambos patrones avanzados de React. Los HOCs `withAuth` y `withRole` demuestran como envolver componentes para inyectar logica transversal de autenticacion/autorizacion. El componente `<RenderIfRole>` demuestra el patron de render props para renderizado condicional basado en el rol. Se exploran las ventajas de cada patron, su composicion y como se comparan con hooks personalizados.

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El HOC `withAuth(Component)` envuelve un componente y solo lo renderiza si el usuario esta autenticado; de lo contrario, redirige a `/login`.
- [ ] **AC-2:** El HOC `withRole('ADMIN')(Component)` envuelve un componente y solo lo renderiza si el usuario tiene el rol especificado; de lo contrario, muestra un mensaje de no autorizado o redirige.
- [ ] **AC-3:** El componente `<RenderIfRole role="ADMIN">` renderiza su contenido hijo solo si el usuario autenticado tiene el rol ADMIN.
- [ ] **AC-4:** `<RenderIfRole>` acepta un prop opcional `fallback` que se renderiza cuando el usuario no tiene el rol requerido.
- [ ] **AC-5:** Los HOCs preservan las props del componente original y las pasan correctamente al componente envuelto.
- [ ] **AC-6:** Los HOCs funcionan correctamente con componentes de clase y componentes funcionales.

### Tecnicos
- [ ] **AC-T1:** Los HOCs estan tipados correctamente con genericos de TypeScript para preservar las props del componente envuelto.
- [ ] **AC-T2:** `withAuth` y `withRole` usan los selectores del auth store de Zustand internamente para verificar el estado.
- [ ] **AC-T3:** Los HOCs usan `React.forwardRef` para pasar refs correctamente al componente envuelto.
- [ ] **AC-T4:** Los HOCs asignan un `displayName` descriptivo (ej: `withAuth(ComponentName)`) para facilitar la depuracion en React DevTools.

### QA
- [ ] **QA-1:** Un componente envuelto con `withAuth` no se renderiza y redirige a login cuando el usuario no esta autenticado.
- [ ] **QA-2:** Un componente envuelto con `withRole('ADMIN')` se renderiza correctamente cuando el usuario tiene rol ADMIN y muestra fallback cuando tiene rol USER.
- [ ] **QA-3:** `<RenderIfRole role="ADMIN">{children}</RenderIfRole>` muestra los children solo para administradores y no renderiza nada (o el fallback) para usuarios regulares.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-053 | Crear HOC `withAuth` con verificacion de autenticacion y tipado generico | 0.5h | Alta |
| T-FE-054 | Crear HOC `withRole` con verificacion de rol, soporte para multiples roles y tipado generico | 0.5h | Alta |
| T-FE-055 | Crear componente `RenderIfRole` con patron render props y prop `fallback` | 0.5h | Alta |
| T-FE-056 | Implementar `forwardRef` y `displayName` en ambos HOCs | 0.25h | Media |
| T-FE-057 | Crear ejemplos de uso documentados en Storybook o archivo de ejemplo | 0.5h | Media |
| T-FE-058 | Escribir tests unitarios para withAuth, withRole y RenderIfRole | 0.75h | Media |

## Notas Tecnicas
- Implementacion de `withAuth`:
  ```typescript
  function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
    const WithAuthComponent = React.forwardRef<unknown, P>((props, ref) => {
      const isAuthenticated = useIsAuthenticated();

      if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
      }

      return <WrappedComponent {...props} ref={ref} />;
    });

    WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
    return WithAuthComponent;
  }
  ```
- Implementacion de `withRole`:
  ```typescript
  function withRole(...roles: Array<'ADMIN' | 'USER'>) {
    return function <P extends object>(WrappedComponent: React.ComponentType<P>) {
      const WithRoleComponent = React.forwardRef<unknown, P>((props, ref) => {
        const user = useAuthUser();

        if (!user || !roles.includes(user.role)) {
          return <Navigate to="/unauthorized" replace />;
        }

        return <WrappedComponent {...props} ref={ref} />;
      });

      WithRoleComponent.displayName = `withRole(${roles.join(',')})(${WrappedComponent.displayName || WrappedComponent.name})`;
      return WithRoleComponent;
    };
  }
  ```
- Implementacion de `RenderIfRole`:
  ```typescript
  interface RenderIfRoleProps {
    role: 'ADMIN' | 'USER';
    children: React.ReactNode;
    fallback?: React.ReactNode;
  }

  const RenderIfRole: React.FC<RenderIfRoleProps> = ({ role, children, fallback = null }) => {
    const user = useAuthUser();
    return user?.role === role ? <>{children}</> : <>{fallback}</>;
  };
  ```
- Estos HOCs se ubican en `src/shared/components/hoc/` y se re-exportan desde el barrel export.
- Usar `withAuth` para paginas completas cuando no se usan layout routes, y `RenderIfRole` para secciones dentro de una pagina compartida (ej: boton "Administrar" visible solo para admins).

## Dependencias
- **Depende de:** HU-FE-006 (Auth Store con Zustand)
- **Bloquea a:** Componentes de admin que requieran proteccion granular
