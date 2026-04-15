# EP-BE-01: Setup e Infraestructura Backend

## Descripcion

Esta epica cubre la configuracion inicial completa del servidor backend de LearnPath. Incluye el scaffolding del proyecto con Node.js, Express 5 y TypeScript, la configuracion de Prisma 6 como ORM con Prisma Postgres como base de datos gestionada, y la definicion del esquema de datos inicial que soportara todas las funcionalidades del MVP.

Express 5 trae mejoras significativas sobre la version 4, incluyendo soporte nativo para async handlers (sin necesidad de wrappers para errores async), mejoras en el router y compatibilidad mejorada con promises. Se aprovecharan estas mejoras para construir un servidor robusto y moderno. La configuracion de TypeScript estricto garantiza seguridad de tipos en todo el backend.

Al igual que la epica de setup frontend, esta es una tarea conjunta donde los 5 desarrolladores participan para asegurar que todos comprendan la arquitectura del servidor, las convenciones de codigo, la estructura de carpetas y el flujo de datos desde las rutas hasta la base de datos. Se establecen las bases de seguridad (CORS, helmet, rate limiting), logging y manejo de errores centralizado.

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

No aplica (epica de backend).

## Historias de Usuario

| ID | Titulo | Prioridad | Semana |
|----|--------|-----------|--------|
| HU-BE-001 | Scaffolding del servidor Express 5 + TypeScript | Alta | S1 |
| HU-BE-002 | Configuracion de Prisma 6 y esquema de base de datos | Alta | S1 |
| HU-BE-003 | Configuracion de variables de entorno, CORS, seguridad y logging | Alta | S1 |

### Detalle de Historias

#### HU-BE-001: Scaffolding del servidor Express 5 + TypeScript

**Como** desarrollador del equipo, **quiero** tener el servidor Express 5 inicializado con TypeScript y la estructura de carpetas definida, **para** poder comenzar a implementar endpoints sobre una arquitectura clara y consistente.

**Criterios de Aceptacion:**
- Proyecto Node.js inicializado con TypeScript estricto (`strict: true`).
- Express 5 instalado y configurado con tipado completo.
- Estructura de carpetas definida: `controllers/`, `services/`, `middleware/`, `routes/`, `config/`, `utils/`, `types/`.
- Endpoint de salud (`GET /api/health`) funcional que retorna status 200.
- Scripts de npm: `dev` (con nodemon/tsx watch), `build`, `start`.
- ESLint y Prettier configurados con reglas para Node.js + TypeScript.
- Manejo de errores centralizado con middleware global de errores.
- Middleware de async error handling aprovechando Express 5 async support.

#### HU-BE-002: Configuracion de Prisma 6 y esquema de base de datos

**Como** desarrollador del equipo, **quiero** Prisma 6 configurado con el esquema de datos completo del MVP, **para** poder interactuar con la base de datos de forma tipada y ejecutar migraciones de forma controlada.

**Criterios de Aceptacion:**
- Prisma 6 instalado y configurado con Prisma Postgres como datasource.
- Esquema de datos definido con los modelos principales:
  - `User` (id, name, email, password, role, createdAt, updatedAt).
  - `Course` (id, title, description, category, difficulty, coverImage, authorId, status, createdAt, updatedAt).
  - `Module` (id, title, description, order, courseId, createdAt).
  - `Lesson` (id, title, content, type, duration, order, moduleId, createdAt).
  - `Enrollment` (id, userId, courseId, status, enrolledAt).
  - `LearningPath` (id, name, description, userId, isForked, originalPathId, createdAt).
  - `LearningPathItem` (id, pathId, lessonId, order, isCompleted).
  - `Progress` (id, userId, lessonId, courseId, completed, completedAt, timeSpent).
  - `Quiz` (id, lessonId, title, questions, createdAt).
  - `QuizAttempt` (id, quizId, userId, answers, score, attemptedAt).
- Relaciones definidas correctamente entre todos los modelos.
- Migracion inicial ejecutada exitosamente.
- Script de seed con datos de ejemplo (admin user, 2-3 cursos de muestra).
- Prisma Client generado y accesible desde los servicios.

#### HU-BE-003: Configuracion de variables de entorno, CORS, seguridad y logging

**Como** desarrollador del equipo, **quiero** la configuracion de seguridad, CORS y logging establecida desde el inicio, **para** tener un servidor seguro y observable desde el dia uno.

**Criterios de Aceptacion:**
- Archivo `.env.example` con todas las variables necesarias: `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `OPENAI_API_KEY`, `PORT`, `CORS_ORIGIN`, `NODE_ENV`.
- Validacion de variables de entorno al iniciar el servidor (falla si faltan variables criticas).
- CORS configurado para permitir solo el origen del frontend.
- Helmet configurado para headers de seguridad HTTP.
- Rate limiting basico configurado (100 requests por minuto por IP).
- Logger configurado (console con formato estructurado o winston/pino).
- Middleware de request logging (method, path, status, response time).
- Documentacion del proceso de setup local en el README.

## Dependencias

- **Depende de:** Ninguna (es la primera epica backend).
- **Bloquea a:** EP-BE-02, EP-BE-03, EP-BE-04, EP-BE-05, EP-BE-06, EP-BE-07 (todas las demas epicas backend).

## Definition of Done

- [ ] Servidor Express 5 + TypeScript compilando y arrancando sin errores.
- [ ] Endpoint de salud (`/api/health`) retornando status 200.
- [ ] Prisma 6 configurado con esquema completo y migracion inicial ejecutada.
- [ ] Prisma Client generado y funcional.
- [ ] Script de seed ejecutable con datos de ejemplo.
- [ ] Variables de entorno validadas al arrancar el servidor.
- [ ] CORS, Helmet y rate limiting configurados.
- [ ] Logger y middleware de request logging funcionales.
- [ ] Estructura de carpetas creada segun la arquitectura definida.
- [ ] ESLint y Prettier configurados sin warnings.
- [ ] Scripts de npm funcionales: dev, build, start.
- [ ] Todos los desarrolladores pueden levantar el servidor y la base de datos localmente.
