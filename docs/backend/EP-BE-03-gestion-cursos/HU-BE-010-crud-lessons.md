# HU-BE-010: CRUD de Lessons

## Descripcion
Como administrador, quiero gestionar las lecciones de un modulo (crear, leer, actualizar, eliminar y reordenar) para poder definir el contenido educativo detallado dentro de cada modulo del curso.

Las lecciones son la unidad fundamental de contenido en la plataforma. Cada leccion pertenece a un modulo y contiene contenido en formato JSON de Editor.js, lo que permite almacenar parrafos, encabezados, listas, bloques de codigo y otros elementos enriquecidos. El sistema debe soportar CRUD completo, reordenamiento de lecciones dentro de un modulo, y en la respuesta de detalle indicar si la leccion tiene un quiz asociado.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Edgar Chacon |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint GET /api/modules/:moduleId/lessons devuelve todas las lecciones de un modulo ordenadas por el campo `order`.
- [ ] **AC-2:** El endpoint GET /api/lessons/:id devuelve el detalle completo de una leccion incluyendo su contenido Editor.js y un flag `hasQuiz` que indica si tiene quiz asociado.
- [ ] **AC-3:** El endpoint POST /api/modules/:moduleId/lessons permite crear una leccion con titulo y contenido opcional en formato Editor.js JSON.
- [ ] **AC-4:** El endpoint PUT /api/lessons/:id permite actualizar titulo y contenido (Editor.js JSON) de una leccion existente.
- [ ] **AC-5:** El endpoint DELETE /api/lessons/:id elimina la leccion y sus datos asociados (quiz, progreso).
- [ ] **AC-6:** El endpoint PATCH /api/lessons/reorder acepta un arreglo de `{ id, order }` y actualiza el orden de multiples lecciones atomicamente.

### Tecnicos
- [ ] **AC-T1:** El campo `content` almacena JSON valido en formato Editor.js; el schema Zod valida que sea un objeto JSON valido cuando se proporciona.
- [ ] **AC-T2:** La creacion y actualizacion validan los datos de entrada con schemas Zod (titulo requerido, minimo 3 caracteres).
- [ ] **AC-T3:** El reordenamiento se ejecuta dentro de una transaccion de Prisma y valida que todas las lecciones pertenezcan al mismo modulo.
- [ ] **AC-T4:** Se verifica que el moduleId existe antes de crear una leccion; si no existe, se retorna 404.

### QA
- [ ] **QA-1:** Verificar que el contenido Editor.js se almacena y recupera correctamente sin perdida de estructura ni datos.
- [ ] **QA-2:** Verificar que el campo `hasQuiz` en la respuesta de detalle es `true` cuando la leccion tiene un quiz y `false` cuando no lo tiene.
- [ ] **QA-3:** Verificar que el reordenamiento funciona correctamente y rechaza lecciones que no pertenecen al mismo modulo.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-010-1 | Definir schemas Zod para createLesson, updateLesson y reorderLessons | 0.5h | Alta |
| T-BE-010-2 | Implementar LessonService con CRUD y logica de reordenamiento | 1h | Alta |
| T-BE-010-3 | Implementar controladores para cada endpoint | 0.5h | Alta |
| T-BE-010-4 | Configurar rutas con middleware de auth y validacion | 0.5h | Alta |
| T-BE-010-5 | Agregar campo hasQuiz en la consulta de detalle de leccion | 0.5h | Media |

## Notas Tecnicas

### Especificacion de Endpoints

**GET /api/modules/:moduleId/lessons**
- Respuesta:
```json
[
  {
    "id": "uuid",
    "title": "Introduccion a los tipos",
    "order": 1,
    "moduleId": "uuid",
    "hasQuiz": true,
    "createdAt": "2026-01-01T00:00:00Z"
  }
]
```

**GET /api/lessons/:id**
- Respuesta:
```json
{
  "id": "uuid",
  "title": "Introduccion a los tipos",
  "content": {
    "time": 1625000000000,
    "blocks": [
      { "type": "header", "data": { "text": "Tipos en TypeScript", "level": 2 } },
      { "type": "paragraph", "data": { "text": "TypeScript extiende JavaScript..." } },
      { "type": "code", "data": { "code": "let x: number = 5;" } }
    ],
    "version": "2.28.0"
  },
  "order": 1,
  "moduleId": "uuid",
  "hasQuiz": true,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

**POST /api/modules/:moduleId/lessons** (Admin)
- Body:
```json
{
  "title": "Introduccion a los tipos",
  "content": { "time": 1625000000000, "blocks": [], "version": "2.28.0" }
}
```
- El campo `content` es opcional al crear; el `order` se asigna automaticamente.

**PUT /api/lessons/:id** (Admin)
- Body:
```json
{
  "title": "Titulo actualizado",
  "content": { "time": 1625000000000, "blocks": [...], "version": "2.28.0" }
}
```

**DELETE /api/lessons/:id** (Admin)
- Respuesta: 204 No Content

**PATCH /api/lessons/reorder** (Admin)
- Body:
```json
{
  "lessons": [
    { "id": "uuid-1", "order": 1 },
    { "id": "uuid-2", "order": 2 }
  ]
}
```

### Consideraciones
- El contenido Editor.js se almacena como `Json` en Prisma (tipo nativo de PostgreSQL JSONB).
- Para el flag `hasQuiz`, usar una subconsulta o include con `_count` sobre la relacion Quiz.
- Al eliminar una leccion, considerar que puede tener registros en LessonProgress y LearningPathLesson.

## Dependencias
- **Depende de:** HU-BE-009 (CRUD de Modules)
- **Bloquea a:** HU-BE-013 (CRUD de Learning Paths), HU-BE-016 (CRUD de Quizzes), HU-BE-020 (Generacion de Contenido)
