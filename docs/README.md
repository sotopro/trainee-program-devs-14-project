# LearnPath - Plataforma de Aprendizaje con IA

## Descripcion del Proyecto

**LearnPath** es un MVP de una plataforma de aprendizaje potenciada por Inteligencia Artificial. Su objetivo principal es permitir que un administrador cree cursos completos mediante una interfaz conversacional con IA (GPT-4o-mini), mientras que los usuarios finales pueden inscribirse, seguir rutas de aprendizaje personalizadas y bifurcar (fork/branch) dichas rutas para adaptarlas a sus necesidades individuales.

La plataforma combina la generacion automatizada de contenido educativo con una experiencia de aprendizaje interactiva que incluye lecciones, quizzes y seguimiento de progreso. El sistema de recomendaciones basado en IA guia a los usuarios hacia los contenidos mas relevantes segun su avance y preferencias.

Este proyecto se desarrolla como parte del Programa de Trainees de Fractal, con un equipo de 5 desarrolladores junior part-time y 1 QA, en un sprint de 2 semanas.

---

## Stack Tecnico

| Capa | Tecnologia | Version | Proposito |
|------|------------|---------|-----------|
| **Frontend - Framework** | React | 19 | Biblioteca UI principal |
| **Frontend - Bundler** | Vite | 6 | Build tool y dev server |
| **Frontend - Estilos** | TailwindCSS | v4 | Utilidades CSS |
| **Frontend - Componentes** | shadcn/ui | latest | Componentes UI reutilizables |
| **Frontend - Estado Global** | Zustand | 5 | Gestion de estado ligera |
| **Frontend - Estado Servidor** | TanStack Query | 5 | Cache y sincronizacion de datos del servidor |
| **Frontend - Formularios** | React Hook Form + Zod | latest | Formularios y validacion |
| **Frontend - Editor** | Editor.js | latest | Editor de contenido de bloques |
| **Backend - Runtime** | Node.js | LTS | Entorno de ejecucion |
| **Backend - Framework** | Express | 5 | Framework HTTP |
| **Backend - ORM** | Prisma | 6 | ORM y migraciones |
| **Backend - Base de Datos** | Prisma Postgres | — | Base de datos relacional gestionada |
| **Backend - IA** | OpenAI API (GPT-4o-mini) | latest | Generacion de contenido y recomendaciones |
| **Testing** | Vitest + React Testing Library | latest | Pruebas unitarias e integracion |

---

## Equipo

| Nombre | Rol | Area de Responsabilidad | Epicas Asignadas |
|--------|-----|------------------------|------------------|
| Carlos Vasquez | Desarrollador FE+BE | Auth e Infraestructura | EP-FE-02, EP-BE-02 |
| Edgar Chacon | Desarrollador FE+BE | Gestion de Cursos / Admin | EP-FE-03, EP-BE-03, EP-BE-05 |
| Jazir Olivera | Desarrollador FE+BE | Experiencia de Aprendizaje / User | EP-FE-04, EP-BE-04 |
| Joshua Rodriguez | Desarrollador FE only | Sistema UI y Contenido | EP-FE-05 |
| Piero Aguilar | Desarrollador FE+BE | IA y Recomendaciones | EP-FE-06, EP-BE-05, EP-BE-06 |
| Daniel Soto | QA | Testing y Calidad | EP-FE-07, EP-BE-07 |

> **Nota:** Las epicas de Setup (EP-FE-01, EP-BE-01) y Testing (EP-FE-07, EP-BE-07) son tareas conjuntas de todo el equipo.

---

## Sprint Plan (2 Semanas)

### Semana 1 — Fundamentos y Funcionalidad Core

| Dia | Lunes | Martes | Miercoles | Jueves | Viernes |
|-----|-------|--------|-----------|--------|---------|
| **Foco** | Setup proyecto, scaffolding, CI | Auth FE+BE, esquema DB | CRUD Cursos, Layout UI | Learning Paths, Editor.js | Integracion IA basica |
| **Epicas activas** | EP-FE-01, EP-BE-01 | EP-FE-02, EP-BE-02 | EP-FE-03, EP-BE-03, EP-FE-05 | EP-FE-04, EP-BE-04, EP-FE-05 | EP-FE-06, EP-BE-06 |

