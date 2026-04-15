# HU-BE-025: Tests de Cursos y Contenido

## Descripcion
Como equipo de desarrollo, queremos tener una suite de tests completa para los modulos de cursos, modulos, lecciones, quizzes y asignacion de cursos para poder garantizar que toda la gestion de contenido funciona correctamente, incluyendo operaciones CRUD, paginacion, borrado en cascada y control de acceso.

La suite cubre pruebas de integracion de todos los endpoints de EP-BE-03 (gestion de cursos) y EP-BE-05 (quizzes). Se verifican flujos completos de creacion, lectura, actualizacion y eliminacion, asi como casos borde como borrado en cascada, reordenamiento y acceso no autorizado.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Edgar Chacon |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** Los tests de integracion verifican el CRUD completo de cursos: crear, listar con paginacion y busqueda, obtener detalle con modulos/lecciones, actualizar y eliminar.
- [ ] **AC-2:** Los tests de integracion verifican el CRUD de modulos: crear dentro de un curso, reordenar multiples modulos, y borrado en cascada (eliminar modulo elimina sus lecciones).
- [ ] **AC-3:** Los tests de integracion verifican el CRUD de lecciones: crear con contenido Editor.js, actualizar contenido, reordenar y verificar flag hasQuiz.
- [ ] **AC-4:** Los tests de integracion verifican el CRUD de quizzes: crear quiz para leccion, patron upsert, validacion de estructura y eliminacion.
- [ ] **AC-5:** Los tests de integracion verifican la asignacion de cursos: asignar usuario, prevenir duplicados, listar enrollados y desasignar.

### Tecnicos
- [ ] **AC-T1:** Los tests verifican que los endpoints de escritura (POST, PUT, DELETE) estan protegidos y solo accesibles por administradores.
- [ ] **AC-T2:** Los tests verifican el borrado en cascada: eliminar curso elimina modulos y lecciones; eliminar modulo elimina lecciones.
- [ ] **AC-T3:** Los tests verifican que el reordenamiento (PATCH /reorder) actualiza correctamente los valores de `order` y es atomico.
- [ ] **AC-T4:** Los tests usan datos de prueba representativos y se ejecutan en base de datos aislada.

### QA
- [ ] **QA-1:** Verificar que los tests cubren tanto escenarios exitosos como de error para cada endpoint (200/201, 400, 403, 404, 409).
- [ ] **QA-2:** Verificar que los tests de borrado en cascada confirman la eliminacion a nivel de base de datos (no solo la respuesta HTTP).
- [ ] **QA-3:** Verificar que los tests son independientes y pueden ejecutarse en cualquier orden.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-025-1 | Escribir tests de integracion para CRUD de cursos con paginacion | 1h | Alta |
| T-BE-025-2 | Escribir tests de integracion para CRUD de modulos y reordenamiento | 0.5h | Alta |
| T-BE-025-3 | Escribir tests de integracion para CRUD de lecciones y contenido Editor.js | 0.5h | Alta |
| T-BE-025-4 | Escribir tests de integracion para CRUD de quizzes | 0.5h | Alta |
| T-BE-025-5 | Escribir tests de integracion para asignacion de cursos | 0.5h | Alta |
| T-BE-025-6 | Escribir tests de borrado en cascada (curso->modulos->lecciones) | 0.5h | Alta |
| T-BE-025-7 | Escribir tests de control de acceso admin-only | 0.5h | Media |

## Notas Tecnicas

### Estructura de Tests

```
tests/
  integration/
    courses/
      courses-crud.test.ts
      modules-crud.test.ts
      lessons-crud.test.ts
      quizzes-crud.test.ts
      course-assignment.test.ts
      cascade-delete.test.ts
```

### Escenarios de Test por Endpoint

