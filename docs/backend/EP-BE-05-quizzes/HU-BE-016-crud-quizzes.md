# HU-BE-016: CRUD de Quizzes

## Descripcion
Como administrador, quiero gestionar quizzes asociados a lecciones para poder evaluar la comprension de los usuarios sobre el contenido de cada leccion.

Cada leccion puede tener un unico quiz asociado (relacion uno-a-uno). El quiz contiene un arreglo de preguntas en formato JSON, donde cada pregunta tiene el enunciado, opciones de respuesta, indice de la respuesta correcta y una explicacion. El sistema debe validar la estructura del quiz con Zod y soportar un patron de upsert (crear o actualizar si ya existe).

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Edgar Chacon |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint GET /api/lessons/:lessonId/quiz devuelve el quiz asociado a una leccion, o 404 si no tiene quiz.
- [ ] **AC-2:** El endpoint POST /api/lessons/:lessonId/quiz permite crear un quiz para una leccion que no tiene uno; si ya existe, lo actualiza (upsert).
- [ ] **AC-3:** El endpoint PUT /api/quizzes/:id permite actualizar las preguntas de un quiz existente.
- [ ] **AC-4:** El endpoint DELETE /api/quizzes/:id permite eliminar un quiz.
- [ ] **AC-5:** Cada pregunta del quiz contiene: question (enunciado), options (arreglo de opciones), correctAnswer (indice de la respuesta correcta) y explanation (explicacion).
- [ ] **AC-6:** El quiz debe tener entre 1 y 20 preguntas, cada pregunta debe tener entre 2 y 6 opciones, y correctAnswer debe ser un indice valido.

### Tecnicos
- [ ] **AC-T1:** El schema Zod valida la estructura completa del quiz: arreglo de preguntas, cada una con question (string), options (string[], min 2, max 6), correctAnswer (number, indice valido) y explanation (string).
- [ ] **AC-T2:** El campo `questions` se almacena como JSON (JSONB en PostgreSQL) en el modelo Quiz de Prisma.
- [ ] **AC-T3:** El patron upsert se implementa verificando si la leccion ya tiene quiz y decidiendo entre crear o actualizar.
- [ ] **AC-T4:** Los endpoints de escritura estan protegidos con middleware de autenticacion y autorizacion de rol ADMIN.

### QA
- [ ] **QA-1:** Verificar que la validacion Zod rechaza quizzes con estructura invalida: preguntas sin opciones, correctAnswer fuera de rango, quiz vacio.
- [ ] **QA-2:** Verificar que el patron upsert funciona correctamente: POST crea si no existe y actualiza si ya existe.
- [ ] **QA-3:** Verificar que el quiz se almacena y recupera con la estructura JSON intacta, sin perdida de datos.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-016-1 | Definir schema Zod para quiz questions con validaciones detalladas | 0.5h | Alta |
| T-BE-016-2 | Implementar QuizService con CRUD y logica de upsert | 1h | Alta |
| T-BE-016-3 | Implementar controladores para los cuatro endpoints | 0.5h | Alta |
| T-BE-016-4 | Configurar rutas con middleware de auth ADMIN | 0.5h | Alta |
| T-BE-016-5 | Implementar validacion de correctAnswer contra longitud de options | 0.5h | Media |

## Notas Tecnicas

### Especificacion de Endpoints

**GET /api/lessons/:lessonId/quiz**
- Respuesta:
```json
{
  "id": "uuid-quiz",
  "lessonId": "uuid",
  "questions": [
    {
      "question": "Cual es la diferencia entre let y const en TypeScript?",
      "options": [
        "No hay diferencia",
        "let permite reasignacion, const no",
        "const permite reasignacion, let no",
        "Ambos permiten reasignacion"
      ],
      "correctAnswer": 1,
      "explanation": "let permite reasignar el valor de la variable, mientras que const crea una referencia inmutable."
    }
  ],
  "questionCount": 5,
  "createdAt": "2026-01-01T00:00:00Z",
  "updatedAt": "2026-01-01T00:00:00Z"
}
```

**POST /api/lessons/:lessonId/quiz** (Admin - Upsert)
- Body:
```json
{
  "questions": [
    {
      "question": "Cual es la diferencia entre let y const?",
      "options": ["No hay diferencia", "let permite reasignacion, const no", "const permite reasignacion", "Ambos permiten reasignacion"],
      "correctAnswer": 1,
      "explanation": "let permite reasignar el valor..."
    }
  ]
}
```
- Respuesta: 201 Created (nuevo) o 200 OK (actualizado).

**PUT /api/quizzes/:id** (Admin)
- Body: mismo formato que POST.

**DELETE /api/quizzes/:id** (Admin)
- Respuesta: 204 No Content

### Schema Zod de Quiz Questions
```typescript
const quizQuestionSchema = z.object({
  question: z.string().min(10, "La pregunta debe tener al menos 10 caracteres"),
  options: z.array(z.string().min(1)).min(2).max(6),
  correctAnswer: z.number().int().min(0),
  explanation: z.string().min(10, "La explicacion debe tener al menos 10 caracteres"),
});

const quizSchema = z.object({
  questions: z.array(quizQuestionSchema).min(1).max(20),
});
```
- Se debe agregar una validacion personalizada con `.refine()` para verificar que `correctAnswer < options.length`.

### Consideraciones
- La relacion Quiz-Lesson es uno-a-uno; usar constraint unique en `lessonId`.
- Al eliminar un quiz, considerar que puede haber registros de quiz scores en LessonProgress que referencian este quiz.
- El campo `questionCount` en la respuesta se calcula dinamicamente desde el arreglo de questions.

## Dependencias
- **Depende de:** HU-BE-010 (CRUD de Lessons)
- **Bloquea a:** HU-BE-017 (Evaluacion de Quizzes), HU-BE-021 (Generacion de Quizzes con IA)
