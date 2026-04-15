# EP-BE-07: Testing Backend

## Descripcion

Esta epica establece la estrategia y ejecucion de pruebas automatizadas para todo el backend de LearnPath. Se utiliza Vitest como test runner por su compatibilidad con el ecosistema Node.js moderno y su velocidad de ejecucion. La estrategia de testing cubre pruebas unitarias de servicios y utilidades, asi como pruebas de integracion de endpoints HTTP completos.

Las pruebas unitarias se enfocan en la logica de negocio aislada: calculos de puntaje de quizzes, validaciones Zod, logica de generacion de tokens, calculos de progreso y racha, y la capa de servicio de cada modulo. Se mockean las dependencias externas (Prisma Client, OpenAI API) para aislar la logica bajo prueba.

Las pruebas de integracion verifican flujos completos de request a response, incluyendo middlewares de autenticacion, validacion, logica de negocio y acceso a la base de datos. Para las pruebas de integracion se utiliza una base de datos de testing que se reinicia entre suites de tests. Cada desarrollador es responsable de testear los servicios y endpoints que desarrollo en sus epicas, mientras Daniel Soto (QA) coordina la estrategia, define criterios de cobertura y valida que los tests sean significativos.

## Responsable(s)

| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| Desarrollador | Edgar Chacon |
| Desarrollador | Jazir Olivera |
| Desarrollador | Piero Aguilar |
| QA (Coordinador) | Daniel Soto |

## Temas React Asociados

No aplica (epica de backend).

## Historias de Usuario

| ID | Titulo | Prioridad | Semana |
|----|--------|-----------|--------|
| HU-BE-024 | Configuracion de Vitest y utilities de testing para backend | Alta | S2 |
| HU-BE-025 | Tests unitarios de servicios de negocio | Alta | S2 |
| HU-BE-026 | Tests de integracion de endpoints de autenticacion y cursos | Alta | S2 |
| HU-BE-027 | Tests de integracion de learning paths, quizzes y servicios IA | Media | S2 |

### Detalle de Historias

#### HU-BE-024: Configuracion de Vitest y utilities de testing para backend

**Como** desarrollador, **quiero** tener Vitest configurado para el backend con utilities compartidas para testing, **para** poder escribir tests de forma rapida y consistente en todo el servidor.

**Criterios de Aceptacion:**
- Vitest configurado en el proyecto backend con entorno Node.
- Archivo `test-utils.ts` con helpers compartidos:
  - Factory functions para crear datos de prueba (`createMockUser`, `createMockCourse`, `createMockQuiz`).
  - Helper para crear request context con autenticacion mock (`createAuthenticatedRequest`).
  - Helper para crear un Prisma Client mock.
  - Helper para setup y teardown de la base de datos de testing.
- Mock global de Prisma Client con todas las operaciones comunes.
- Mock del servicio de OpenAI para tests que no necesitan la API real.
- Scripts de npm: `test`, `test:watch`, `test:coverage`, `test:integration`.
- Configuracion de cobertura minima al 70% para archivos en `services/`, `middleware/` y `controllers/`.
- Separacion de tests unitarios (rapidos, sin DB) e integracion (con DB) via glob patterns.
- Configuracion de base de datos de testing aislada (DATABASE_URL diferente para tests).

#### HU-BE-025: Tests unitarios de servicios de negocio

**Como** desarrollador, **quiero** tests unitarios completos para los servicios de logica de negocio, **para** asegurar que la logica core funciona correctamente de forma aislada sin dependencias externas.

**Criterios de Aceptacion:**
- **AuthService tests:**
  - Hashing de password correcto con bcrypt.
  - Generacion y verificacion de JWT.
  - Logica de refresh token (generacion, validacion, rotacion).
  - Manejo de token expirado.
  
- **CourseService tests:**
  - Creacion de curso con datos validos.
  - Validacion de datos invalidos (titulo vacio, categoria inexistente).
  - Logica de paginacion y filtrado.
  - Calculo de orden al agregar/eliminar modulos y lecciones.

- **ProgressService tests:**
  - Calculo de porcentaje de progreso del curso.
  - Calculo de racha de aprendizaje (dias consecutivos).
  - Actualizacion de progreso (idempotente - no duplicar registros).

- **QuizService tests:**
  - Evaluacion de respuestas de multiple choice (correcta e incorrecta).
  - Evaluacion de respuestas true/false.
  - Evaluacion de respuestas short answer (case-insensitive, multiples respuestas aceptadas).
  - Calculo de puntaje total (parcial y completo).
  - Determinacion de aprobado/reprobado (threshold 70%).

- **OpenAIService tests (con mocks):**
  - Parseo correcto de respuestas JSON de la IA.
  - Manejo de errores de API (rate limit, timeout).
  - Logica de retry con backoff exponencial.

- Todos los tests usan mocks de Prisma Client (no acceden a DB real).
- Cada test es independiente y no depende del estado de otros tests.

