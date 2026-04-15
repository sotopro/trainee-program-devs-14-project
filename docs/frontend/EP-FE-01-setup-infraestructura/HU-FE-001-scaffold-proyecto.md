# HU-FE-001: Scaffold del Proyecto React + Vite

## Descripcion
Como equipo de desarrollo, queremos inicializar el proyecto frontend con React 19 + Vite 6 + TypeScript y configurar todas las dependencias base para tener un entorno de desarrollo estandarizado y listo para implementar funcionalidades.

El scaffold del proyecto es el primer paso fundamental para el desarrollo del MVP de LearnPath. Se debe crear un proyecto limpio con Vite 6 como bundler, React 19 como libreria de UI y TypeScript como lenguaje principal. Adicionalmente, se deben instalar y configurar todas las herramientas del stack tecnologico definido: TailwindCSS v4 para estilos utilitarios, shadcn/ui como sistema de componentes, Zustand 5 para estado global, TanStack Query 5 para manejo de datos del servidor, React Router 7 para navegacion, React Hook Form 7 + Zod 3 para formularios y validaciones, Vitest + React Testing Library para testing, y ESLint + Prettier para calidad de codigo. Este scaffold servira como base para todos los epicos posteriores y debe garantizar que cualquier miembro del equipo pueda clonar el repositorio y comenzar a trabajar inmediatamente.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador (Lead) | Carlos Vasquez |
| Desarrollador | Equipo Completo |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El proyecto se inicializa correctamente con `npm create vite@latest` usando el template `react-ts` con React 19 y Vite 6.
- [ ] **AC-2:** TailwindCSS v4 esta instalado y funcionando; un componente de prueba renderiza clases utilitarias correctamente.
- [ ] **AC-3:** shadcn/ui esta configurado e inicializado; al menos un componente (Button) se puede importar y renderizar sin errores.
- [ ] **AC-4:** Zustand 5, TanStack Query 5 y React Router 7 estan instalados y sus providers/configuraciones base estan creados.
- [ ] **AC-5:** React Hook Form 7 + Zod 3 estan instalados y un formulario de ejemplo valida correctamente con un schema Zod.
- [ ] **AC-6:** Vitest + React Testing Library estan configurados y un test de ejemplo (`App.test.tsx`) pasa exitosamente con `npm run test`.

### Tecnicos
- [ ] **AC-T1:** El archivo `tsconfig.json` tiene configuracion estricta (`strict: true`) y alias de paths configurados (`@/` apuntando a `src/`).
- [ ] **AC-T2:** ESLint esta configurado con reglas para TypeScript y React, y Prettier esta integrado para formateo automatico; `npm run lint` ejecuta sin errores.
- [ ] **AC-T3:** El archivo `vite.config.ts` incluye configuracion de alias, plugins de React y configuracion de Vitest.
- [ ] **AC-T4:** El `package.json` contiene scripts para: `dev`, `build`, `preview`, `test`, `lint` y `format`.

### QA
- [ ] **QA-1:** Al ejecutar `npm install && npm run dev`, el proyecto levanta sin errores y muestra la pagina de inicio en el navegador.
- [ ] **QA-2:** Al ejecutar `npm run build`, la compilacion de produccion termina exitosamente sin advertencias criticas.
- [ ] **QA-3:** Al ejecutar `npm run test`, todos los tests de ejemplo pasan correctamente.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-001 | Inicializar proyecto con `npm create vite@latest` (React 19 + TS) | 0.5h | Alta |
| T-FE-002 | Instalar y configurar TailwindCSS v4 | 0.5h | Alta |
| T-FE-003 | Instalar e inicializar shadcn/ui con componentes base | 0.5h | Alta |
| T-FE-004 | Instalar y configurar Zustand 5 con store de ejemplo | 0.25h | Alta |
| T-FE-005 | Instalar y configurar TanStack Query 5 con QueryClientProvider | 0.25h | Alta |
| T-FE-006 | Instalar y configurar React Router 7 con rutas base | 0.5h | Alta |
| T-FE-007 | Instalar y configurar React Hook Form 7 + Zod 3 | 0.25h | Media |
| T-FE-008 | Instalar y configurar Vitest + React Testing Library con test de ejemplo | 0.5h | Alta |
| T-FE-009 | Instalar y configurar ESLint + Prettier con reglas del proyecto | 0.5h | Alta |
| T-FE-010 | Configurar alias de paths en tsconfig y vite.config | 0.25h | Media |

## Notas Tecnicas
- Usar `npm create vite@latest learnpath-frontend -- --template react-ts` para inicializar.
- TailwindCSS v4 utiliza la nueva sintaxis basada en CSS (`@import "tailwindcss"`) en lugar de directivas `@tailwind`.
- Para shadcn/ui, ejecutar `npx shadcn@latest init` y seleccionar el estilo por defecto. Configurar `components.json` con alias `@/components/ui`.
- Zustand 5 no requiere provider; solo crear el store y exportar hooks. Configurar con `devtools` middleware en desarrollo.
- TanStack Query 5 requiere un `QueryClient` y `QueryClientProvider` en el punto de entrada de la app.
- React Router 7 se configura con `createBrowserRouter` y `RouterProvider`.
- Vitest se integra directamente en `vite.config.ts` con `defineConfig` del paquete `vitest/config`.
- Configurar ESLint con `@typescript-eslint/parser` y el plugin de React. Prettier se integra con `eslint-config-prettier`.

## Dependencias
- **Depende de:** Ninguna (es la primera historia del proyecto)
- **Bloquea a:** HU-FE-002, HU-FE-003, HU-FE-004, HU-FE-005, HU-FE-006, HU-FE-007, HU-FE-008, HU-FE-009, HU-FE-010
