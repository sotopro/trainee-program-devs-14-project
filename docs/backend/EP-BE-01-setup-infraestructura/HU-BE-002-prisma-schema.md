# HU-BE-002: Schema de Prisma y Migraciones

## Descripcion
Como equipo de desarrollo, quiero tener el schema de Prisma completamente definido con todos los modelos, relaciones y enums necesarios para la plataforma, para que los modulos del backend puedan interactuar con la base de datos de forma segura y tipada.

El schema de Prisma define la estructura completa de la base de datos de LearnPath. Incluye los modelos principales: `User` (usuarios con roles), `Course` (cursos creados por admins), `Module` (modulos dentro de un curso), `Lesson` (lecciones dentro de un modulo), `Quiz` (evaluaciones asociadas a lecciones), `LearningPath` (rutas de aprendizaje que pueden ser forkeadas), `LearningPathLesson` (relacion entre rutas y lecciones con orden), `Enrollment` (inscripciones de usuarios a rutas), `LessonProgress` (progreso de usuario por leccion), `Recommendation` (recomendaciones generadas por IA) y `AIConversation` (conversaciones del admin con la IA para creacion de cursos). Se definen tres enums: `Role` (ADMIN, USER), `EnrollmentStatus` (ACTIVE, COMPLETED, PAUSED) y `RecommendationType` (QUESTION, TOPIC, RESOURCE). Todas las relaciones incluyen foreign keys correctas y configuracion de cascadas para eliminacion. Se incluye una migracion inicial y un script de seed con un usuario administrador de ejemplo.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Equipo completo |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El archivo `prisma/schema.prisma` contiene todos los modelos definidos: User, Course, Module, Lesson, Quiz, LearningPath, LearningPathLesson, Enrollment, LessonProgress, Recommendation, AIConversation.
- [ ] **AC-2:** Los enums `Role` (ADMIN, USER), `EnrollmentStatus` (ACTIVE, COMPLETED, PAUSED) y `RecommendationType` (QUESTION, TOPIC, RESOURCE) estan definidos y correctamente referenciados en los modelos.
- [ ] **AC-3:** Todas las relaciones entre modelos estan definidas con foreign keys correctas: Course pertenece a User (creador), Module pertenece a Course, Lesson pertenece a Module, Quiz pertenece a Lesson, etc.
- [ ] **AC-4:** La migracion inicial se ejecuta exitosamente con `npx prisma migrate dev` creando todas las tablas y relaciones en la base de datos.
- [ ] **AC-5:** El script de seed (`prisma/seed.ts`) crea un usuario administrador de ejemplo y al menos un curso con modulos y lecciones de muestra.
- [ ] **AC-6:** Al ejecutar `npx prisma generate`, el cliente de Prisma se genera correctamente con tipos TypeScript para todos los modelos y relaciones.

### Tecnicos
- [ ] **AC-T1:** Los modelos tienen timestamps (`createdAt`, `updatedAt`) con valores por defecto (`@default(now())` y `@updatedAt`) en todos los modelos que lo requieran.
- [ ] **AC-T2:** Las eliminaciones en cascada estan configuradas correctamente: al eliminar un Course se eliminan sus Modules, al eliminar un Module se eliminan sus Lessons, etc.
- [ ] **AC-T3:** El modelo `User` tiene un indice unico en el campo `email` (`@@unique`) y el campo `password` nunca se incluye en las queries por defecto (se usa `select` o `omit` en el servicio).
- [ ] **AC-T4:** El datasource esta configurado para Prisma Postgres con la variable de entorno `DATABASE_URL`.

### QA
- [ ] **QA-1:** Al ejecutar `npx prisma migrate dev`, la migracion se aplica sin errores y las tablas se crean correctamente en la base de datos.
- [ ] **QA-2:** Al ejecutar `npx prisma db seed`, se insertan los datos de ejemplo sin errores de constraint o duplicados.
- [ ] **QA-3:** Al ejecutar `npx prisma studio`, se pueden visualizar todos los modelos con sus relaciones y datos de seed correctamente.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-011 | Definir modelos User y enums Role en `schema.prisma` | 0.5h | Alta |
| T-BE-012 | Definir modelos Course, Module y Lesson con relaciones | 0.5h | Alta |
| T-BE-013 | Definir modelos Quiz, LearningPath y LearningPathLesson | 0.5h | Alta |
| T-BE-014 | Definir modelos Enrollment, LessonProgress con enums de estado | 0.5h | Alta |
| T-BE-015 | Definir modelos Recommendation y AIConversation | 0.5h | Alta |
| T-BE-016 | Configurar datasource, indices y cascadas de eliminacion | 0.5h | Alta |
| T-BE-017 | Ejecutar migracion inicial con `prisma migrate dev` | 0.25h | Alta |
| T-BE-018 | Crear script de seed con usuario admin y datos de ejemplo | 0.5h | Media |
| T-BE-019 | Verificar generacion del cliente Prisma y tipos TypeScript | 0.25h | Media |

## Notas Tecnicas
- Estructura sugerida del modelo User:
  ```prisma
  model User {
    id            String    @id @default(cuid())
    name          String
    email         String    @unique
    password      String
    role          Role      @default(USER)
    enrollments   Enrollment[]
    createdCourses Course[]
    aiConversations AIConversation[]
    lessonProgress LessonProgress[]
    createdAt     DateTime  @default(now())
    updatedAt     DateTime  @updatedAt
  }
  ```
- Configurar el datasource para Prisma Postgres:
  ```prisma
  datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
  }
  ```
- El modelo `LearningPathLesson` es una tabla intermedia con campo `order` para definir el orden de las lecciones en la ruta.
- Las cascadas de eliminacion (`onDelete: Cascade`) deben configurarse en las relaciones hijo para evitar registros huerfanos.
- El script de seed debe usar `upsert` para ser idempotente (ejecutable multiples veces sin errores).
- Configurar el seed en `package.json`:
  ```json
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
  ```

## Dependencias
- **Depende de:** HU-BE-001 (Scaffold del proyecto)
- **Bloquea a:** HU-BE-004 (Registro de Usuarios), HU-BE-005 (Login), HU-BE-007 (Middleware Auth)
