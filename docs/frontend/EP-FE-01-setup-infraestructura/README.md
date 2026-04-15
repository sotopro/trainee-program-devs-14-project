# EP-FE-01: Setup e Infraestructura Frontend

## Descripcion

Esta epica cubre la configuracion inicial completa del proyecto frontend de LearnPath. Incluye el scaffolding del proyecto con React 19 y Vite 6 como bundler, la configuracion de TailwindCSS v4 para estilos utilitarios, la integracion de shadcn/ui como biblioteca de componentes base, y la instalacion y configuracion de todas las dependencias core del proyecto.

Ademas de las herramientas de desarrollo, esta epica establece la arquitectura de carpetas que seguira todo el equipo, las convenciones de codigo (linting con ESLint, formateo con Prettier), la configuracion de TypeScript estricto, y la integracion de las bibliotecas de estado (Zustand 5) y data fetching (TanStack Query 5). Tambien se configura el manejo de variables de entorno para los distintos ambientes (development, staging, production).

Esta es una tarea conjunta donde los 5 desarrolladores participan, ya que es fundamental que todos comprendan la base sobre la que se construira el resto del proyecto. Cada desarrollador debe ser capaz de levantar el entorno local y entender la estructura del proyecto antes de comenzar con sus epicas individuales.

## Responsable(s)

| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| Desarrollador | Edgar Chacon |
| Desarrollador | Jazir Olivera |
| Desarrollador | Joshua Rodriguez |
| Desarrollador | Piero Aguilar |
| QA | Daniel Soto |

## Temas React Asociados

| # | Tema | Descripcion Breve |
|---|------|-------------------|
| 16 | Arquitectura y Scaffolding | Estructura de carpetas, configuracion de herramientas, convenciones de proyecto y setup inicial de React 19 con Vite 6 |

## Historias de Usuario

| ID | Titulo | Prioridad | Semana |
|----|--------|-----------|--------|
| HU-FE-001 | Scaffolding del proyecto con React 19 + Vite 6 + TypeScript | Alta | S1 |
| HU-FE-002 | Configuracion de TailwindCSS v4, shadcn/ui y sistema de diseno base | Alta | S1 |
| HU-FE-003 | Configuracion de Zustand 5, TanStack Query 5 y variables de entorno | Alta | S1 |

### Detalle de Historias

#### HU-FE-001: Scaffolding del proyecto con React 19 + Vite 6 + TypeScript

**Como** desarrollador del equipo, **quiero** tener el proyecto frontend inicializado con React 19, Vite 6 y TypeScript configurado de forma estricta, **para** poder comenzar a desarrollar funcionalidades sobre una base solida y estandarizada.

**Criterios de Aceptacion:**
- El proyecto se crea con `npm create vite@latest` seleccionando React + TypeScript.
- Se configura `tsconfig.json` con `strict: true` y path aliases (`@/`).
- Se instala y configura ESLint con reglas de React y TypeScript.
- Se configura Prettier con las convenciones del equipo.
- Se crea la estructura de carpetas base (`components/`, `hooks/`, `stores/`, `services/`, `pages/`, `lib/`, `types/`).
- El proyecto compila y se sirve en `localhost` sin errores.

#### HU-FE-002: Configuracion de TailwindCSS v4, shadcn/ui y sistema de diseno base

**Como** desarrollador del equipo, **quiero** tener TailwindCSS v4 y shadcn/ui configurados, **para** poder construir interfaces de forma rapida y consistente usando componentes pre-disenados y utilidades CSS.

**Criterios de Aceptacion:**
- TailwindCSS v4 esta instalado y funcional con la configuracion de CSS moderno.
- shadcn/ui esta inicializado con el tema base del proyecto.
- Se instalan los componentes base de shadcn/ui: Button, Input, Card, Dialog, Dropdown, Toast.
- Se definen los tokens de diseno (colores, tipografia, espaciados) en la configuracion de Tailwind.
- Se crea un componente de ejemplo que use shadcn/ui y Tailwind juntos.

#### HU-FE-003: Configuracion de Zustand 5, TanStack Query 5 y variables de entorno

**Como** desarrollador del equipo, **quiero** tener configurados Zustand para estado global y TanStack Query para data fetching, junto con el manejo de variables de entorno, **para** tener una base solida de gestion de estado y comunicacion con el backend.

**Criterios de Aceptacion:**
- Zustand 5 esta instalado con un store de ejemplo funcional.
- TanStack Query 5 esta configurado con `QueryClientProvider` en el arbol de la app.
- Se configura el `queryClient` con defaults razonables (staleTime, retry, etc.).
- Se crea un archivo `.env.example` con las variables necesarias (`VITE_API_URL`, etc.).
- Se configura el acceso tipado a variables de entorno.
- Se documenta el proceso de setup para nuevos desarrolladores.

## Dependencias

- **Depende de:** Ninguna (es la primera epica).
- **Bloquea a:** EP-FE-02, EP-FE-03, EP-FE-04, EP-FE-05, EP-FE-06, EP-FE-07 (todas las demas epicas frontend).

## Definition of Done

- [ ] Proyecto React 19 + Vite 6 + TypeScript compilando sin errores.
- [ ] TailwindCSS v4 aplicando estilos correctamente.
- [ ] shadcn/ui inicializado con componentes base instalados.
- [ ] Zustand 5 configurado con store de ejemplo funcional.
- [ ] TanStack Query 5 configurado con QueryClientProvider.
- [ ] ESLint y Prettier configurados y sin warnings.
- [ ] Estructura de carpetas creada segun la arquitectura definida.
- [ ] Variables de entorno configuradas y documentadas.
- [ ] README de setup local actualizado.
- [ ] Todos los desarrolladores pueden levantar el proyecto localmente.