**Cursos:**
| Escenario | Endpoint | Resultado |
|-----------|----------|-----------|
| Crear curso (admin) | POST /api/courses | 201 |
| Crear curso (user) | POST /api/courses | 403 |
| Listar cursos pagina 1 | GET /api/courses?page=1&limit=5 | 200, 5 items |
| Buscar cursos | GET /api/courses?search=typescript | 200, filtrado |
| Detalle con modulos | GET /api/courses/:id | 200, incluye modules |
| Actualizar curso | PUT /api/courses/:id | 200 |
| Eliminar curso | DELETE /api/courses/:id | 204 |
| Curso no encontrado | GET /api/courses/:invalid-id | 404 |

**Modulos:**
| Escenario | Endpoint | Resultado |
|-----------|----------|-----------|
| Crear modulo | POST /api/courses/:id/modules | 201 |
| Listar modulos ordenados | GET /api/courses/:id/modules | 200, orden correcto |
| Reordenar modulos | PATCH /api/modules/reorder | 200 |
| Eliminar modulo (cascada) | DELETE /api/modules/:id | 204, lecciones eliminadas |

**Lecciones:**
| Escenario | Endpoint | Resultado |
|-----------|----------|-----------|
| Crear leccion con contenido | POST /api/modules/:id/lessons | 201 |
| Obtener leccion con hasQuiz | GET /api/lessons/:id | 200, hasQuiz: true/false |
| Actualizar contenido Editor.js | PUT /api/lessons/:id | 200 |
| Reordenar lecciones | PATCH /api/lessons/reorder | 200 |

**Quizzes:**
| Escenario | Endpoint | Resultado |
|-----------|----------|-----------|
| Crear quiz (upsert nuevo) | POST /api/lessons/:id/quiz | 201 |
| Crear quiz (upsert existente) | POST /api/lessons/:id/quiz | 200 |
| Quiz con estructura invalida | POST /api/lessons/:id/quiz | 400 |
| Eliminar quiz | DELETE /api/quizzes/:id | 204 |

### Ejemplo de Test - Borrado en Cascada
```typescript
describe('Borrado en cascada', () => {
  it('al eliminar un curso, se eliminan sus modulos y lecciones', async () => {
    // Crear curso con modulos y lecciones
    const course = await createTestCourse();
    const module1 = await createTestModule(course.id);
    const lesson1 = await createTestLesson(module1.id);
    const lesson2 = await createTestLesson(module1.id);

    // Eliminar curso
    await request.delete(`/api/courses/${course.id}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(204);

    // Verificar que modulos y lecciones fueron eliminados
    const modules = await prisma.module.findMany({ where: { courseId: course.id } });
    const lessons = await prisma.lesson.findMany({ where: { moduleId: module1.id } });
    expect(modules).toHaveLength(0);
    expect(lessons).toHaveLength(0);
  });
});
```

### Datos de Prueba (Helpers)
```typescript
// tests/helpers/test-data.ts
export async function createTestCourse(overrides = {}) { ... }
export async function createTestModule(courseId: string, overrides = {}) { ... }
export async function createTestLesson(moduleId: string, overrides = {}) { ... }
export async function createTestQuiz(lessonId: string, overrides = {}) { ... }
export async function createAdminToken() { ... }
export async function createUserToken() { ... }
```

### Consideraciones
- Crear helpers reutilizables para generar datos de prueba (cursos, modulos, lecciones, quizzes).
- Usar `beforeAll` para crear usuario admin y usuario regular con sus tokens.
- Verificar borrado en cascada consultando directamente la base de datos con Prisma, no solo la respuesta HTTP.
- Los tests de paginacion requieren crear al menos 15 cursos para verificar multiples paginas.

## Dependencias
- **Depende de:** HU-BE-008 (CRUD de Courses), HU-BE-009 (CRUD de Modules), HU-BE-010 (CRUD de Lessons), HU-BE-016 (CRUD de Quizzes), HU-BE-011 (Asignacion de Cursos)
- **Bloquea a:** Ninguna (epic de testing)
