# HU-FE-018: Learning Paths con useReducer + Context

## Descripción
Como usuario inscrito en un curso, quiero seleccionar y navegar rutas de aprendizaje que pueden bifurcarse para poder personalizar mi experiencia educativa siguiendo el camino que mejor se adapte a mis objetivos.

Los Learning Paths son el corazón diferenciador de LearnPath. Cada curso puede tener múltiples rutas de aprendizaje que se ramifican como un árbol: una ruta principal (main branch) y bifurcaciones (forks) creadas por otros usuarios o sugeridas por la IA. Esta historia implementa un `LearningPathContext` gestionado con `useReducer` que maneja un flujo de estados complejo: IDLE (sin path seleccionado), BROWSING (explorando paths disponibles), STUDYING (estudiando una lección dentro del path), QUIZ (respondiendo un quiz), BRANCHING (creando o seleccionando un fork del path), y COMPLETED (path finalizado). El reducer procesa acciones como SELECT_PATH, START_LESSON, COMPLETE_LESSON, START_QUIZ, SUBMIT_QUIZ, FORK_PATH y NAVIGATE_BACK, manteniendo todo el flujo de estados predecible y debuggable. Se incluye un componente de visualización del árbol de branches para que el usuario pueda ver la estructura de bifurcaciones y seleccionar la ruta deseada.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Jazir Olivera |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #6:** useReducer + Context — Se utiliza `useReducer` para manejar una máquina de estados compleja con múltiples transiciones (7 acciones, 6 estados) que sería difícil de gestionar con `useState` simple. El Context API distribuye el estado y el dispatch a toda la sub-tree de componentes del learning path sin prop drilling.

## Criterios de Aceptación

### Funcionales
- [ ] **AC-1:** Al ingresar a un curso tras la inscripción, se presenta un selector de learning path que muestra las rutas disponibles: la ruta principal y los forks existentes, cada uno con nombre, autor, descripción y porcentaje de diferencia respecto a la ruta principal.
- [ ] **AC-2:** El componente de visualización del árbol de branches muestra gráficamente la estructura de ramificaciones del learning path como un diagrama de árbol interactivo, donde cada nodo representa un punto de bifurcación.
- [ ] **AC-3:** Al seleccionar un learning path, el estado transiciona a STUDYING y se carga la primera lección pendiente (o la última visitada) del path seleccionado.
- [ ] **AC-4:** El usuario puede crear un fork de su path actual en cualquier punto, definiendo un nombre y opcionalmente modificando el orden de las lecciones subsiguientes, transitando al estado BRANCHING durante el proceso.
- [ ] **AC-5:** Al completar todas las lecciones y quizzes del path, el estado transiciona a COMPLETED y se muestra una pantalla de finalización con resumen del progreso y certificado de completación.
- [ ] **AC-6:** El botón "Volver" (NAVIGATE_BACK) permite regresar al estado anterior en cualquier momento, por ejemplo: de QUIZ a STUDYING, o de BRANCHING a BROWSING.

### Técnicos
- [ ] **AC-T1:** Se implementa un `LearningPathContext` con `useReducer` que gestiona el estado `{ status, currentPath, currentLesson, currentQuiz, branchHistory, progress }` y un dispatch tipado con TypeScript para cada acción.
- [ ] **AC-T2:** El reducer `learningPathReducer` maneja las transiciones de estado de forma pura y predecible: cada acción produce un nuevo estado sin mutaciones, y las transiciones inválidas (ej. START_QUIZ desde IDLE) son ignoradas o lanzan un warning en desarrollo.
- [ ] **AC-T3:** El `LearningPathProvider` envuelve las páginas de aprendizaje del curso y expone mediante Context tanto el estado como funciones helper tipadas: `selectPath(pathId)`, `startLesson(lessonId)`, `completeLesson()`, `forkPath(name)`, etc.
- [ ] **AC-T4:** Los datos de learning paths se sincronizan con el backend mediante React Query, donde el reducer maneja el estado local de la UI y las queries/mutations manejan la persistencia.

