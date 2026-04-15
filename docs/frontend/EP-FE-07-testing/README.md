# EP-FE-07: Testing Frontend

## Descripcion

Esta epica establece la estrategia y ejecucion de pruebas automatizadas para todo el frontend de LearnPath. Se utiliza Vitest como test runner (por su integracion nativa con Vite) y React Testing Library (RTL) como herramienta para testear componentes de React siguiendo el enfoque de testing centrado en el usuario (testear comportamiento, no implementacion).

La estrategia de testing cubre tres niveles: pruebas unitarias de hooks y utilidades, pruebas de componentes individuales y pruebas de integracion de flujos completos. Cada desarrollador es responsable de escribir tests para los componentes y hooks que desarrollo en sus epicas respectivas, mientras que Daniel Soto (QA) coordina la estrategia general, define los criterios de cobertura y ejecuta pruebas de integracion transversales.

Se hace especial enfasis en testear los custom hooks (useAuth, useAIChat, etc.) de forma aislada con `renderHook`, los formularios con React Hook Form + Zod verificando validaciones, los componentes que usan TanStack Query con mocking de respuestas del servidor, y los flujos de navegacion con rutas protegidas. El objetivo es alcanzar un minimo de 70% de cobertura en lineas criticas del negocio.

## Responsable(s)

| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| Desarrollador | Edgar Chacon |
| Desarrollador | Jazir Olivera |
| Desarrollador | Joshua Rodriguez |
| Desarrollador | Piero Aguilar |
| QA (Coordinador) | Daniel Soto |

## Temas React Asociados

| # | Tema | Descripcion Breve |
|---|------|-------------------|
| 15 | Testing de Componentes | Vitest + React Testing Library: pruebas unitarias, de integracion, mocking, renderHook para custom hooks |

## Historias de Usuario

| ID | Titulo | Prioridad | Semana |
|----|--------|-----------|--------|
| HU-FE-029 | Configuracion de Vitest + RTL y utilities de testing | Alta | S2 |
| HU-FE-030 | Tests unitarios de custom hooks (useAuth, useAIChat, etc.) | Alta | S2 |
| HU-FE-031 | Tests de componentes de formularios y validacion | Alta | S2 |
| HU-FE-032 | Tests de integracion de flujos de autenticacion y navegacion | Alta | S2 |
| HU-FE-033 | Tests de componentes con TanStack Query (mocking de API) | Media | S2 |

### Detalle de Historias

#### HU-FE-029: Configuracion de Vitest + RTL y utilities de testing

**Como** desarrollador, **quiero** tener Vitest y React Testing Library configurados con utilities compartidas, **para** poder escribir tests de forma rapida y consistente en todo el proyecto.

**Criterios de Aceptacion:**
- Vitest configurado en `vite.config.ts` con entorno `jsdom`.
- React Testing Library instalado con `@testing-library/react` y `@testing-library/user-event`.
- `@testing-library/jest-dom` configurado para matchers extendidos.
- Archivo `test-utils.tsx` con render customizado que incluye providers (QueryClient, Router, Zustand stores).
- Mocks globales para `localStorage`, `fetch`, `window.matchMedia`.
- Scripts de npm: `test`, `test:watch`, `test:coverage`.
- Configuracion de cobertura minima al 70% para archivos en `hooks/`, `stores/` y `components/`.
- `.gitignore` actualizado para excluir carpeta de coverage.

#### HU-FE-030: Tests unitarios de custom hooks (useAuth, useAIChat, etc.)

**Como** desarrollador, **quiero** tests unitarios completos para los custom hooks del proyecto, **para** asegurar que la logica encapsulada en hooks funciona correctamente de forma aislada.

**Criterios de Aceptacion:**
- Tests para `useAuth`: login exitoso, login con error, logout, verificacion de sesion.
- Tests para `useUser` y `usePermissions`: retorno de datos correctos segun rol.
- Tests para `useAIChat`: envio de mensaje, recepcion de respuesta, manejo de error.
- Tests para `useRecommendations`: carga de recomendaciones, descarte, refresh.
- Uso de `renderHook` de React Testing Library para testear hooks.
- Mocking del store de Zustand para aislar la logica del hook.
- Mocking de las llamadas a API para simular respuestas del servidor.
- Verificacion de estados intermedios (loading, error, success).

