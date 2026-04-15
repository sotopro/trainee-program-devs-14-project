# HU-BE-017: Evaluacion y Scoring de Quizzes

## Descripcion
Como usuario, quiero enviar mis respuestas a un quiz y recibir mi calificacion con retroalimentacion detallada para poder evaluar mi comprension del contenido de la leccion.

El sistema recibe las respuestas del usuario como un arreglo de objetos con el indice de la pregunta y la respuesta seleccionada. Compara cada respuesta con la respuesta correcta almacenada en el quiz, calcula el puntaje y retorna un reporte detallado con el resultado por pregunta, incluyendo si acerto, cual era la respuesta correcta y la explicacion. El puntaje se guarda en el modelo LessonProgress para que forme parte del tracking de progreso del usuario.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Piero Aguilar |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint POST /api/quizzes/:id/submit recibe un arreglo de respuestas del usuario y retorna el resultado con puntaje.
- [ ] **AC-2:** La respuesta incluye: score (aciertos), total (preguntas), percentage (porcentaje) y un arreglo de resultados por pregunta.
- [ ] **AC-3:** Cada resultado por pregunta incluye: el enunciado, si la respuesta fue correcta, la respuesta correcta y la explicacion.
- [ ] **AC-4:** El puntaje (percentage) se guarda automaticamente en el campo `quizScore` del registro LessonProgress del usuario.
- [ ] **AC-5:** El usuario puede volver a enviar respuestas a un quiz; el puntaje se actualiza con el intento mas reciente.

### Tecnicos
- [ ] **AC-T1:** Se valida con Zod que las respuestas enviadas correspondan a preguntas validas del quiz (questionIndex dentro de rango, selectedAnswer dentro de rango de opciones).
- [ ] **AC-T2:** El calculo del puntaje y la actualizacion de LessonProgress se ejecutan dentro de una transaccion de Prisma.
- [ ] **AC-T3:** Se verifica que el usuario tiene un enrollment activo en el curso al que pertenece la leccion del quiz.
- [ ] **AC-T4:** Se valida que el usuario envie respuestas para todas las preguntas del quiz; si faltan respuestas, se retorna 400 Bad Request.

### QA
- [ ] **QA-1:** Verificar que el calculo del puntaje es correcto: quiz de 5 preguntas con 3 correctas debe retornar score: 3, total: 5, percentage: 60.
- [ ] **QA-2:** Verificar que el puntaje se guarda correctamente en LessonProgress y se refleja en el endpoint de progreso del curso.
- [ ] **QA-3:** Verificar que al reenviar respuestas, el puntaje se actualiza y no se crean registros duplicados.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-017-1 | Definir schema Zod para quiz submission (arreglo de respuestas) | 0.5h | Alta |
| T-BE-017-2 | Implementar QuizEvaluationService con logica de scoring | 1h | Alta |
| T-BE-017-3 | Implementar actualizacion de quizScore en LessonProgress | 0.5h | Alta |
| T-BE-017-4 | Implementar controlador y ruta con middleware de autenticacion | 0.5h | Alta |
| T-BE-017-5 | Implementar generacion de reporte detallado por pregunta | 0.5h | Media |

## Notas Tecnicas

### Especificacion de Endpoints

**POST /api/quizzes/:id/submit** (Autenticado)
- Body:
```json
{
  "answers": [
    { "questionIndex": 0, "selectedAnswer": 1 },
    { "questionIndex": 1, "selectedAnswer": 0 },
    { "questionIndex": 2, "selectedAnswer": 2 },
    { "questionIndex": 3, "selectedAnswer": 1 },
    { "questionIndex": 4, "selectedAnswer": 3 }
  ]
}
```
- Respuesta (200 OK):
```json
{
  "quizId": "uuid",
  "lessonId": "uuid",
  "score": 3,
  "total": 5,
  "percentage": 60.0,
  "results": [
    {
      "questionIndex": 0,
      "question": "Cual es la diferencia entre let y const?",
      "selectedAnswer": 1,
      "correctAnswer": 1,
      "correct": true,
      "explanation": "let permite reasignar el valor..."
    },
    {
      "questionIndex": 1,
      "question": "Que es una interface en TypeScript?",
      "selectedAnswer": 0,
      "correctAnswer": 2,
      "correct": false,
      "explanation": "Una interface define la forma de un objeto..."
    }
  ]
}
```

### Schema Zod para Submission
```typescript
const quizAnswerSchema = z.object({
  questionIndex: z.number().int().min(0),
  selectedAnswer: z.number().int().min(0),
});

const quizSubmissionSchema = z.object({
  answers: z.array(quizAnswerSchema).min(1),
});
```

### Logica de Evaluacion
```typescript
function evaluateQuiz(questions: QuizQuestion[], answers: QuizAnswer[]) {
  let score = 0;
  const results = questions.map((q, index) => {
    const answer = answers.find(a => a.questionIndex === index);
    const correct = answer?.selectedAnswer === q.correctAnswer;
    if (correct) score++;
    return {
      questionIndex: index,
      question: q.question,
      selectedAnswer: answer?.selectedAnswer ?? null,
      correctAnswer: q.correctAnswer,
      correct,
      explanation: q.explanation,
    };
  });
  return { score, total: questions.length, percentage: (score / questions.length) * 100, results };
}
```

### Consideraciones
- El `questionIndex` en las respuestas corresponde al indice de la pregunta en el arreglo `questions` del quiz (basado en 0).
- Si el usuario no responde alguna pregunta, esa pregunta se cuenta como incorrecta.
- El puntaje se almacena como porcentaje (Float) en LessonProgress.quizScore.
- Permitir multiples intentos: siempre se guarda el puntaje mas reciente.

## Dependencias
- **Depende de:** HU-BE-016 (CRUD de Quizzes), HU-BE-015 (Tracking de Progreso)
- **Bloquea a:** HU-BE-026 (Tests de Learning Paths)
