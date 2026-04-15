# HU-BE-008: CRUD de Courses

## Descripcion
Como administrador, quiero gestionar cursos (crear, leer, actualizar y eliminar) para poder construir y mantener el catalogo de aprendizaje de la plataforma.

El sistema debe exponer endpoints RESTful para la gestion completa de cursos. Los administradores podran crear nuevos cursos, actualizar sus datos, eliminarlos (con borrado en cascada de modulos y lecciones) y listarlos con soporte de paginacion, busqueda por texto y filtrado por visibilidad (isPublic). Los usuarios regulares podran consultar el listado de cursos publicos y ver el detalle de un curso incluyendo sus modulos y lecciones. La respuesta del listado debe incluir el conteo de inscripciones (enrollments) para cada curso.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Edgar Chacon |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint GET /api/courses devuelve una lista paginada de cursos con soporte para los query params `page`, `limit`, `search` y `isPublic`.
- [ ] **AC-2:** El endpoint GET /api/courses/:id devuelve el detalle del curso incluyendo sus modulos y lecciones anidados.
- [ ] **AC-3:** El endpoint POST /api/courses permite a un administrador crear un curso con titulo, descripcion y flag isPublic, validando los datos con Zod.
- [ ] **AC-4:** El endpoint PUT /api/courses/:id permite a un administrador actualizar los datos de un curso existente, validando con Zod.
- [ ] **AC-5:** El endpoint DELETE /api/courses/:id permite a un administrador eliminar un curso, realizando borrado en cascada de modulos, lecciones y datos relacionados.
- [ ] **AC-6:** La respuesta del listado incluye el campo `enrollmentCount` con el numero de usuarios inscritos en cada curso.

### Tecnicos
- [ ] **AC-T1:** Los schemas de validacion para creacion y actualizacion de cursos estan definidos con Zod y se aplican como middleware antes del controlador.
- [ ] **AC-T2:** Las consultas de listado utilizan paginacion a nivel de base de datos (offset/limit en Prisma) y no cargan todos los registros en memoria.
- [ ] **AC-T3:** El borrado en cascada se maneja mediante transacciones de Prisma para garantizar consistencia de datos.
- [ ] **AC-T4:** Los endpoints de escritura (POST, PUT, DELETE) estan protegidos por middleware de autenticacion y autorizacion de rol ADMIN.

### QA
- [ ] **QA-1:** Verificar que un usuario sin rol ADMIN recibe 403 Forbidden al intentar crear, actualizar o eliminar un curso.
- [ ] **QA-2:** Verificar que la paginacion funciona correctamente: parametros por defecto (page=1, limit=10), navegacion entre paginas y respuesta con metadata de paginacion (total, totalPages, currentPage).
- [ ] **QA-3:** Verificar que al eliminar un curso, sus modulos y lecciones asociadas tambien se eliminan de la base de datos.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-008-1 | Definir schemas Zod para createCourse y updateCourse | 0.5h | Alta |
| T-BE-008-2 | Implementar servicio CourseService con metodos CRUD y paginacion | 1.5h | Alta |
| T-BE-008-3 | Implementar controladores para cada endpoint | 1h | Alta |
| T-BE-008-4 | Configurar rutas con middleware de auth y validacion | 0.5h | Alta |
| T-BE-008-5 | Agregar conteo de enrollments en la consulta de listado | 0.5h | Media |

## Notas Tecnicas

### Especificacion de Endpoints

**GET /api/courses**
- Query params: `page` (default: 1), `limit` (default: 10), `search` (string, busca en titulo y descripcion), `isPublic` (boolean)
- Respuesta:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Curso de TypeScript",
      "description": "...",
      "isPublic": true,
      "enrollmentCount": 15,
      "createdAt": "2026-01-01T00:00:00Z",
      "updatedAt": "2026-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 50,
    "totalPages": 5,
    "currentPage": 1,
    "limit": 10
  }
}
```

**GET /api/courses/:id**
- Respuesta incluye modulos con sus lecciones anidadas:
```json
{
  "id": "uuid",
  "title": "Curso de TypeScript",
  "description": "...",
  "isPublic": true,
  "enrollmentCount": 15,
  "modules": [
    {
      "id": "uuid",
      "title": "Modulo 1",
      "order": 1,
      "lessons": [
        { "id": "uuid", "title": "Leccion 1", "order": 1 }
      ]
    }
  ]
}
```

**POST /api/courses** (Admin)
- Body:
```json
{
  "title": "Curso de TypeScript",
  "description": "Aprende TypeScript desde cero",
  "isPublic": false
}
```

**PUT /api/courses/:id** (Admin)
- Body: mismos campos que POST, todos opcionales (partial update).

**DELETE /api/courses/:id** (Admin)
- Respuesta: 204 No Content

### Consideraciones
- Usar `Prisma.$transaction` para el borrado en cascada.
- El campo `search` debe buscar con `contains` (case-insensitive) en `title` y `description`.
- Incluir `_count` de enrollments usando `Prisma include` con `_count.select`.

## Dependencias
- **Depende de:** HU-BE-002 (Autenticacion JWT), HU-BE-007 (Modelo de datos / Prisma schema)
- **Bloquea a:** HU-FE-011 (UI de listado de cursos), HU-FE-015 (UI de detalle de curso), HU-BE-009, HU-BE-011, HU-BE-012, HU-BE-013
