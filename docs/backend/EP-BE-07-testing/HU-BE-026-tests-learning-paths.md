# HU-BE-026: Tests de Learning Paths

## Descripcion
Como equipo de desarrollo, queremos tener una suite de tests completa para los modulos de enrollment, learning paths, fork, progreso y evaluacion de quizzes para poder garantizar que todo el flujo de aprendizaje del usuario funciona correctamente de principio a fin.

La suite cubre pruebas de integracion de todos los endpoints de EP-BE-04 (learning paths y enrollment) y la evaluacion de quizzes de EP-BE-05. Se verifican flujos completos de inscripcion, gestion de paths, fork con arbol de ramificaciones, tracking de progreso y submission de quizzes con scoring.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Jazir Olivera |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** Los tests verifican el enrollment: auto-inscripcion en curso publico, rechazo en curso privado, prevencion de duplicados y desinscripcion.
- [ ] **AC-2:** Los tests verifican el CRUD de learning paths: creacion automatica del Main Branch, creacion de paths personalizados y consulta de arbol.
- [ ] **AC-3:** Los tests verifican el fork de paths: copia correcta de lecciones, establecimiento de parentPathId, actualizacion del enrollment al fork.
- [ ] **AC-4:** Los tests verifican el tracking de progreso: marcar leccion completa, calculo de porcentaje, actualizacion de enrollment a COMPLETED.
- [ ] **AC-5:** Los tests verifican la submission de quizzes: calculo de score, guardado en LessonProgress, reenvio con actualizacion de puntaje.

### Tecnicos
- [ ] **AC-T1:** Los tests del arbol de forks verifican la estructura completa: parent -> child -> grandchild con datos correctos.
- [ ] **AC-T2:** Los tests de progreso verifican el calculo con precision: 0%, porcentaje parcial y 100% con cambio de estado.
- [ ] **AC-T3:** Los tests usan una base de datos de prueba aislada con datos pre-cargados representativos (curso con modulos, lecciones y quiz).
- [ ] **AC-T4:** Los tests verifican que la asignacion por admin crea enrollment con learning path por defecto correctamente.

### QA
- [ ] **QA-1:** Verificar que los tests cubren el flujo completo de un usuario: inscripcion -> progreso -> quiz -> completar curso.
- [ ] **QA-2:** Verificar que los tests de fork validan que las lecciones originales no se modifican y que el progreso se preserva.
- [ ] **QA-3:** Verificar que los tests de scoring calculan correctamente el porcentaje con diferentes combinaciones de aciertos.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-026-1 | Escribir tests de integracion para enrollment (self-enroll, admin assign, duplicado) | 0.5h | Alta |
| T-BE-026-2 | Escribir tests de integracion para learning path CRUD y Main Branch automatico | 0.5h | Alta |
| T-BE-026-3 | Escribir tests de integracion para fork de path (copia, parentId, enrollment switch) | 1h | Alta |
| T-BE-026-4 | Escribir tests de integracion para tracking de progreso y calculo de porcentaje | 0.5h | Alta |
| T-BE-026-5 | Escribir tests de integracion para submission de quiz y scoring | 0.5h | Alta |
| T-BE-026-6 | Escribir test de arbol de forks (parent -> child -> grandchild) | 0.5h | Alta |
| T-BE-026-7 | Escribir test de flujo completo: inscripcion -> progreso -> completion | 0.5h | Media |

## Notas Tecnicas

### Estructura de Tests

```
tests/
  integration/
    learning/
      enrollment.test.ts
      learning-paths.test.ts
      fork-path.test.ts
      progress-tracking.test.ts
      quiz-submission.test.ts
      complete-flow.test.ts
```

### Escenarios de Test por Modulo

**Enrollment:**
| Escenario | Endpoint | Resultado |
|-----------|----------|-----------|
| Self-enroll en curso publico | POST /api/courses/:id/enroll | 201 |
| Self-enroll en curso privado | POST /api/courses/:id/enroll | 403 |
| Enroll duplicado | POST /api/courses/:id/enroll | 409 |
| Admin asigna usuario | POST /api/courses/:id/assign | 201, enrollment con path default |
| Desinscripcion | DELETE /api/enrollments/:id | 204 |
| Listar mis enrollments | GET /api/my/enrollments | 200, con progreso |

