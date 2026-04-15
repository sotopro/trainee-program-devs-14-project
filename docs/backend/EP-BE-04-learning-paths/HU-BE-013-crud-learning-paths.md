# HU-BE-013: CRUD de Learning Paths

## Descripcion
Como administrador, quiero gestionar los learning paths de un curso para poder definir diferentes rutas de aprendizaje que los usuarios pueden seguir a traves del contenido.

Un learning path representa una secuencia ordenada de lecciones dentro de un curso. Cuando se crea un curso, se genera automaticamente un "Main Branch" (isDefault: true) que incluye todas las lecciones en orden. Los administradores pueden crear paths personalizados con subconjuntos o reordenamientos de lecciones. La tabla de union LearningPathLesson gestiona la relacion muchos-a-muchos entre paths y lecciones, incluyendo el orden de cada leccion dentro del path.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Jazir Olivera |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** Al crear un curso, se genera automaticamente un learning path "Main Branch" con `isDefault: true` que incluye todas las lecciones del curso en orden.
- [ ] **AC-2:** El endpoint GET /api/courses/:courseId/paths devuelve todos los learning paths de un curso, mostrando el arbol de ramificaciones (parentPathId).
- [ ] **AC-3:** El endpoint GET /api/paths/:id devuelve el detalle de un learning path con sus lecciones ordenadas segun la tabla LearningPathLesson.
- [ ] **AC-4:** El endpoint POST /api/courses/:courseId/paths permite crear un learning path personalizado especificando nombre, descripcion y lista de lecciones con su orden.
- [ ] **AC-5:** Al agregar una leccion al curso, esta se anade automaticamente al final del learning path por defecto.

### Tecnicos
- [ ] **AC-T1:** La tabla de union LearningPathLesson contiene los campos `learningPathId`, `lessonId` y `order` para gestionar la secuencia de lecciones en cada path.
- [ ] **AC-T2:** La creacion del path por defecto se ejecuta automaticamente al confirmar la creacion de un curso (hook o servicio post-creacion).
- [ ] **AC-T3:** La creacion de paths personalizados valida con Zod que las lecciones referenciadas existen y pertenecen al curso.
- [ ] **AC-T4:** La consulta de arbol de ramificaciones usa relaciones recursivas para construir la jerarquia parent-children.

### QA
- [ ] **QA-1:** Verificar que al crear un curso con 5 lecciones, el learning path por defecto contiene las 5 lecciones en el orden correcto.
- [ ] **QA-2:** Verificar que se puede crear un path personalizado con un subconjunto de lecciones y que el orden se respeta en las consultas.
- [ ] **QA-3:** Verificar que la vista de arbol muestra correctamente la jerarquia de paths (main branch, forks, sub-forks).

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-013-1 | Implementar logica de creacion automatica del Main Branch al crear curso | 1h | Alta |
| T-BE-013-2 | Implementar LearningPathService con CRUD y gestion de LearningPathLesson | 1.5h | Alta |
| T-BE-013-3 | Implementar logica de arbol de ramificaciones para el listado | 0.5h | Media |
| T-BE-013-4 | Implementar controladores y rutas con validacion Zod | 0.5h | Alta |
| T-BE-013-5 | Implementar auto-adicion de lecciones nuevas al path por defecto | 0.5h | Media |

## Notas Tecnicas

### Especificacion de Endpoints

**GET /api/courses/:courseId/paths**
- Respuesta:
```json
[
  {
    "id": "uuid-main",
    "name": "Main Branch",
    "isDefault": true,
    "parentPathId": null,
    "lessonCount": 10,
    "children": [
      {
        "id": "uuid-fork-1",
        "name": "Fork de Juan",
        "isDefault": false,
        "parentPathId": "uuid-main",
        "lessonCount": 12,
        "children": []
      }
    ]
  }
]
```

**GET /api/paths/:id**
- Respuesta:
```json
{
  "id": "uuid",
  "name": "Main Branch",
  "description": "Ruta principal del curso",
  "isDefault": true,
  "parentPathId": null,
  "courseId": "uuid",
  "lessons": [
    {
      "id": "uuid-lesson",
      "title": "Leccion 1",
      "order": 1,
      "moduleTitle": "Modulo 1"
    },
    {
      "id": "uuid-lesson-2",
      "title": "Leccion 2",
      "order": 2,
      "moduleTitle": "Modulo 1"
    }
  ]
}
```

**POST /api/courses/:courseId/paths** (Admin)
- Body:
```json
{
  "name": "Ruta avanzada",
  "description": "Path enfocado en temas avanzados",
  "lessons": [
    { "lessonId": "uuid-1", "order": 1 },
    { "lessonId": "uuid-2", "order": 2 }
  ]
}
```

### Modelo LearningPathLesson
```
LearningPathLesson {
  id            String   @id @default(uuid())
  learningPathId String
  lessonId      String
  order         Int
  createdAt     DateTime @default(now())
}
```

### Consideraciones
- El Main Branch se crea con `isDefault: true` y `parentPathId: null`.
- Cuando se crea una leccion nueva en el curso, se debe agregar al path por defecto con `order = MAX(order) + 1`.
- Para la vista de arbol, se pueden hacer dos consultas: obtener todos los paths del curso y luego construir la jerarquia en memoria.
- Los paths forkeados tendran `parentPathId` apuntando al path del que se origina.

## Dependencias
- **Depende de:** HU-BE-008 (CRUD de Courses), HU-BE-010 (CRUD de Lessons)
- **Bloquea a:** HU-BE-012 (Sistema de Enrollment), HU-BE-014 (Fork de Learning Path), HU-BE-015 (Tracking de Progreso)
