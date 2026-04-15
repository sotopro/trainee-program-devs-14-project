# HU-BE-015: Tracking de Progreso

## Descripcion
Como usuario, quiero marcar lecciones como completadas y ver mi progreso general en un curso para poder hacer seguimiento de mi avance en la ruta de aprendizaje.

El sistema de tracking de progreso permite a los usuarios marcar lecciones individuales como completadas y consultar un resumen de su progreso por curso. El progreso se calcula en base a las lecciones completadas del learning path del usuario dividido entre el total de lecciones del path. Cuando el usuario completa todas las lecciones de su learning path, el estado del enrollment se actualiza automaticamente a COMPLETED.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Jazir Olivera |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint POST /api/lessons/:lessonId/complete marca una leccion como completada para el usuario autenticado, creando un registro en LessonProgress.
- [ ] **AC-2:** El endpoint GET /api/my/progress/:courseId devuelve el progreso del usuario en un curso: lecciones completadas, puntajes de quizzes y porcentaje general.
- [ ] **AC-3:** El progreso se calcula como `(lecciones completadas en el path / total de lecciones en el path) * 100`.
- [ ] **AC-4:** Cuando el usuario completa la ultima leccion de su learning path, el estado del enrollment se actualiza automaticamente a COMPLETED.
- [ ] **AC-5:** Si el usuario intenta marcar una leccion ya completada, el sistema retorna 200 OK sin crear un registro duplicado (operacion idempotente).

### Tecnicos
- [ ] **AC-T1:** El registro de completado y la verificacion de enrollment completado se ejecutan dentro de una transaccion de Prisma.
- [ ] **AC-T2:** Se verifica que el usuario tiene un enrollment activo en el curso al que pertenece la leccion antes de permitir marcar como completada.
- [ ] **AC-T3:** El calculo de progreso utiliza consultas agregadas de Prisma para eficiencia (no cargar todos los registros en memoria).
- [ ] **AC-T4:** Se registra la fecha y hora exacta de completado en el campo `completedAt` del LessonProgress.

### QA
- [ ] **QA-1:** Verificar que el progreso se calcula correctamente con diferentes cantidades de lecciones completadas (0%, 25%, 50%, 75%, 100%).
- [ ] **QA-2:** Verificar que al completar la ultima leccion, el enrollment cambia automaticamente a estado COMPLETED.
- [ ] **QA-3:** Verificar que marcar una leccion ya completada es idempotente y no crea registros duplicados ni altera la fecha original de completado.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-015-1 | Implementar ProgressService con logica de completado de leccion | 1h | Alta |
| T-BE-015-2 | Implementar calculo de progreso por curso con consultas agregadas | 0.5h | Alta |
| T-BE-015-3 | Implementar actualizacion automatica de enrollment a COMPLETED | 0.5h | Alta |
| T-BE-015-4 | Implementar controladores y rutas con middleware de autenticacion | 0.5h | Alta |
| T-BE-015-5 | Implementar idempotencia en el endpoint de completado | 0.5h | Media |

## Notas Tecnicas

### Especificacion de Endpoints

**POST /api/lessons/:lessonId/complete** (Autenticado)
- No requiere body.
- Respuesta (200 OK):
```json
{
  "lessonId": "uuid",
  "completed": true,
  "completedAt": "2026-01-15T14:30:00Z",
  "courseProgress": {
    "completedLessons": 5,
    "totalLessons": 10,
    "percentage": 50.0,
    "enrollmentStatus": "ACTIVE"
  }
}
```

**GET /api/my/progress/:courseId** (Autenticado)
- Respuesta:
```json
{
  "courseId": "uuid",
  "courseTitle": "Curso de TypeScript",
  "enrollmentStatus": "ACTIVE",
  "learningPath": {
    "id": "uuid",
    "name": "Main Branch"
  },
  "progress": {
    "completedLessons": 5,
    "totalLessons": 10,
    "percentage": 50.0
  },
  "lessons": [
    {
      "id": "uuid",
      "title": "Leccion 1",
      "completed": true,
      "completedAt": "2026-01-10T10:00:00Z",
      "quizScore": 80
    },
    {
      "id": "uuid",
      "title": "Leccion 2",
      "completed": false,
      "completedAt": null,
      "quizScore": null
    }
  ],
  "quizzes": {
    "totalQuizzes": 5,
    "completedQuizzes": 3,
    "averageScore": 85.5
  }
}
```

### Modelo LessonProgress
```
LessonProgress {
  id          String   @id @default(uuid())
  userId      String
  lessonId    String
  completed   Boolean  @default(false)
  completedAt DateTime?
  quizScore   Float?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, lessonId])
}
```

### Consideraciones
- La constraint `@@unique([userId, lessonId])` previene duplicados a nivel de base de datos.
- Para la idempotencia, usar `upsert` de Prisma: si ya existe el registro, no lo modifica.
- El progreso se calcula contra las lecciones del learning path del usuario (no todas las lecciones del curso), ya que el usuario puede tener un path forkeado con mas o menos lecciones.
- El puntaje del quiz se almacena en LessonProgress.quizScore y se actualiza desde HU-BE-017.

## Dependencias
- **Depende de:** HU-BE-012 (Sistema de Enrollment), HU-BE-013 (CRUD de Learning Paths)
- **Bloquea a:** HU-BE-017 (Evaluacion de Quizzes), HU-BE-022 (Motor de Recomendaciones)