### Semana 2 — Integracion, IA y Calidad

| Dia | Lunes | Martes | Miercoles | Jueves | Viernes |
|-----|-------|--------|-----------|--------|---------|
| **Foco** | Quizzes, recomendaciones IA | Fork paths, optimistic updates | Testing unitario y de integracion | Bug fixing, QA final | Demo, deploy, retrospectiva |
| **Epicas activas** | EP-BE-05, EP-FE-06 | EP-FE-04, EP-BE-04 | EP-FE-07, EP-BE-07 | Todas (bug fixing) | Cierre |

### Milestones

- **S1-Viernes:** Auth completo, CRUD cursos funcional, layout base, primera integracion IA.
- **S2-Miercoles:** Todas las features implementadas, inicio de testing formal.
- **S2-Viernes:** MVP estable, demo lista, documentacion completa.

---

## Estructura de Epicas

### Frontend

| ID | Epica | Responsable | Stories | Temas React |
|----|-------|-------------|---------|-------------|
| [EP-FE-01](./frontend/EP-FE-01-setup-infraestructura/README.md) | Setup e Infraestructura Frontend | Todos (5 devs) | HU-FE-001 a HU-FE-003 | 16 |
| [EP-FE-02](./frontend/EP-FE-02-autenticacion/README.md) | Autenticacion y Autorizacion | Carlos Vasquez | HU-FE-004 a HU-FE-010 | 7, 8, 11, 14 |
| [EP-FE-03](./frontend/EP-FE-03-panel-administracion/README.md) | Panel de Administracion | Edgar Chacon | HU-FE-011 a HU-FE-014 | 3, 9, 13 |
| [EP-FE-04](./frontend/EP-FE-04-experiencia-aprendizaje/README.md) | Experiencia de Aprendizaje | Jazir Olivera | HU-FE-015 a HU-FE-019 | 2, 6, 10 |
| [EP-FE-05](./frontend/EP-FE-05-sistema-ui-contenido/README.md) | Sistema UI y Contenido | Joshua Rodriguez | HU-FE-020 a HU-FE-025 | 1, 4, 5, 12 |
| [EP-FE-06](./frontend/EP-FE-06-ia-recomendaciones/README.md) | IA y Recomendaciones | Piero Aguilar | HU-FE-026 a HU-FE-028 | 2 |
| [EP-FE-07](./frontend/EP-FE-07-testing/README.md) | Testing Frontend | Todos + Daniel Soto (QA) | HU-FE-029 a HU-FE-033 | 15 |

### Backend

| ID | Epica | Responsable | Stories |
|----|-------|-------------|---------|
| [EP-BE-01](./backend/EP-BE-01-setup-infraestructura/README.md) | Setup e Infraestructura Backend | Todos (5 devs) | HU-BE-001 a HU-BE-003 |
| [EP-BE-02](./backend/EP-BE-02-autenticacion/README.md) | Autenticacion Backend | Carlos Vasquez | HU-BE-004 a HU-BE-007 |
| [EP-BE-03](./backend/EP-BE-03-gestion-cursos/README.md) | Gestion de Cursos Backend | Edgar Chacon | HU-BE-008 a HU-BE-011 |
| [EP-BE-04](./backend/EP-BE-04-learning-paths/README.md) | Learning Paths y Enrollment | Jazir Olivera | HU-BE-012 a HU-BE-015 |
| [EP-BE-05](./backend/EP-BE-05-quizzes/README.md) | Quizzes Backend | Edgar Chacon + Piero Aguilar | HU-BE-016 a HU-BE-017 |
| [EP-BE-06](./backend/EP-BE-06-ia-openai/README.md) | IA / OpenAI Backend | Piero Aguilar | HU-BE-018 a HU-BE-023 |
| [EP-BE-07](./backend/EP-BE-07-testing/README.md) | Testing Backend | Todos + Daniel Soto (QA) | HU-BE-024 a HU-BE-027 |

---

## Mapeo de Temas React

La siguiente tabla muestra como cada uno de los 16 temas de React se integra en las epicas y stories del proyecto:

