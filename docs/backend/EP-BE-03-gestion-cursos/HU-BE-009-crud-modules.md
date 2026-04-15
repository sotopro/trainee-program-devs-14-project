# HU-BE-009: CRUD de Modules

## Descripcion
Como administrador, quiero gestionar los modulos de un curso (crear, leer, actualizar, eliminar y reordenar) para poder organizar el contenido del curso en secciones logicas.

Los modulos pertenecen a un curso especifico y representan agrupaciones tematicas de lecciones. El sistema debe permitir crear modulos dentro de un curso, actualizarlos, eliminarlos (con borrado en cascada de sus lecciones) y reordenarlos. El endpoint de reordenamiento acepta un arreglo de objetos con el ID del modulo y su nueva posicion, permitiendo reorganizar multiples modulos en una sola peticion.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Edgar Chacon |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint GET /api/courses/:courseId/modules devuelve todos los modulos de un curso ordenados por el campo `order`.
- [ ] **AC-2:** El endpoint POST /api/courses/:courseId/modules permite crear un nuevo modulo asignandole automaticamente el siguiente orden disponible.
- [ ] **AC-3:** El endpoint PUT /api/modules/:id permite actualizar el titulo y descripcion de un modulo existente.
- [ ] **AC-4:** El endpoint DELETE /api/modules/:id elimina el modulo y todas sus lecciones asociadas en cascada.
- [ ] **AC-5:** El endpoint PATCH /api/modules/reorder acepta un arreglo de `{ id, order }` y actualiza el orden de multiples modulos en una sola operacion.

### Tecnicos
- [ ] **AC-T1:** La creacion y actualizacion de modulos valida los datos de entrada con schemas Zod (titulo requerido, minimo 3 caracteres).
- [ ] **AC-T2:** El reordenamiento se ejecuta dentro de una transaccion de Prisma para garantizar que todos los cambios de orden se apliquen atomicamente.
- [ ] **AC-T3:** El borrado en cascada elimina las lecciones, contenido y quizzes asociados al modulo mediante transaccion.
- [ ] **AC-T4:** Se verifica que el courseId existe antes de crear un modulo; si no existe, se retorna 404.

### QA
- [ ] **QA-1:** Verificar que al eliminar un modulo con 3 lecciones, las 3 lecciones y sus datos asociados se eliminan correctamente de la base de datos.
- [ ] **QA-2:** Verificar que el endpoint de reordenamiento actualiza correctamente los valores de `order` y que la respuesta del GET refleja el nuevo orden.
- [ ] **QA-3:** Verificar que no se puede crear un modulo en un curso inexistente (404 Not Found).

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-009-1 | Definir schemas Zod para createModule, updateModule y reorderModules | 0.5h | Alta |
| T-BE-009-2 | Implementar ModuleService con CRUD y logica de reordenamiento | 1h | Alta |
| T-BE-009-3 | Implementar controladores para cada endpoint | 0.5h | Alta |
| T-BE-009-4 | Configurar rutas con middleware de auth (admin) y validacion | 0.5h | Alta |
| T-BE-009-5 | Implementar logica de borrado en cascada con transaccion | 0.5h | Media |

## Notas Tecnicas

### Especificacion de Endpoints

**GET /api/courses/:courseId/modules**
- Respuesta:
```json
[
  {
    "id": "uuid",
    "title": "Fundamentos de TypeScript",
    "description": "Tipos basicos y configuracion",
    "order": 1,
    "courseId": "uuid",
    "lessonCount": 5,
    "createdAt": "2026-01-01T00:00:00Z"
  }
]
```

**POST /api/courses/:courseId/modules** (Admin)
- Body:
```json
{
  "title": "Fundamentos de TypeScript",
  "description": "Tipos basicos y configuracion"
}
```
- El campo `order` se asigna automaticamente como `MAX(order) + 1` del curso.

**PUT /api/modules/:id** (Admin)
- Body:
```json
{
  "title": "Fundamentos Avanzados",
  "description": "Descripcion actualizada"
}
```

**DELETE /api/modules/:id** (Admin)
- Respuesta: 204 No Content

**PATCH /api/modules/reorder** (Admin)
- Body:
```json
{
  "modules": [
    { "id": "uuid-1", "order": 1 },
    { "id": "uuid-2", "order": 2 },
    { "id": "uuid-3", "order": 3 }
  ]
}
```
- Respuesta: 200 OK con los modulos actualizados.

### Consideraciones
- Los modulos estan vinculados a un curso mediante `courseId` (foreign key).
- Al crear un modulo, calcular el orden maximo actual del curso y asignar `maxOrder + 1`.
- El reordenamiento debe validar que todos los IDs proporcionados pertenecen al mismo curso.

## Dependencias
- **Depende de:** HU-BE-008 (CRUD de Courses)
- **Bloquea a:** HU-BE-010 (CRUD de Lessons)
