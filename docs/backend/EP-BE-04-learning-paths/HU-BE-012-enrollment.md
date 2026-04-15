# HU-BE-012: Sistema de Enrollment

## Descripcion
Como usuario, quiero inscribirme en cursos publicos y gestionar mis inscripciones para poder acceder al contenido de aprendizaje y hacer seguimiento de mi progreso.

El sistema de enrollment permite a los usuarios auto-inscribirse en cursos publicos, consultar sus inscripciones activas con el porcentaje de progreso, ver el detalle de una inscripcion con su learning path asociado y desinscribirse de un curso. Al inscribirse, se crea automaticamente un enrollment vinculado al learning path por defecto del curso. El sistema debe prevenir inscripciones duplicadas en el mismo curso.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Jazir Olivera |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint POST /api/courses/:courseId/enroll permite a un usuario autenticado inscribirse en un curso publico, creando un enrollment vinculado al learning path por defecto.
- [ ] **AC-2:** El endpoint DELETE /api/enrollments/:id permite al usuario desinscribirse de un curso, eliminando su enrollment.
- [ ] **AC-3:** El endpoint GET /api/my/enrollments devuelve la lista de inscripciones del usuario autenticado con el porcentaje de progreso y datos basicos del curso.
- [ ] **AC-4:** El endpoint GET /api/enrollments/:id devuelve el detalle de una inscripcion incluyendo el learning path asociado, las lecciones del path y el progreso por leccion.
- [ ] **AC-5:** Si el usuario intenta inscribirse en un curso donde ya esta inscrito, el sistema retorna 409 Conflict.
- [ ] **AC-6:** Si el usuario intenta inscribirse en un curso no publico (isPublic: false), el sistema retorna 403 Forbidden.

### Tecnicos
- [ ] **AC-T1:** La creacion del enrollment se realiza dentro de una transaccion de Prisma que verifica duplicados y vincula al learning path por defecto.
- [ ] **AC-T2:** El calculo del progreso se realiza a nivel de base de datos usando consultas agregadas de Prisma (count de lecciones completadas vs total de lecciones en el path).
- [ ] **AC-T3:** Los endpoints estan protegidos con middleware de autenticacion; el usuario solo puede ver y gestionar sus propias inscripciones.
- [ ] **AC-T4:** El endpoint DELETE verifica que el enrollment pertenece al usuario autenticado antes de eliminarlo.

### QA
- [ ] **QA-1:** Verificar que al inscribirse se crea un enrollment con estado ACTIVE y learning path por defecto correctamente vinculado.
- [ ] **QA-2:** Verificar que la inscripcion duplicada retorna 409 y que la inscripcion en curso privado retorna 403.
- [ ] **QA-3:** Verificar que el progreso se calcula correctamente: 0% al iniciar, porcentaje parcial durante el curso y 100% al completar todas las lecciones.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-012-1 | Implementar EnrollmentService con logica de inscripcion y verificaciones | 1.5h | Alta |
| T-BE-012-2 | Implementar logica de calculo de progreso basada en lecciones del path | 1h | Alta |
| T-BE-012-3 | Implementar controladores para los cuatro endpoints | 0.5h | Alta |
| T-BE-012-4 | Configurar rutas con middleware de autenticacion | 0.5h | Alta |
| T-BE-012-5 | Implementar validaciones de duplicado y curso publico | 0.5h | Media |

## Notas Tecnicas

### Especificacion de Endpoints

**POST /api/courses/:courseId/enroll** (Autenticado)
- No requiere body.
- Respuesta (201 Created):
```json
{
  "id": "uuid-enrollment",
  "courseId": "uuid",
  "userId": "uuid",
  "learningPathId": "uuid-default-path",
  "status": "ACTIVE",
  "progress": 0,
  "createdAt": "2026-01-01T00:00:00Z"
}
```

**DELETE /api/enrollments/:id** (Autenticado, propietario)
- Respuesta: 204 No Content

**GET /api/my/enrollments** (Autenticado)
- Respuesta:
```json
[
  {
    "id": "uuid-enrollment",
    "course": {
      "id": "uuid",
      "title": "Curso de TypeScript",
      "description": "..."
    },
    "status": "ACTIVE",
    "progress": 45.5,
    "learningPathId": "uuid",
    "enrolledAt": "2026-01-01T00:00:00Z"
  }
]
```

**GET /api/enrollments/:id** (Autenticado, propietario)
- Respuesta:
```json
{
  "id": "uuid-enrollment",
  "course": { "id": "uuid", "title": "Curso de TypeScript" },
  "status": "ACTIVE",
  "progress": 45.5,
  "learningPath": {
    "id": "uuid",
    "name": "Main Branch",
    "lessons": [
      {
        "id": "uuid",
        "title": "Leccion 1",
        "order": 1,
        "completed": true,
        "completedAt": "2026-01-02T00:00:00Z"
      },
      {
        "id": "uuid",
        "title": "Leccion 2",
        "order": 2,
        "completed": false,
        "completedAt": null
      }
    ]
  }
}
```

### Consideraciones
- El progreso se calcula como: `(lecciones completadas en el path / total de lecciones en el path) * 100`.
- El learning path por defecto se identifica con `isDefault: true` para el curso dado.
- Al desinscribirse, se eliminan tambien los registros de LessonProgress del usuario para ese curso.
- Los estados de enrollment son: ACTIVE, COMPLETED, DROPPED.

## Dependencias
- **Depende de:** HU-BE-008 (CRUD de Courses), HU-BE-013 (CRUD de Learning Paths)
- **Bloquea a:** HU-BE-011 (Asignacion de Cursos), HU-BE-015 (Tracking de Progreso)
