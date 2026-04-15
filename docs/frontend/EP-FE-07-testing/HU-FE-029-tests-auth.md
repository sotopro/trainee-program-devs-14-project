# HU-FE-029: Tests de Autenticacion

## Descripcion
Como equipo de desarrollo, quiero contar con una suite completa de tests unitarios e integracion para el modulo de autenticacion, para garantizar que los flujos de login, registro y proteccion de rutas funcionan correctamente y detectar regresiones ante cambios futuros.

La suite de tests de autenticacion cubre dos niveles: tests unitarios para las piezas individuales (acciones del auth store de Zustand como `login`, `logout` y `refreshSession`, y schemas de validacion Zod como `loginSchema` y `registerSchema`), y tests de integracion para los flujos completos de usuario (componente `LoginForm` con llenado de campos, envio y redireccion; componente `RegisterForm` con validaciones y registro exitoso; componente `ProtectedRoute` que redirige si el usuario no esta autenticado; y el HOC `withAuth` que envuelve componentes protegidos). Las llamadas a la API se mockean usando MSW (Mock Service Worker) o `vi.mock` de Vitest para aislar los tests del backend. Todos los tests se ejecutan con Vitest y React Testing Library (RTL), siguiendo la filosofia de testear el comportamiento del usuario, no los detalles de implementacion.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #15:** Testing (Vitest/RTL) — Esta historia aplica directamente las practicas de testing con Vitest y React Testing Library para el modulo de autenticacion, cubriendo tests unitarios de stores y schemas, y tests de integracion de componentes con interaccion de usuario simulada.

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** Existen tests unitarios para cada accion del auth store de Zustand: `login()` almacena tokens y datos de usuario, `logout()` limpia el estado y localStorage, `refreshSession()` actualiza los tokens.
- [ ] **AC-2:** Existen tests unitarios para los schemas Zod: `loginSchema` valida correctamente emails y contrasenas, `registerSchema` valida nombre, email, contrasena y confirmacion de contrasena.
- [ ] **AC-3:** Existe un test de integracion para `LoginForm` que simula el llenado de campos, el envio del formulario y verifica la redireccion tras un login exitoso.
- [ ] **AC-4:** Existe un test de integracion para `RegisterForm` que verifica el flujo completo de registro incluyendo validaciones de campos y manejo de errores.
- [ ] **AC-5:** Existe un test de integracion para `ProtectedRoute` que verifica la redireccion a `/login` cuando el usuario no esta autenticado.
- [ ] **AC-6:** Existe un test de integracion para el HOC `withAuth` que verifica que el componente envuelto solo se renderiza si el usuario esta autenticado.

### Tecnicos
- [ ] **AC-T1:** Los tests usan `vi.mock` o MSW para mockear las llamadas a la API de autenticacion, sin realizar peticiones HTTP reales.
- [ ] **AC-T2:** Los tests de integracion usan `render()` de RTL con los providers necesarios (QueryClientProvider, BrowserRouter) configurados en un wrapper de test reutilizable.
- [ ] **AC-T3:** Los tests de componentes usan `userEvent` de `@testing-library/user-event` para simular interacciones realisticas (click, type, tab) en lugar de `fireEvent`.
- [ ] **AC-T4:** Todos los tests pasan de forma consistente sin depender del orden de ejecucion (aislamiento completo entre tests).

### QA
- [ ] **QA-1:** La cobertura de tests del modulo de autenticacion (`src/modules/auth/`) alcanza al menos 80% en lineas y ramas.
- [ ] **QA-2:** Los tests se ejecutan en menos de 10 segundos para el modulo completo de autenticacion.
- [ ] **QA-3:** Al introducir un bug intencional (por ejemplo, cambiar la ruta de redireccion post-login), al menos un test falla, demostrando la efectividad de la suite.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-199 | Crear wrapper de test reutilizable con providers (QueryClient, Router, AuthStore) | 0.5h | Alta |
| T-FE-200 | Escribir tests unitarios para las acciones del auth store (login, logout, refreshSession) | 0.5h | Alta |
| T-FE-201 | Escribir tests unitarios para schemas Zod (loginSchema, registerSchema) | 0.5h | Alta |
| T-FE-202 | Configurar mocks de API con MSW o vi.mock para endpoints de autenticacion | 0.5h | Alta |
| T-FE-203 | Escribir tests de integracion para LoginForm (llenado, envio, redireccion, errores) | 1h | Alta |
| T-FE-204 | Escribir tests de integracion para RegisterForm (validaciones, registro exitoso) | 0.5h | Media |
| T-FE-205 | Escribir tests de integracion para ProtectedRoute y withAuth HOC | 0.5h | Media |

## Notas Tecnicas
- Configurar un wrapper de test reutilizable:
  ```typescript
  function renderWithProviders(ui: React.ReactElement) {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return render(ui, {
      wrapper: ({ children }) => (
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>{children}</BrowserRouter>
        </QueryClientProvider>
      ),
    });
  }
  ```
- Para testear el auth store de Zustand, usar `act()` para envolver las actualizaciones de estado y `useStore.getState()` para verificar el estado resultante.
- Los mocks de MSW deben configurarse en `src/test/mocks/handlers.ts` para reutilizarse en toda la suite de tests.
- Para testear redirecciones, verificar el cambio de ubicacion con `window.location.pathname` o usar `MemoryRouter` con `initialEntries`.
- Limpiar el estado de Zustand y localStorage en el `beforeEach` de cada archivo de test para garantizar aislamiento.

## Dependencias
- **Depende de:** HU-FE-004 (LoginForm), HU-FE-005 (RegisterForm), HU-FE-006 (Auth Store), HU-FE-007 (ProtectedRoute)
- **Bloquea a:** Ninguna
