# HU-FE-031: Tests de Experiencia de Aprendizaje

## Descripcion
Como equipo de desarrollo, quiero contar con una suite completa de tests unitarios e integracion para el modulo de experiencia de aprendizaje, para asegurar que los flujos de inscripcion, progreso de lecciones y actualizaciones optimistas funcionan correctamente.

La suite de tests del modulo de aprendizaje cubre dos niveles criticos. A nivel unitario, se testea el `learningPathReducer` con todas sus transiciones de estado posibles (inscribirse, iniciar leccion, completar leccion, pausar, reanudar, completar ruta) y el hook `useEnrollment` que maneja la logica de inscripcion a cursos. A nivel de integracion, se testean los flujos completos de usuario: el flujo de inscripcion (click en "Inscribirme" seguido de confirmacion y redireccion a la primera leccion), y el patron de actualizacion optimista donde al marcar una leccion como completada, la UI se actualiza inmediatamente antes de que la API responda, y si la API falla, el estado se revierte automaticamente (rollback). Tambien se verifica la integracion correcta de `useReducer` con Context, dispatching acciones y verificando que los cambios de estado se propagan correctamente a los componentes hijos.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Jazir Olivera |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #15:** Testing (Vitest/RTL) — Esta historia aplica testing de patrones avanzados de estado con `useReducer`, Context API y actualizaciones optimistas, demostrando como testear flujos asincrono-complejos con rollback.

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** Existen tests unitarios para el `learningPathReducer` que cubren todas las transiciones de estado: ENROLL, START_LESSON, COMPLETE_LESSON, PAUSE_PATH, RESUME_PATH, COMPLETE_PATH, y transiciones invalidas que no modifican el estado.
- [ ] **AC-2:** Existen tests unitarios para el hook `useEnrollment` que verifican: inscripcion exitosa retorna datos actualizados, inscripcion duplicada retorna error, y estados de carga durante la operacion.
- [ ] **AC-3:** Existe un test de integracion que simula el flujo completo de inscripcion: el usuario hace clic en "Inscribirme", aparece un dialogo de confirmacion, confirma, y es redirigido a la primera leccion del curso.
- [ ] **AC-4:** Existe un test de integracion para la actualizacion optimista: al marcar una leccion como completada, la UI muestra inmediatamente el checkmark antes de que la API responda.
- [ ] **AC-5:** Existe un test de integracion para el rollback optimista: si la API falla al marcar la leccion como completada, la UI revierte automaticamente al estado anterior (sin checkmark).
- [ ] **AC-6:** Existen tests que verifican la propagacion de estado via Context: al hacer dispatch de una accion desde un componente hijo, el estado actualizado se refleja en otros componentes que consumen el mismo Context.

### Tecnicos
- [ ] **AC-T1:** Los tests del reducer son funciones puras testeadas sin necesidad de renderizar componentes, usando `expect(reducer(initialState, action)).toEqual(expectedState)`.
- [ ] **AC-T2:** Los tests de actualizacion optimista usan `vi.mock` o MSW para simular respuestas lentas de la API (con delays controlados) y respuestas con error para verificar el rollback.
- [ ] **AC-T3:** Los tests de Context usan un componente wrapper de test que provee el Context y componentes hijos que lo consumen para verificar la propagacion de estado.
- [ ] **AC-T4:** Todos los tests limpian el estado de la aplicacion (stores, localStorage, query cache) en `beforeEach` para garantizar aislamiento completo.

### QA
- [ ] **QA-1:** La cobertura de tests del modulo de aprendizaje (`src/modules/learning/`) alcanza al menos 80% en lineas y ramas.
- [ ] **QA-2:** El test de rollback optimista demuestra que la UI vuelve al estado anterior en menos de 1 segundo despues del error de la API.
- [ ] **QA-3:** Al cambiar la logica del reducer (por ejemplo, alterar la transicion COMPLETE_LESSON), al menos un test unitario falla inmediatamente.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-213 | Escribir tests unitarios para todas las transiciones del `learningPathReducer` | 0.75h | Alta |
| T-FE-214 | Escribir tests unitarios para el hook `useEnrollment` con `renderHook` | 0.5h | Alta |
| T-FE-215 | Configurar mocks de API para endpoints de learning paths y enrollment | 0.5h | Alta |
| T-FE-216 | Escribir test de integracion para el flujo completo de inscripcion | 0.75h | Alta |
| T-FE-217 | Escribir test de integracion para actualizacion optimista (marcar leccion completa) | 0.75h | Alta |
| T-FE-218 | Escribir test de integracion para rollback optimista (error de API) | 0.5h | Alta |
| T-FE-219 | Escribir tests de propagacion de estado via Context con componentes de test | 0.25h | Media |

## Notas Tecnicas
- Para testear el reducer de forma aislada:
  ```typescript
  describe('learningPathReducer', () => {
    it('debe marcar leccion como completada', () => {
      const state = { ...initialState, currentLessonId: 'lesson-1' };
      const action = { type: 'COMPLETE_LESSON', payload: { lessonId: 'lesson-1' } };
      const newState = learningPathReducer(state, action);
      expect(newState.completedLessons).toContain('lesson-1');
    });
  });
  ```
- Para testear actualizacion optimista con React Query:
  ```typescript
  // Configurar un mock que tarda en responder
  server.use(
    http.patch('/api/progress/:lessonId', async () => {
      await delay(1000);
      return HttpResponse.json({ success: true });
    })
  );
  // Verificar que la UI se actualiza ANTES de que el mock responda
  await userEvent.click(screen.getByText('Marcar como completada'));
  expect(screen.getByTestId('lesson-complete-icon')).toBeInTheDocument();
  ```
- Para testear rollback, configurar el mock para devolver error y verificar que el icono de completado desaparece.
- Usar `MemoryRouter` con `initialEntries` para testear redirecciones en el flujo de inscripcion.
- Los tests de Context pueden usar un componente `TestConsumer` que muestra el estado actual del Context para facilitar las verificaciones.

## Dependencias
- **Depende de:** HU-FE-015 (Enrollment Flow), HU-FE-016 (Learning Path View), HU-FE-017 (Lesson View)
- **Bloquea a:** Ninguna
