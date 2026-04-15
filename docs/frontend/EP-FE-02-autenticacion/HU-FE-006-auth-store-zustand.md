# HU-FE-006: Auth Store con Zustand

## Descripcion
Como desarrollador, quiero un store centralizado de autenticacion con Zustand para manejar el estado de sesion del usuario de forma global, predecible y eficiente en toda la aplicacion.

El auth store es el nucleo del sistema de autenticacion en el frontend de LearnPath. Utilizando Zustand 5 como gestor de estado global, este store centraliza toda la informacion de sesion del usuario: datos del perfil, tokens de acceso y refresco, estado de autenticacion, y acciones para login, logout y refresco de sesion. Zustand fue elegido por su API minimalista, excelente rendimiento gracias a su sistema de selectores que previene re-renders innecesarios, y su middleware de persistencia que permite sincronizar el estado con localStorage de forma declarativa. El store debe implementar el patron de selectores para que los componentes solo se re-rendericen cuando cambian los datos que realmente consumen, optimizando el rendimiento de la aplicacion. Este store sera consumido por los formularios de login/registro, los guards de rutas, los HOCs de autorizacion y cualquier componente que necesite datos del usuario autenticado.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #7:** Zustand (Global State) — Este store es la implementacion principal de estado global con Zustand en el proyecto. Se aplican conceptos clave como creacion de stores con `create()`, uso de middleware (`persist`, `devtools`), patron de selectores para optimizar re-renders, y acciones asincronas para login/logout/refresh. Sirve como referencia arquitectonica para los demas stores del proyecto.

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El store expone las propiedades: `user` (objeto con id, name, email, role), `accessToken`, `refreshToken`, `isAuthenticated` (booleano derivado).
- [ ] **AC-2:** La accion `login(userData)` almacena los tokens y datos del usuario en el store y marca `isAuthenticated` como `true`.
- [ ] **AC-3:** La accion `logout()` limpia todos los datos de sesion del store y de localStorage, y resetea el estado a su valor inicial.
- [ ] **AC-4:** La accion `refreshSession()` utiliza el `refreshToken` para obtener un nuevo `accessToken` del servidor y actualiza el store.
- [ ] **AC-5:** Al acceder a `isAuthenticated`, retorna `true` solo si existe un `accessToken` valido y un objeto `user` no nulo.
- [ ] **AC-6:** Los selectores individuales (`useAuthUser()`, `useIsAuthenticated()`, `useAccessToken()`) permiten a los componentes suscribirse solo a partes especificas del store.

### Tecnicos
- [ ] **AC-T1:** El store usa el middleware `persist` de Zustand para sincronizar automaticamente con localStorage bajo la clave `learnpath-auth`.
- [ ] **AC-T2:** El store usa el middleware `devtools` de Zustand en modo desarrollo para inspeccionar el estado con Redux DevTools.
- [ ] **AC-T3:** Los tipos TypeScript del store estan definidos con interfaces explicitas: `AuthState`, `AuthActions`, `User`.
- [ ] **AC-T4:** Los selectores estan implementados como funciones independientes que usan `useShallow` o selectores simples para evitar re-renders innecesarios.

### QA
- [ ] **QA-1:** Despues de llamar `login()`, el estado en Redux DevTools muestra los datos del usuario y tokens correctamente.
- [ ] **QA-2:** Despues de llamar `logout()`, localStorage no contiene datos de sesion y `isAuthenticated` es `false`.
- [ ] **QA-3:** Al recargar la pagina, el estado se rehidrata desde localStorage y el usuario sigue autenticado si tenia una sesion activa.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-039 | Definir interfaces TypeScript: `User`, `AuthState`, `AuthActions` | 0.25h | Alta |
| T-FE-040 | Crear auth store con `create()` de Zustand incluyendo estado inicial y acciones | 0.75h | Alta |
| T-FE-041 | Configurar middleware `persist` para sincronizacion con localStorage | 0.25h | Alta |
| T-FE-042 | Configurar middleware `devtools` para inspeccion en desarrollo | 0.25h | Media |
| T-FE-043 | Crear selectores optimizados: `useAuthUser`, `useIsAuthenticated`, `useAccessToken` | 0.5h | Alta |
| T-FE-044 | Implementar accion `refreshSession()` con llamada al endpoint de refresh | 0.5h | Alta |
| T-FE-045 | Escribir tests unitarios para el auth store (login, logout, refresh, selectores) | 0.5h | Media |

## Notas Tecnicas
- Estructura del store:
  ```typescript
  interface User {
    id: string;
    name: string;
    email: string;
    role: 'ADMIN' | 'USER';
  }

  interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
  }

  interface AuthActions {
    login: (data: { user: User; accessToken: string; refreshToken: string }) => void;
    logout: () => void;
    refreshSession: () => Promise<void>;
  }
  ```
- Implementacion con middlewares encadenados:
  ```typescript
  const useAuthStore = create<AuthState & AuthActions>()(
    devtools(
      persist(
        (set, get) => ({
          // estado y acciones
        }),
        { name: 'learnpath-auth' }
      )
    )
  );
  ```
- Patron de selectores:
  ```typescript
  export const useAuthUser = () => useAuthStore((state) => state.user);
  export const useIsAuthenticated = () => useAuthStore((state) => !!state.accessToken && !!state.user);
  export const useAccessToken = () => useAuthStore((state) => state.accessToken);
  ```
- Para `refreshSession()`, hacer un POST a `/api/auth/refresh` con el `refreshToken`. Si falla (401), ejecutar `logout()`.
- Considerar usar `partialize` en el middleware `persist` para excluir datos sensibles o temporales de la persistencia si es necesario.

## Dependencias
- **Depende de:** HU-FE-001, HU-FE-003
- **Bloquea a:** HU-FE-004, HU-FE-005, HU-FE-007, HU-FE-008, HU-FE-009