**Responsable directo:** Cada desarrollador testea los hooks de su epica. Carlos (auth hooks), Piero (AI hooks), Jazir (learning hooks).

#### HU-FE-031: Tests de componentes de formularios y validacion

**Como** QA, **quiero** tests de los formularios de la aplicacion que verifiquen la validacion y el comportamiento del usuario, **para** asegurar que los usuarios reciben feedback correcto y que los datos se envian correctamente.

**Criterios de Aceptacion:**
- Tests para LoginForm: validacion de campos vacios, email invalido, password corto, submit exitoso, error del servidor.
- Tests para RegisterForm: validacion completa con Zod, passwords que no coinciden, email duplicado.
- Tests para CourseForm (admin): campos requeridos, longitudes maximas, tipos de datos.
- Tests usando `userEvent` para simular interacciones reales (typing, clicking, submitting).
- Verificacion de que los mensajes de error se muestran correctamente en el DOM.
- Verificacion de que el submit se llama con los datos correctos.
- Verificacion de estados disabled/loading del boton de submit.

**Responsable directo:** Edgar (formularios admin), Carlos (formularios auth).

#### HU-FE-032: Tests de integracion de flujos de autenticacion y navegacion

**Como** QA, **quiero** tests de integracion que verifiquen flujos completos de usuario (login -> navegacion -> accion), **para** asegurar que las diferentes partes del sistema funcionan correctamente juntas.

**Criterios de Aceptacion:**
- Test de flujo: usuario no autenticado intenta acceder a ruta protegida -> redirect a login -> login exitoso -> redirect a ruta original.
- Test de flujo: usuario regular intenta acceder a ruta admin -> redirect a pagina de no autorizado.
- Test de flujo: registro -> auto-login -> navegacion al dashboard.
- Test de flujo: sesion expirada -> interceptor detecta 401 -> intento de refresh -> refresh exitoso o redirect a login.
- Los tests usan el render customizado con todos los providers.
- Se mockean las respuestas del backend de forma completa.
- Se verifica la navegacion real con React Router testing utilities.

**Responsable directo:** Carlos (auth flows), Daniel Soto (coordinacion y revision).

#### HU-FE-033: Tests de componentes con TanStack Query (mocking de API)

**Como** desarrollador, **quiero** tests de componentes que dependen de TanStack Query con mocking apropiado del servidor, **para** asegurar que los componentes manejan correctamente los estados de carga, exito y error del data fetching.

**Criterios de Aceptacion:**
- Tests para componentes del catalogo de cursos: estado de carga (skeleton), datos cargados, estado vacio, error.
- Tests para componentes de inscripcion: mutation exitosa, mutation con error, optimistic update.
- Tests para componentes de progreso: optimistic update, rollback en error.
- Uso de `QueryClient` con configuracion de test (retry: false, cacheTime: 0).
- Mocking de `fetch` o uso de MSW (Mock Service Worker) para simular respuestas del servidor.
- Verificacion de que el cache de TanStack Query se invalida correctamente.
- Verificacion de que los optimistic updates se aplican y revierten correctamente.

**Responsable directo:** Jazir (componentes de learning), Piero (componentes de IA).

## Dependencias

- **Depende de:** EP-FE-01 (Setup - Vitest debe estar preconfigurado), todas las demas epicas frontend (los componentes y hooks a testear deben existir).
- **Bloquea a:** Ninguna (es la ultima epica del frontend).

## Definition of Done

- [ ] Vitest + RTL configurados y funcionales con utilities compartidas.
- [ ] Archivo `test-utils.tsx` con render customizado incluyendo todos los providers.
- [ ] Tests unitarios de todos los custom hooks principales (minimo 5 hooks).
- [ ] Tests de formularios de login, registro y gestion de cursos.
- [ ] Tests de integracion de flujos de autenticacion y navegacion.
- [ ] Tests de componentes con TanStack Query y mocking de API.
- [ ] Cobertura minima de 70% en archivos criticos (hooks, stores, componentes core).
- [ ] Todos los tests pasan en CI (o script local) sin errores.
- [ ] Scripts de npm configurados: test, test:watch, test:coverage.
- [ ] Reporte de cobertura generado y revisado por QA.
