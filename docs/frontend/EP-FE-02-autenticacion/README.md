# EP-FE-02: Autenticacion y Autorizacion Frontend

## Descripcion

Esta epica abarca todo el sistema de autenticacion y autorizacion del lado del cliente en LearnPath. Incluye la implementacion de formularios de login y registro con validacion robusta, la gestion del estado de autenticacion mediante un store de Zustand dedicado, y el manejo completo del ciclo de vida de sesion del usuario (login, persistencia, refresh de tokens y logout).

Un componente critico de esta epica es el sistema de rutas protegidas basado en roles (admin vs. usuario regular). Se implementaran Higher-Order Components (HOCs) y guards de navegacion que aseguren que solo los usuarios autorizados accedan a las secciones correspondientes de la plataforma. El panel de administracion solo sera accesible para administradores, mientras que las rutas de aprendizaje estaran disponibles para usuarios autenticados.

Ademas, se implementa un sistema de Error Boundaries para manejar errores de autenticacion y sesion expirada de forma elegante, mostrando UIs de fallback apropiadas en lugar de pantallas en blanco. Se crearan custom hooks reutilizables (`useAuth`, `useUser`, `usePermissions`) que encapsularan la logica de autenticacion para ser consumidos por otros componentes del sistema.

## Responsable(s)

| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| QA | Daniel Soto |

## Temas React Asociados

| # | Tema | Descripcion Breve |
|---|------|-------------------|
| 7 | Custom Hooks | Creacion de `useAuth`, `useUser`, `usePermissions` para encapsular logica de autenticacion reutilizable |
| 8 | Estado Global con Zustand | Implementacion de `authStore` para manejar token JWT, datos de usuario y estado de sesion |
| 11 | Rutas Protegidas y Navegacion | React Router con guards, redirects condicionales y rutas basadas en roles (admin/user) |
| 14 | Error Boundaries | Manejo de errores de autenticacion, sesion expirada y fallback UI para errores inesperados |

## Historias de Usuario

| ID | Titulo | Prioridad | Semana |
|----|--------|-----------|--------|
| HU-FE-004 | Implementar hook `useAuth` para gestion de autenticacion | Alta | S1 |
| HU-FE-005 | Implementar hook `useUser` y `usePermissions` | Alta | S1 |
| HU-FE-006 | Crear `authStore` con Zustand para estado de sesion | Alta | S1 |
| HU-FE-007 | Persistencia de sesion y refresh automatico de tokens | Alta | S1 |
| HU-FE-008 | Formulario de Login con validacion | Alta | S1 |
| HU-FE-009 | Formulario de Registro con validacion | Alta | S1 |
| HU-FE-010 | Rutas protegidas, HOC de autorizacion y Error Boundaries | Alta | S1 |

### Detalle de Historias

#### HU-FE-004: Implementar hook `useAuth` para gestion de autenticacion

**Como** desarrollador, **quiero** un custom hook `useAuth` que encapsule toda la logica de autenticacion (login, logout, verificacion de sesion), **para** poder reutilizar esta logica en cualquier componente sin duplicar codigo.

**Criterios de Aceptacion:**
- El hook expone funciones: `login(credentials)`, `logout()`, `checkSession()`.
- El hook retorna estados: `isAuthenticated`, `isLoading`, `error`.
- Las funciones de login/logout actualizan el `authStore` de Zustand.
- El hook maneja errores de red y respuestas de error del servidor.
- Se incluyen tipos TypeScript completos para los parametros y retornos.

#### HU-FE-005: Implementar hook `useUser` y `usePermissions`

**Como** desarrollador, **quiero** hooks `useUser` y `usePermissions` que expongan los datos del usuario actual y sus permisos, **para** poder condicionar la UI basandome en el rol del usuario.

**Criterios de Aceptacion:**
- `useUser` retorna los datos del usuario autenticado desde el store.
- `usePermissions` expone funciones como `isAdmin()`, `canManageCourses()`, `canEnroll()`.
- Los hooks se suscriben al `authStore` y se actualizan reactivamente.
- Se incluyen tipos para `User`, `UserRole` y `Permissions`.

#### HU-FE-006: Crear `authStore` con Zustand para estado de sesion

**Como** desarrollador, **quiero** un store de Zustand dedicado para la autenticacion que centralice el estado de sesion (token, usuario, rol), **para** tener una unica fuente de verdad para el estado de autenticacion.