**Learning Paths:**
| Escenario | Endpoint | Resultado |
|-----------|----------|-----------|
| Main Branch auto-creado | Verificar post-creacion curso | Path con isDefault: true |
| Path personalizado | POST /api/courses/:id/paths | 201 |
| Listar paths con arbol | GET /api/courses/:id/paths | 200, estructura de arbol |
| Detalle de path con lecciones | GET /api/paths/:id | 200, lecciones ordenadas |

**Fork:**
| Escenario | Endpoint | Resultado |
|-----------|----------|-----------|
| Fork de path | POST /api/paths/:id/fork | 201, copia de lecciones |
| Verificar parentPathId | Inspeccion del fork creado | parentPathId correcto |
| Enrollment actualizado | GET /api/enrollments/:id | learningPathId apunta al fork |
| Arbol de forks | GET /api/paths/:id/tree | Estructura parent->child->grandchild |

**Progreso:**
| Escenario | Endpoint | Resultado |
|-----------|----------|-----------|
| Marcar leccion completa | POST /api/lessons/:id/complete | 200, progreso actualizado |
| Completar duplicado (idempotente) | POST /api/lessons/:id/complete | 200, sin duplicados |
| Progreso parcial | GET /api/my/progress/:courseId | percentage correcto |
| Completar todas las lecciones | POST /api/lessons/:id/complete (ultima) | enrollment COMPLETED |

**Quiz Submission:**
| Escenario | Endpoint | Resultado |
|-----------|----------|-----------|
| Submit respuestas correctas | POST /api/quizzes/:id/submit | score: 5/5, 100% |
| Submit respuestas mixtas | POST /api/quizzes/:id/submit | score calculado correctamente |
| Reenvio actualiza puntaje | POST /api/quizzes/:id/submit (2a vez) | puntaje actualizado |

### Ejemplo de Test - Fork Tree
```typescript
describe('Fork Tree', () => {
  it('debe construir el arbol parent -> child -> grandchild', async () => {
    // Setup: curso con path por defecto
    const course = await createTestCourseWithLessons();
    const mainPath = await getDefaultPath(course.id);

    // Fork nivel 1
    const fork1 = await request.post(`/api/paths/${mainPath.id}/fork`)
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(201);

    // Fork nivel 2 (fork del fork)
    const fork2 = await request.post(`/api/paths/${fork1.body.id}/fork`)
      .set('Authorization', `Bearer ${user2Token}`)
      .expect(201);

    // Verificar arbol
    const tree = await request.get(`/api/paths/${mainPath.id}/tree`)
      .set('Authorization', `Bearer ${user1Token}`)
      .expect(200);

    expect(tree.body.children).toHaveLength(1);
    expect(tree.body.children[0].id).toBe(fork1.body.id);
    expect(tree.body.children[0].children).toHaveLength(1);
    expect(tree.body.children[0].children[0].id).toBe(fork2.body.id);
  });
});
```

### Ejemplo de Test - Flujo Completo
```typescript
describe('Flujo completo de aprendizaje', () => {
  it('inscripcion -> completar lecciones -> quiz -> enrollment COMPLETED', async () => {
    // 1. Inscribirse
    const enrollment = await request.post(`/api/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(201);

    // 2. Completar lecciones
    for (const lesson of lessons) {
      await request.post(`/api/lessons/${lesson.id}/complete`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
    }

    // 3. Enviar quiz
    await request.post(`/api/quizzes/${quizId}/submit`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ answers: [...] })
      .expect(200);

    // 4. Verificar enrollment COMPLETED
    const updated = await request.get(`/api/enrollments/${enrollment.body.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(updated.body.status).toBe('COMPLETED');
    expect(updated.body.progress).toBe(100);
  });
});
```

### Consideraciones
- Crear un helper `createTestCourseWithLessons()` que genere un curso completo con modulos, lecciones, quiz y learning path por defecto.
- Los tests de fork requieren al menos 2 usuarios registrados.
- Verificar que el progreso se calcula contra las lecciones del learning path del usuario, no todas las lecciones del curso.
- Los tests del arbol de forks deben verificar que los datos de cada nodo (id, name, parentPathId, lessonCount) son correctos.

## Dependencias
- **Depende de:** HU-BE-012 (Enrollment), HU-BE-013 (Learning Paths), HU-BE-014 (Fork), HU-BE-015 (Progreso), HU-BE-017 (Evaluacion de Quizzes)
- **Bloquea a:** Ninguna (epic de testing)