| # | Tema React | Descripcion | Epica(s) | Story(ies) de Referencia |
|---|-----------|-------------|----------|--------------------------|
| 1 | **Composicion de Componentes** | Patrones de composicion, children, slots, compound components | EP-FE-05 | HU-FE-020, HU-FE-021 |
| 2 | **Efectos y Ciclo de Vida** | useEffect, cleanup, sincronizacion con APIs externas | EP-FE-04, EP-FE-06 | HU-FE-015, HU-FE-019, HU-FE-026 |
| 3 | **Manejo de Estado Complejo** | useReducer, patrones de estado para formularios y dashboards | EP-FE-03 | HU-FE-011, HU-FE-012 |
| 4 | **Context API y Providers** | ThemeProvider, NotificationProvider, contextos globales | EP-FE-05 | HU-FE-022, HU-FE-023 |
| 5 | **Code Splitting y Lazy Loading** | React.lazy, Suspense, carga dinamica de rutas y componentes | EP-FE-05 | HU-FE-024 |
| 6 | **Comunicacion entre Componentes** | Props drilling avoidance, event callbacks, lifting state | EP-FE-04 | HU-FE-016, HU-FE-017 |
| 7 | **Custom Hooks** | Hooks reutilizables: useAuth, useForm, useFetch | EP-FE-02 | HU-FE-004, HU-FE-005 |
| 8 | **Estado Global con Zustand** | Stores de autenticacion, configuracion, notificaciones | EP-FE-02 | HU-FE-006, HU-FE-007 |
| 9 | **Formularios Avanzados** | React Hook Form + Zod, validacion en tiempo real, errores | EP-FE-03 | HU-FE-013, HU-FE-014 |
| 10 | **Data Fetching con TanStack Query** | Queries, mutations, cache, invalidacion, optimistic updates | EP-FE-04 | HU-FE-015, HU-FE-018, HU-FE-019 |
| 11 | **Rutas Protegidas y Navegacion** | React Router, guards, redirects, rutas basadas en roles | EP-FE-02 | HU-FE-008, HU-FE-009 |
| 12 | **Optimizacion de Rendimiento** | React.memo, useMemo, useCallback, React Profiler | EP-FE-05 | HU-FE-025 |
| 13 | **Patrones HOC y Render Props** | Higher-Order Components para autorizacion y layout | EP-FE-03 | HU-FE-011 |
| 14 | **Error Boundaries** | Manejo de errores en arbol de componentes, fallback UI | EP-FE-02 | HU-FE-010 |
| 15 | **Testing de Componentes** | Vitest + RTL, unit tests, integration tests, mocking | EP-FE-07 | HU-FE-029 a HU-FE-033 |
| 16 | **Arquitectura y Scaffolding** | Estructura de carpetas, configuracion de herramientas | EP-FE-01 | HU-FE-001 a HU-FE-003 |

---

## Arquitectura de Carpetas

