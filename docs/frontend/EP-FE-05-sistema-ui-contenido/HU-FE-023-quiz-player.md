# HU-FE-023: Quiz Player UI

## Descripción
Como usuario inscrito en un curso, quiero responder quizzes interactivos al final de las lecciones para poder evaluar mi comprensión del material y recibir retroalimentación inmediata sobre mis respuestas.

El Quiz Player es el componente interactivo de evaluación de LearnPath que permite a los usuarios responder preguntas de opción múltiple asociadas a las lecciones del curso. El componente principal `QuizPlayer` soporta dos modos de presentación: secuencial (una pregunta a la vez con navegación anterior/siguiente) y completo (todas las preguntas visibles con scroll). Cada pregunta se renderiza en una `QuestionCard` que muestra el texto de la pregunta, las opciones de respuesta como radio buttons estilizados, y tras responder, revela la explicación de la respuesta correcta con feedback visual (verde para correcta, rojo para incorrecta con animaciones). Al finalizar, el componente `QuizResults` presenta un resumen visual del score con gráfico, desglose de respuestas correctas e incorrectas, y opción de revisar cada pregunta. Opcionalmente, se incluye un temporizador configurable y un indicador de progreso dentro del quiz.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Joshua Rodriguez |
| QA | Daniel Soto |

## Criterios de Aceptación

### Funcionales
- [ ] **AC-1:** El `QuizPlayer` soporta dos modos de presentación: "secuencial" (una pregunta a la vez con botones anterior/siguiente y número de pregunta actual) y "completo" (todas las preguntas visibles en scroll), con un toggle para alternar entre modos antes de iniciar.
- [ ] **AC-2:** Cada `QuestionCard` muestra el texto de la pregunta, las opciones como radio buttons estilizados, y al seleccionar una respuesta y confirmar, muestra feedback visual inmediato: opción correcta resaltada en verde y, si se eligió incorrectamente, la opción seleccionada en rojo junto con la explicación de la respuesta correcta.
- [ ] **AC-3:** El indicador de progreso muestra el avance del quiz: en modo secuencial como "Pregunta 3 de 10" con barra de progreso, y en modo completo como conteo de preguntas respondidas.
- [ ] **AC-4:** Al completar todas las preguntas, se muestra `QuizResults` con: score porcentual con gráfico circular, conteo de correctas vs incorrectas, tiempo total empleado, y un botón "Revisar respuestas" que permite navegar por cada pregunta viendo la respuesta dada y la correcta.
- [ ] **AC-5:** El temporizador opcional se muestra en la parte superior del quiz con formato MM:SS y al agotarse el tiempo, se envían automáticamente las respuestas completadas hasta ese momento.
- [ ] **AC-6:** Las animaciones de feedback incluyen: transición suave al revelar la respuesta correcta, shake sutil en la opción incorrecta, y confetti o animación de celebración al obtener un score perfecto.

### Técnicos
- [ ] **AC-T1:** El estado del quiz se gestiona con `useReducer` local con acciones: START_QUIZ, SELECT_ANSWER, CONFIRM_ANSWER, NEXT_QUESTION, PREV_QUESTION, SUBMIT_QUIZ, REVIEW_MODE, y estado: `{ currentIndex, answers, isSubmitted, isReviewing, startTime }`.
- [ ] **AC-T2:** El componente `QuizPlayer` recibe las props tipadas: `questions: Question[]`, `mode: 'sequential' | 'complete'`, `timeLimit?: number`, `onSubmit: (results: QuizResult) => void` y no gestiona la persistencia de resultados (delegada al componente padre).
- [ ] **AC-T3:** Las animaciones de feedback se implementan con transiciones CSS (`transition` + `transform`) o `framer-motion` para las animaciones más complejas (shake, confetti), manteniendo 60fps.
- [ ] **AC-T4:** El componente es accesible: las opciones de respuesta son navegables por teclado (Tab/Arrow keys), el estado seleccionado se anuncia por screen readers, y el temporizador tiene un `aria-live="polite"`.

### QA
- [ ] **QA-1:** Verificar que al responder todas las preguntas de un quiz de 5 preguntas en modo secuencial, el score se calcula correctamente y el `QuizResults` refleja el desglose exacto de correctas e incorrectas con las explicaciones correspondientes.
- [ ] **QA-2:** Comprobar que el temporizador cuenta regresivamente, que al agotarse se envían las respuestas dadas hasta ese momento, y que las preguntas no respondidas se marcan como incorrectas en los resultados.
- [ ] **QA-3:** Validar que las animaciones de feedback (verde/rojo, shake en incorrecta) se ejecutan fluidamente sin jank visual y que la animación de score perfecto se muestra solo cuando todas las respuestas son correctas.

## Tareas

| ID | Tarea | Estimación | Prioridad |
|----|-------|-----------|-----------|
| T-FE-113 | Implementar reducer del quiz con todas las acciones y tipos TypeScript para estado, acciones y pregunta | 0.5h | Alta |
| T-FE-114 | Crear componente `QuestionCard` con texto de pregunta, opciones como radio buttons, feedback visual y explicación | 1h | Alta |
| T-FE-115 | Desarrollar componente `QuizPlayer` con modos secuencial/completo, navegación y lógica de submit | 1h | Alta |
| T-FE-116 | Implementar componente `QuizResults` con score, gráfico circular, desglose y modo de revisión de respuestas | 1h | Alta |
| T-FE-117 | Crear temporizador configurable con countdown visual, auto-submit al expirar y accesibilidad (aria-live) | 0.5h | Media |
| T-FE-118 | Implementar animaciones de feedback: transiciones CSS para correcto/incorrecto, shake y celebración de score perfecto | 1h | Media |

## Notas Técnicas
- Las preguntas deben seguir la estructura:
  ```typescript
  interface Question {
    id: string;
    text: string;
    options: { id: string; text: string }[];
    correctOptionId: string;
    explanation: string;
  }
  ```
- Para el gráfico circular en `QuizResults`, considerar un SVG simple con `stroke-dasharray` calculado según el porcentaje, evitando dependencias pesadas de gráficos.
- El temporizador debe usar `useRef` para almacenar el `setInterval` y limpiarlo correctamente en el cleanup del `useEffect`, evitando memory leaks al desmontar.
- Para la animación de shake, una clase CSS con `@keyframes shake` aplicada condicionalmente es más performante que JavaScript: `@keyframes shake { 0%, 100% { transform: translateX(0) } 25% { transform: translateX(-5px) } 75% { transform: translateX(5px) } }`.
- La accesibilidad del quiz es importante: los radio buttons deben estar agrupados con `role="radiogroup"`, cada opción con `role="radio"` y `aria-checked`, y el resultado anunciado con `role="alert"`.
- En modo secuencial, considerar prefetch de la siguiente pregunta si las imágenes son parte de las opciones, para carga instantánea al navegar.

## Dependencias
- **Depende de:** HU-FE-001 (setup del proyecto), HU-BE-016 (API de quizzes: obtener preguntas, enviar respuestas)
- **Bloquea a:** HU-FE-018 (el estado QUIZ del learning path reducer integra con QuizPlayer), HU-FE-017 (la vista de lección puede incluir un quiz al final)
