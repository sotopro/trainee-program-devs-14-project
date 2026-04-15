# HU-FE-007: Rutas Protegidas y Guards de Rol

## Descripcion
Como administrador del sistema, quiero que las rutas de administracion solo sean accesibles para usuarios con rol ADMIN, y como usuario, quiero que las rutas protegidas requieran autenticacion para mantener la seguridad de la plataforma.

Las rutas protegidas son un componente fundamental de seguridad en el frontend de LearnPath. Se deben implementar dos niveles de proteccion: primero, un componente `ProtectedRoute` que verifica si el usuario esta autenticado antes de permitir el acceso a cualquier ruta privada; segundo, un componente `RoleGuard` que adicionalmente verifica que el usuario tenga el rol necesario (ADMIN o USER) para acceder a secciones especificas. Si un usuario no autenticado intenta acceder a una ruta protegida, debe ser redirigido al formulario de login con la URL original guardada para redireccion posterior. Si un usuario autenticado intenta acceder a una ruta para la cual no tiene el rol adecuado, debe ser redirigido a una pagina de "No Autorizado" (403). Estos guards se integran directamente con el sistema de rutas de React Router 7 y consumen el auth store de Zustand para verificar el estado de autenticacion y el rol del usuario.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El componente `ProtectedRoute` verifica si el usuario esta autenticado consultando el auth store de Zustand; si no lo esta, redirige a `/login`.
- [ ] **AC-2:** Al redirigir a `/login`, la URL original se guarda como parametro `?redirect=/ruta-original` para que el usuario pueda volver despues de autenticarse.
- [ ] **AC-3:** El componente `RoleGuard` recibe un prop `allowedRoles` y verifica que el rol del usuario este incluido; si no, redirige a `/unauthorized`.
- [ ] **AC-4:** Existe una pagina `/unauthorized` (403) con un mensaje claro y un boton para volver al inicio.
- [ ] **AC-5:** Las rutas de administracion (`/admin/*`) estan protegidas tanto por `ProtectedRoute` como por `RoleGuard` con rol `ADMIN`.
- [ ] **AC-6:** Las rutas de usuario (`/catalog`, `/courses/*`, `/learning-paths/*`) estan protegidas solo por `ProtectedRoute`.

### Tecnicos
- [ ] **AC-T1:** Los componentes `ProtectedRoute` y `RoleGuard` se implementan como wrapper components que renderizan un `<Outlet />` o sus `children` si la verificacion es exitosa.
- [ ] **AC-T2:** Los guards usan los selectores del auth store (`useIsAuthenticated`, `useAuthUser`) para evitar re-renders innecesarios.
- [ ] **AC-T3:** La configuracion de rutas en el router usa layout routes anidadas para aplicar los guards de forma declarativa.
- [ ] **AC-T4:** Los guards manejan el estado de carga durante la rehidratacion del store (muestran un spinner mientras se verifica la sesion).

### QA
- [ ] **QA-1:** Un usuario no autenticado que intenta acceder a `/catalog` es redirigido a `/login?redirect=/catalog`, y despues de autenticarse, vuelve a `/catalog`.
- [ ] **QA-2:** Un usuario con rol USER que intenta acceder a `/admin/dashboard` es redirigido a `/unauthorized`.
- [ ] **QA-3:** Un usuario con rol ADMIN puede acceder tanto a rutas de usuario como a rutas de administracion sin restricciones.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-046 | Crear componente `ProtectedRoute` con verificacion de autenticacion y redireccion | 0.5h | Alta |
| T-FE-047 | Crear componente `RoleGuard` con verificacion de rol y redireccion | 0.5h | Alta |
| T-FE-048 | Crear pagina `UnauthorizedPage` (403) con diseno y boton de retorno | 0.25h | Media |
| T-FE-049 | Integrar guards en la configuracion del router con layout routes anidadas | 0.5h | Alta |
| T-FE-050 | Implementar logica de redireccion con parametro `?redirect=` | 0.25h | Alta |
| T-FE-051 | Implementar estado de carga durante la rehidratacion del auth store | 0.25h | Media |
| T-FE-052 | Escribir tests para ProtectedRoute y RoleGuard con diferentes escenarios | 0.75h | Media |

## Notas Tecnicas
- Estructura del router con guards:
  ```typescript
  const router = createBrowserRouter([
    { path: '/login', element: <LoginPage /> },
    { path: '/register', element: <RegisterPage /> },
    { path: '/unauthorized', element: <UnauthorizedPage /> },
    {
      element: <ProtectedRoute />,
      children: [
        { path: '/catalog', element: <CatalogPage /> },
        { path: '/courses/:id', element: <CoursePage /> },
        {
          element: <RoleGuard allowedRoles={['ADMIN']} />,
          children: [
            { path: '/admin/dashboard', element: <AdminDashboardPage /> },
            { path: '/admin/courses', element: <AdminCoursesPage /> },
          ],
        },
      ],
    },
  ]);
  ```
- El componente `ProtectedRoute` basico:
  ```typescript
  const ProtectedRoute = () => {
    const isAuthenticated = useIsAuthenticated();
    const location = useLocation();

    if (!isAuthenticated) {
      return <Navigate to={`/login?redirect=${location.pathname}`} replace />;
    }

    return <Outlet />;
  };
  ```
- Para el manejo de rehidratacion, verificar si Zustand ya termino de cargar desde localStorage antes de redirigir. Se puede usar un estado `isHydrated` en el store.
- Los guards deben ser componentes puros sin efectos secundarios mas alla de la redireccion.

## Dependencias
- **Depende de:** HU-FE-006 (Auth Store con Zustand)
- **Bloquea a:** Todas las historias de features que requieran rutas protegidas