**Responsable directo:** Cada dev testea los servicios de su epica. Carlos (auth), Edgar (courses, quizzes), Jazir (progress, paths), Piero (OpenAI).

#### HU-BE-026: Tests de integracion de endpoints de autenticacion y cursos

**Como** QA, **quiero** tests de integracion que verifiquen los flujos completos de los endpoints de autenticacion y gestion de cursos, **para** asegurar que las capas del servidor (ruta -> middleware -> controller -> service -> DB) funcionan correctamente juntas.

**Criterios de Aceptacion:**
- **Tests de Auth endpoints:**
  - `POST /api/auth/register`: registro exitoso, email duplicado, datos invalidos.
  - `POST /api/auth/login`: login exitoso, credenciales invalidas, usuario no existente.
  - `POST /api/auth/refresh`: refresh exitoso, token invalido, token expirado.
  - `POST /api/auth/logout`: logout exitoso, token ya invalidado.
  - Verificar que las rutas protegidas rechazan requests sin token.
  - Verificar que las rutas admin rechazan requests de usuarios regulares.

- **Tests de Course endpoints:**
  - `POST /api/courses`: creacion exitosa (admin), rechazo (user regular), datos invalidos.
  - `GET /api/courses`: listado con paginacion, busqueda, filtros.
  - `GET /api/courses/:id`: curso existente, curso inexistente (404).
  - `PUT /api/courses/:id`: actualizacion exitosa (admin), rechazo (no admin).
  - `DELETE /api/courses/:id`: eliminacion exitosa, rechazo de permisos.
  - CRUD de modulos y lecciones dentro de cursos.

- Los tests usan `supertest` o similar para hacer requests HTTP reales al servidor.
- Base de datos de testing limpiada entre test suites.
- Los tests verifican status codes, estructura de response y datos correctos.

**Responsable directo:** Carlos (auth), Edgar (courses), Daniel Soto (coordinacion y revision).

#### HU-BE-027: Tests de integracion de learning paths, quizzes y servicios IA

**Como** QA, **quiero** tests de integracion para los endpoints de learning paths, quizzes y servicios de IA, **para** asegurar que las funcionalidades mas complejas del sistema funcionan correctamente de extremo a extremo.

**Criterios de Aceptacion:**
- **Tests de Learning Path endpoints:**
  - Enrollment: inscripcion exitosa crea learning path y registros de progreso.
  - CRUD de learning paths: creacion, lectura, actualizacion, eliminacion.
  - Fork: fork exitoso crea copia con referencia al original, progreso en 0.
  - Progreso: registrar progreso, calcular porcentaje, racha de dias.

- **Tests de Quiz endpoints:**
  - Creacion de quiz con los tres tipos de preguntas.
  - Intento de quiz con evaluacion automatica correcta.
  - Multiples intentos almacenados correctamente.
  - Quiz aprobado actualiza progreso de la leccion.

- **Tests de IA endpoints (con mocks de OpenAI):**
  - Chat conversacional: envio de mensaje y recepcion de respuesta mockeada.
  - Generacion de estructura de curso: respuesta parseada correctamente a JSON.
  - Generacion de quiz: respuesta validada contra esquema Zod.
  - Recomendaciones: respuestas cacheadas correctamente.
  - Manejo de errores de OpenAI (rate limit, timeout).

- Los tests de IA mockean la API de OpenAI (no hacen llamadas reales por costo).
- Base de datos de testing con datos seed apropiados para cada suite.
- Verificacion de efectos secundarios (enrollment crea path, quiz aprobado actualiza progreso).

**Responsable directo:** Jazir (learning paths, progress), Edgar + Piero (quizzes), Piero (IA), Daniel Soto (coordinacion).

## Dependencias

- **Depende de:** EP-BE-01 (Setup - Vitest debe estar preconfigurado), todas las demas epicas backend (los servicios y endpoints a testear deben existir).
- **Bloquea a:** Ninguna (es la ultima epica del backend).

## Definition of Done

- [ ] Vitest configurado para backend con utilities compartidas.
- [ ] Factory functions para datos de prueba de todos los modelos.
- [ ] Mocks de Prisma Client y OpenAI Service funcionales.
- [ ] Tests unitarios de AuthService, CourseService, ProgressService, QuizService, OpenAIService.
- [ ] Tests de integracion de endpoints de auth (register, login, refresh, logout).
- [ ] Tests de integracion de endpoints de cursos (CRUD completo).
- [ ] Tests de integracion de endpoints de learning paths (enrollment, CRUD, fork, progreso).
- [ ] Tests de integracion de endpoints de quizzes (CRUD, evaluacion).
- [ ] Tests de integracion de endpoints de IA (con mocks de OpenAI).
- [ ] Cobertura minima de 70% en archivos criticos (services, middleware, controllers).
- [ ] Todos los tests pasan sin errores y son independientes entre si.
- [ ] Scripts de npm configurados: test, test:watch, test:coverage, test:integration.
- [ ] Reporte de cobertura generado y revisado por QA.