```
learnpath/
├── client/                          # Frontend React
│   ├── public/
│   ├── src/
│   │   ├── app/                     # Configuracion de la app (providers, router)
│   │   ├── assets/                  # Imagenes, fuentes, iconos
│   │   ├── components/
│   │   │   ├── ui/                  # Componentes shadcn/ui
│   │   │   ├── layout/             # Header, Sidebar, Footer, MainLayout
│   │   │   ├── auth/               # LoginForm, RegisterForm, ProtectedRoute
│   │   │   ├── courses/            # CourseCard, CourseList, CourseDetail
│   │   │   ├── admin/              # AdminDashboard, CourseEditor, ModuleManager
│   │   │   ├── learning/           # LessonView, PathVisualization, ProgressBar
│   │   │   ├── ai/                 # AIChatPanel, RecommendationCard
│   │   │   └── common/             # ErrorBoundary, LoadingSpinner, EmptyState
│   │   ├── hooks/                   # Custom hooks (useAuth, useCourses, useAI...)
│   │   ├── stores/                  # Zustand stores (authStore, uiStore...)
│   │   ├── services/                # API service layer (axios/fetch wrappers)
│   │   ├── lib/                     # Utilidades, helpers, constantes
│   │   ├── types/                   # TypeScript types e interfaces
│   │   ├── pages/                   # Paginas/rutas principales
│   │   │   ├── auth/               # LoginPage, RegisterPage
│   │   │   ├── admin/              # AdminDashboardPage, CourseManagementPage
│   │   │   ├── courses/            # CatalogPage, CourseDetailPage
│   │   │   ├── learning/           # LessonPage, PathPage
│   │   │   └── home/               # HomePage, LandingPage
│   │   ├── __tests__/              # Tests unitarios e integracion
│   │   └── main.tsx                # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── server/                          # Backend Node + Express
│   ├── src/
│   │   ├── config/                  # Variables de entorno, configuracion DB
│   │   ├── controllers/             # Controladores HTTP
│   │   │   ├── auth.controller.ts
│   │   │   ├── course.controller.ts
│   │   │   ├── lesson.controller.ts
│   │   │   ├── path.controller.ts
│   │   │   ├── quiz.controller.ts
│   │   │   └── ai.controller.ts
│   │   ├── middleware/              # Auth middleware, error handler, validation
│   │   ├── routes/                  # Definicion de rutas Express
│   │   ├── services/               # Logica de negocio
│   │   │   ├── auth.service.ts
│   │   │   ├── course.service.ts
│   │   │   ├── path.service.ts
│   │   │   ├── quiz.service.ts
│   │   │   └── openai.service.ts
│   │   ├── prisma/
│   │   │   ├── schema.prisma       # Esquema de base de datos
│   │   │   └── seed.ts             # Datos semilla
│   │   ├── utils/                   # Helpers, constantes, tipos
│   │   ├── types/                   # TypeScript types
│   │   ├── __tests__/              # Tests unitarios e integracion
│   │   └── server.ts               # Entry point del servidor
│   ├── tsconfig.json
│   └── package.json
│
├── docs/                            # Documentacion del proyecto
│   ├── README.md                    # Este archivo
│   ├── frontend/                    # Epicas frontend
│   │   ├── EP-FE-01-setup-infraestructura/
│   │   ├── EP-FE-02-autenticacion/
│   │   ├── EP-FE-03-panel-administracion/
│   │   ├── EP-FE-04-experiencia-aprendizaje/
│   │   ├── EP-FE-05-sistema-ui-contenido/
│   │   ├── EP-FE-06-ia-recomendaciones/
│   │   └── EP-FE-07-testing/
│   └── backend/                     # Epicas backend
│       ├── EP-BE-01-setup-infraestructura/
│       ├── EP-BE-02-autenticacion/
│       ├── EP-BE-03-gestion-cursos/
│       ├── EP-BE-04-learning-paths/
│       ├── EP-BE-05-quizzes/
│       ├── EP-BE-06-ia-openai/
│       └── EP-BE-07-testing/
│
├── .env.example
├── .gitignore
├── docker-compose.yml               # (Opcional) Para entorno local
└── README.md                        # README raiz del repositorio
```

---

## Enlaces Rapidos

- [EP-FE-01: Setup e Infraestructura Frontend](./frontend/EP-FE-01-setup-infraestructura/README.md)
- [EP-FE-02: Autenticacion y Autorizacion](./frontend/EP-FE-02-autenticacion/README.md)
- [EP-FE-03: Panel de Administracion](./frontend/EP-FE-03-panel-administracion/README.md)
- [EP-FE-04: Experiencia de Aprendizaje](./frontend/EP-FE-04-experiencia-aprendizaje/README.md)
- [EP-FE-05: Sistema UI y Contenido](./frontend/EP-FE-05-sistema-ui-contenido/README.md)
- [EP-FE-06: IA y Recomendaciones](./frontend/EP-FE-06-ia-recomendaciones/README.md)
- [EP-FE-07: Testing Frontend](./frontend/EP-FE-07-testing/README.md)
- [EP-BE-01: Setup e Infraestructura Backend](./backend/EP-BE-01-setup-infraestructura/README.md)
- [EP-BE-02: Autenticacion Backend](./backend/EP-BE-02-autenticacion/README.md)
- [EP-BE-03: Gestion de Cursos Backend](./backend/EP-BE-03-gestion-cursos/README.md)
- [EP-BE-04: Learning Paths y Enrollment](./backend/EP-BE-04-learning-paths/README.md)
- [EP-BE-05: Quizzes Backend](./backend/EP-BE-05-quizzes/README.md)
- [EP-BE-06: IA / OpenAI Backend](./backend/EP-BE-06-ia-openai/README.md)
- [EP-BE-07: Testing Backend](./backend/EP-BE-07-testing/README.md)