**Criterios de Aceptacion:**
- El store almacena: `token`, `refreshToken`, `user`, `isAuthenticated`, `isLoading`.
- Se implementan actions: `setAuth`, `clearAuth`, `updateUser`, `setLoading`.
- El store usa middleware de `persist` para almacenamiento en `localStorage`.
- El store es tipado completamente con TypeScript.
- Se implementa selector pattern para evitar re-renders innecesarios.

#### HU-FE-007: Persistencia de sesion y refresh automatico de tokens

**Como** usuario, **quiero** que mi sesion persista al recargar la pagina y que los tokens se renueven automaticamente, **para** no tener que iniciar sesion cada vez que vuelvo a la plataforma.

**Criterios de Aceptacion:**
- Al cargar la app, se verifica si hay un token valido en `localStorage`.
- Si el token esta proximo a expirar, se hace refresh automatico.
- Si el refresh token ha expirado, se redirige al login.
- Se implementa un interceptor en el servicio HTTP para renovar tokens en peticiones 401.
- Se muestra un estado de carga mientras se verifica la sesion.

#### HU-FE-008: Formulario de Login con validacion

**Como** usuario, **quiero** un formulario de inicio de sesion con validacion en tiempo real, **para** poder acceder a la plataforma de forma segura y con retroalimentacion inmediata sobre errores.

**Criterios de Aceptacion:**
- Campos: email (validacion de formato), password (minimo 6 caracteres).
- Validacion en tiempo real con mensajes de error descriptivos.
- Boton de submit deshabilitado mientras el formulario es invalido.
- Estado de carga visible durante la peticion al servidor.
- Manejo de errores del servidor (credenciales invalidas, servidor no disponible).
- Redirect al dashboard correspondiente tras login exitoso (admin -> /admin, user -> /courses).

#### HU-FE-009: Formulario de Registro con validacion

**Como** nuevo usuario, **quiero** un formulario de registro con validacion completa, **para** poder crear mi cuenta en la plataforma de forma sencilla.

**Criterios de Aceptacion:**
- Campos: nombre, email, password, confirmar password.
- Validacion con Zod: email valido, password minimo 8 caracteres con al menos una mayuscula y un numero, passwords coinciden.
- Mensajes de error claros y especificos por campo.
- Manejo de errores del servidor (email ya registrado, etc.).
- Redirect al login o auto-login tras registro exitoso.

#### HU-FE-010: Rutas protegidas, HOC de autorizacion y Error Boundaries

**Como** administrador del sistema, **quiero** que las rutas esten protegidas por roles y que los errores se manejen de forma elegante, **para** que solo los usuarios autorizados accedan a cada seccion y los errores no rompan la aplicacion.

**Criterios de Aceptacion:**
- Componente `ProtectedRoute` que verifica autenticacion antes de renderizar children.
- HOC `withAdminAccess` que restringe componentes solo a administradores.
- HOC `withAuth` generico que acepta roles permitidos como parametro.
- Redirect a `/login` para usuarios no autenticados.
- Redirect a `/unauthorized` para usuarios sin permisos.
- `AuthErrorBoundary` que captura errores de autenticacion y muestra UI de fallback.
- `AppErrorBoundary` generico en el root de la aplicacion.

## Dependencias

- **Depende de:** EP-FE-01 (Setup e Infraestructura Frontend), EP-BE-02 (Autenticacion Backend).
- **Bloquea a:** EP-FE-03 (Panel de Administracion), EP-FE-04 (Experiencia de Aprendizaje), EP-FE-06 (IA y Recomendaciones).

## Definition of Done

- [ ] Custom hooks `useAuth`, `useUser` y `usePermissions` implementados y tipados.
- [ ] `authStore` de Zustand funcional con persistencia en localStorage.
- [ ] Formularios de login y registro con validacion completa (Zod).
- [ ] Persistencia de sesion y refresh automatico de tokens implementados.
- [ ] Rutas protegidas funcionando con restriccion por roles.
- [ ] HOCs de autorizacion (`withAuth`, `withAdminAccess`) implementados.
- [ ] Error Boundaries para autenticacion y errores generales.
- [ ] Interceptor HTTP para manejo automatico de tokens 401.
- [ ] Todos los componentes y hooks con tipos TypeScript completos.
- [ ] Flujos de login, registro, logout y sesion expirada probados end-to-end.