### QA
- [ ] **QA-1:** Verificar que el flujo completo de estados funciona correctamente: IDLE -> BROWSING (al ver paths) -> STUDYING (al seleccionar) -> QUIZ (al llegar a un quiz) -> STUDYING (al completar quiz) -> COMPLETED (al terminar todas las lecciones).
- [ ] **QA-2:** Comprobar que al crear un fork del path, el nuevo branch aparece en la visualización del árbol y otros usuarios pueden verlo en el selector de paths (si es público).
- [ ] **QA-3:** Validar que la acción NAVIGATE_BACK funciona correctamente en cada estado, regresando al estado anterior sin perder datos de progreso, y que en el estado IDLE el botón de volver no está disponible.

## Tareas

| ID | Tarea | Estimación | Prioridad |
|----|-------|-----------|-----------|
| T-FE-083 | Definir tipos TypeScript para el estado del learning path, acciones del reducer y contexto completo | 0.5h | Alta |
| T-FE-084 | Implementar `learningPathReducer` con todas las transiciones de estado (SELECT_PATH, START_LESSON, COMPLETE_LESSON, START_QUIZ, SUBMIT_QUIZ, FORK_PATH, NAVIGATE_BACK) | 1.5h | Alta |
| T-FE-085 | Crear `LearningPathProvider` con `useReducer` + Context API y funciones helper tipadas expuestas vía custom hook `useLearningPath()` | 1h | Alta |
| T-FE-086 | Desarrollar componente `PathSelector` para selección de learning path con visualización de branches disponibles | 1h | Alta |
| T-FE-087 | Implementar componente `BranchTreeView` para visualización gráfica del árbol de bifurcaciones con interacción | 1h | Media |
| T-FE-088 | Crear flujo de fork: modal de creación, acción FORK_PATH en el reducer, y sincronización con el backend | 1h | Media |

## Notas Técnicas
- El reducer debe implementarse en un archivo separado (`learningPathReducer.ts`) para facilitar testing unitario. Cada case del switch debe retornar un nuevo objeto de estado sin mutaciones.
- Tipos sugeridos para el estado:
  ```typescript
  type LearningPathStatus = 'IDLE' | 'BROWSING' | 'STUDYING' | 'QUIZ' | 'BRANCHING' | 'COMPLETED';
  type LearningPathAction = 
    | { type: 'SELECT_PATH'; payload: { pathId: string } }
    | { type: 'START_LESSON'; payload: { lessonId: string } }
    | { type: 'COMPLETE_LESSON' }
    | { type: 'START_QUIZ'; payload: { quizId: string } }
    | { type: 'SUBMIT_QUIZ'; payload: { answers: Answer[] } }
    | { type: 'FORK_PATH'; payload: { name: string } }
    | { type: 'NAVIGATE_BACK' };
  ```
- Para la visualización del árbol de branches, considerar una librería liviana como `react-d3-tree` o implementar un componente SVG simple con nodos y líneas de conexión.
- El `NAVIGATE_BACK` puede implementarse manteniendo un stack de estados previos (`branchHistory`) y haciendo pop al navegar hacia atrás.
- Es crítico que el Context solo envuelva las páginas de learning path y no toda la aplicación, para evitar re-renders innecesarios en componentes no relacionados.
- Considerar usar `useContext` con selectors o dividir el contexto en `LearningPathStateContext` y `LearningPathDispatchContext` para evitar que componentes que solo necesitan dispatch se re-rendericen cuando cambia el estado.

## Dependencias
- **Depende de:** HU-FE-016 (flujo de inscripción que redirige al learning path), HU-BE-013 (API de learning paths: listar, crear, fork, obtener detalle)
- **Bloquea a:** HU-FE-019 (progreso con optimistic updates se integra con las acciones COMPLETE_LESSON del reducer)
