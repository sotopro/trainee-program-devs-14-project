# HU-BE-011: Asignacion de Cursos a Usuarios

## Descripcion
Como administrador, quiero asignar y desasignar cursos a usuarios especificos para poder controlar el acceso a cursos privados y gestionar las inscripciones de manera centralizada.

El sistema debe permitir al administrador asignar un usuario a un curso, lo cual crea automaticamente un registro de enrollment con un learning path por defecto. Tambien debe poder desasignar usuarios y consultar la lista de usuarios inscritos en un curso. Se debe prevenir la asignacion duplicada, retornando un error claro si el usuario ya esta inscrito en el curso.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Edgar Chacon |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint POST /api/courses/:courseId/assign permite al administrador asignar un usuario a un curso enviando el `userId` en el body.
- [ ] **AC-2:** Al asignar un usuario, el sistema crea automaticamente un enrollment vinculado al learning path por defecto del curso.
- [ ] **AC-3:** El endpoint DELETE /api/courses/:courseId/assign/:userId permite al administrador desasignar a un usuario de un curso, eliminando su enrollment.
- [ ] **AC-4:** El endpoint GET /api/courses/:courseId/enrollments devuelve la lista de usuarios inscritos en el curso con datos basicos del usuario y estado del enrollment.
- [ ] **AC-5:** Si el usuario ya esta asignado al curso, el sistema retorna 409 Conflict con un mensaje descriptivo.

### Tecnicos
- [ ] **AC-T1:** El body del endpoint de asignacion se valida con Zod (userId requerido, formato UUID valido).
- [ ] **AC-T2:** La creacion del enrollment y la vinculacion al learning path por defecto se realizan dentro de una transaccion de Prisma.
- [ ] **AC-T3:** Todos los endpoints estan protegidos con middleware de autenticacion y autorizacion de rol ADMIN.
- [ ] **AC-T4:** Se verifica la existencia del curso y del usuario antes de crear la asignacion; se retorna 404 si alguno no existe.

### QA
- [ ] **QA-1:** Verificar que al asignar un usuario se crea correctamente el enrollment con estado ACTIVE y vinculado al learning path por defecto del curso.
- [ ] **QA-2:** Verificar que la asignacion duplicada retorna 409 Conflict y no crea registros duplicados en la base de datos.
- [ ] **QA-3:** Verificar que al desasignar un usuario, su enrollment y datos de progreso asociados se eliminan correctamente.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-011-1 | Definir schema Zod para assignCourse (userId requerido) | 0.5h | Alta |
| T-BE-011-2 | Implementar AssignmentService con logica de asignacion, desasignacion y listado | 1h | Alta |
| T-BE-011-3 | Implementar controladores para los tres endpoints | 0.5h | Alta |
| T-BE-011-4 | Configurar rutas con middleware de auth ADMIN | 0.5h | Alta |
| T-BE-011-5 | Implementar verificacion de duplicados y creacion transaccional de enrollment | 0.5h | Media |

## Notas Tecnicas

### Especificacion de Endpoints

**POST /api/courses/:courseId/assign** (Admin)
- Body:
```json
{
  "userId": "uuid-del-usuario"
}
```
- Respuesta (201 Created):
```json
{
  "id": "uuid-enrollment",
  "userId": "uuid",
  "courseId": "uuid",
  "learningPathId": "uuid-default-path",
  "status": "ACTIVE",
  "createdAt": "2026-01-01T00:00:00Z"
}
```

**DELETE /api/courses/:courseId/assign/:userId** (Admin)
- Respuesta: 204 No Content

**GET /api/courses/:courseId/enrollments** (Admin)
- Respuesta:
```json
[
  {
    "id": "uuid-enrollment",
    "user": {
      "id": "uuid",
      "name": "Juan Perez",
      "email": "juan@example.com"
    },
    "status": "ACTIVE",
    "progress": 45.5,
    "enrolledAt": "2026-01-01T00:00:00Z"
  }
]
```

### Consideraciones
- El learning path por defecto se identifica con el flag `isDefault: true` del curso.
- Si el curso no tiene un learning path por defecto, la asignacion debe fallar con un error 500 indicando que el curso no esta configurado correctamente.
- La desasignacion debe considerar si se desea eliminar tambien el progreso del usuario (soft delete vs hard delete). Para el MVP se realiza hard delete.

## Dependencias
- **Depende de:** HU-BE-008 (CRUD de Courses), HU-BE-012 (Sistema de Enrollment)
- **Bloquea a:** HU-FE-016 (UI de asignacion de cursos)
