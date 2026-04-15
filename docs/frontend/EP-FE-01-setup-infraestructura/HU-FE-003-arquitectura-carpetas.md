# HU-FE-003: Arquitectura Base de Carpetas

## Descripcion
Como equipo de desarrollo, queremos definir y crear una arquitectura de carpetas basada en feature-based vertical slices para que el proyecto sea escalable, mantenible y cada desarrollador sepa donde colocar su codigo.

La arquitectura de carpetas es una decision critica que impacta directamente la productividad del equipo y la mantenibilidad del proyecto LearnPath a largo plazo. Se adoptara un enfoque de vertical slices donde cada feature (auth, courses, learning-paths, content-editor, quizzes, ai, admin) tiene su propia carpeta autocontenida con componentes, hooks, servicios y tipos. Los elementos compartidos entre features se ubican en la carpeta `shared/`, organizada por tipo (components, hooks, lib, providers, store). Las paginas de nivel superior se mantienen en `pages/` y la configuracion general en `config/`. Esta estructura permite que multiples desarrolladores trabajen en features distintas con minimo conflicto, facilita code reviews al tener contexto agrupado, y prepara el proyecto para posible migracion a micro-frontends en el futuro.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador (Lead) | Carlos Vasquez |
| Desarrollador | Equipo Completo |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #16:** Arquitectura de Carpetas — Se aplica directamente la estrategia de organizacion por features (vertical slices) en lugar de organizacion por tipo de archivo. Cada feature encapsula sus propios componentes, hooks, servicios y tipos, promoviendo cohesion y reduciendo acoplamiento entre modulos.

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** Existe la carpeta `src/app/` con los archivos de entrada de la aplicacion (`App.tsx`, `main.tsx`, `router.tsx`).
- [ ] **AC-2:** Existe la carpeta `src/features/` con subcarpetas para cada feature: `auth`, `courses`, `learning-paths`, `content-editor`, `quizzes`, `ai`, `admin`.
- [ ] **AC-3:** Cada subcarpeta de feature contiene la estructura interna: `components/`, `hooks/`, `services/`, `types/`, `utils/` y un archivo `index.ts` para re-exportaciones.
- [ ] **AC-4:** Existe la carpeta `src/shared/` con subcarpetas: `components/ui`, `components/layout`, `components/feedback`, `components/hoc`, `hooks/`, `lib/`, `providers/`, `store/`.
- [ ] **AC-5:** Existe la carpeta `src/pages/` con archivos placeholder para las paginas principales de la aplicacion.
- [ ] **AC-6:** Existe la carpeta `src/config/` con el modulo de configuracion de entorno y constantes de la aplicacion.

### Tecnicos
- [ ] **AC-T1:** Cada carpeta de feature tiene un archivo `index.ts` que actua como barrel export, exponiendo solo la API publica del modulo.
- [ ] **AC-T2:** Los alias de TypeScript estan configurados para las carpetas principales: `@/features/*`, `@/shared/*`, `@/pages/*`, `@/config/*`, `@/app/*`.
- [ ] **AC-T3:** Existe un archivo `README.md` dentro de `src/` que documenta la estructura de carpetas y las convenciones de nombrado.
- [ ] **AC-T4:** Las importaciones entre features estan prohibidas directamente; la comunicacion entre features debe pasar por `shared/` o por el estado global en `store/`.

### QA
- [ ] **QA-1:** La estructura de carpetas coincide con el diagrama documentado y no hay carpetas vacias sin al menos un archivo `.gitkeep` o placeholder.
- [ ] **QA-2:** Los alias de importacion funcionan correctamente; un import como `import { Button } from '@/shared/components/ui'` resuelve sin errores.
- [ ] **QA-3:** El proyecto compila y ejecuta correctamente despues de aplicar la estructura de carpetas.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-017 | Crear estructura de carpetas `src/app/` con archivos base | 0.25h | Alta |
| T-FE-018 | Crear estructura `src/features/` con las 7 subcarpetas de features y su estructura interna | 0.5h | Alta |
| T-FE-019 | Crear estructura `src/shared/` con subcarpetas de componentes, hooks, lib, providers y store | 0.25h | Alta |
| T-FE-020 | Crear estructura `src/pages/` con paginas placeholder | 0.25h | Media |
| T-FE-021 | Crear `src/config/` y mover configuracion de entorno | 0.15h | Media |
| T-FE-022 | Configurar barrel exports (`index.ts`) en cada feature y carpeta compartida | 0.25h | Alta |
| T-FE-023 | Documentar la estructura de carpetas y convenciones en README interno | 0.35h | Media |

## Notas Tecnicas
- Estructura objetivo:
  ```
  src/
  ├── app/              # Entrada de la app, providers globales, router
  ├── features/         # Features verticales
  │   ├── auth/         # Autenticacion
  │   ├── courses/      # Gestion de cursos
  │   ├── learning-paths/ # Rutas de aprendizaje
  │   ├── content-editor/ # Editor de contenido (Editor.js)
  │   ├── quizzes/      # Evaluaciones
  │   ├── ai/           # Chat con IA (GPT-4o-mini)
  │   └── admin/        # Panel de administracion
  ├── shared/           # Codigo compartido entre features
  │   ├── components/
  │   │   ├── ui/       # Componentes shadcn/ui
  │   │   ├── layout/   # Header, Sidebar, Footer, etc.
  │   │   ├── feedback/ # Toast, Spinner, Skeleton, etc.
  │   │   └── hoc/      # Higher-Order Components
  │   ├── hooks/        # Hooks compartidos
  │   ├── lib/          # Utilidades (axios instance, formatters)
  │   ├── providers/    # Context providers globales
  │   └── store/        # Stores de Zustand compartidos
  ├── pages/            # Componentes de pagina (conectan con router)
  └── config/           # Configuracion, constantes, env
  ```
- Cada feature sigue la estructura interna:
  ```
  features/auth/
  ├── components/       # Componentes especificos del feature
  ├── hooks/            # Hooks especificos del feature
  ├── services/         # Llamadas API del feature
  ├── types/            # Interfaces y tipos del feature
  ├── utils/            # Utilidades del feature
  └── index.ts          # Barrel export
  ```
- Regla estricta: un feature NUNCA importa directamente de otro feature. Si se necesita compartir, se mueve a `shared/`.
- Considerar agregar una regla ESLint personalizada (o usar `eslint-plugin-import`) para prevenir importaciones cruzadas entre features.

## Dependencias
- **Depende de:** HU-FE-001
- **Bloquea a:** HU-FE-004, HU-FE-005, HU-FE-006, HU-FE-007, HU-FE-008, HU-FE-009, HU-FE-010
