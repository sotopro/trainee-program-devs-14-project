# HU-BE-027: Tests de IA

## Descripcion
Como equipo de desarrollo, queremos tener una suite de tests completa para el modulo de integracion con OpenAI para poder garantizar que la generacion de cursos, contenido, quizzes, recomendaciones y expansion de paths funciona correctamente, incluyendo manejo de errores y edge cases.

La suite combina pruebas unitarias (con mock del SDK de OpenAI) y pruebas de integracion que verifican el flujo completo de cada funcionalidad de IA. Se mockean las llamadas a la API de OpenAI para garantizar tests deterministas y rapidos. Se verifican tanto escenarios exitosos como de error: timeout, rate limit y respuestas malformadas de la IA.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Piero Aguilar |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** Los tests unitarios verifican el AIService con mock del SDK de OpenAI: sendMessage retorna string, generateStructured retorna JSON parseado.
- [ ] **AC-2:** Los tests de integracion verifican la generacion de estructura de cursos: propuesta valida, conversacion de seguimiento y confirmacion con creacion de registros en BD.
- [ ] **AC-3:** Los tests de integracion verifican la generacion de contenido: formato Editor.js valido, proteccion de overwrite y almacenamiento correcto.
- [ ] **AC-4:** Los tests de integracion verifican la generacion de quizzes: estructura de preguntas valida, upsert y rechazo cuando la leccion no tiene contenido.
- [ ] **AC-5:** Los tests de integracion verifican las recomendaciones: generacion de los 3 tipos, cache funcional y retorno desde cache sin llamar a IA.
- [ ] **AC-6:** Los tests de integracion verifican la expansion de paths: creacion de nuevas lecciones con contenido y quiz, insercion en LearningPathLesson.

### Tecnicos
- [ ] **AC-T1:** Todas las llamadas al SDK de OpenAI se mockean con `vi.mock()` de Vitest, retornando respuestas predefinidas.
- [ ] **AC-T2:** Los tests de error verifican: timeout (30s), rate limit de OpenAI (429), respuesta JSON invalida y respuesta que no cumple el schema Zod.
- [ ] **AC-T3:** Los tests de integracion verifican que los registros se crean correctamente en la base de datos (Course, Module, Lesson, Quiz, Recommendation, LearningPathLesson).
- [ ] **AC-T4:** Los tests de prompt templates verifican que los placeholders se reemplazan correctamente con el contexto proporcionado.

### QA
- [ ] **QA-1:** Verificar que los mocks de OpenAI son representativos: las respuestas mockeadas tienen la misma estructura que las respuestas reales de la API.
- [ ] **QA-2:** Verificar que los tests de error cubren todos los tipos de fallo: timeout, rate limit, JSON invalido, schema invalido.
- [ ] **QA-3:** Verificar que los tests de integracion confirman la creacion de registros a nivel de base de datos, no solo la respuesta HTTP.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-027-1 | Escribir tests unitarios para AIService con mock de OpenAI SDK | 0.5h | Alta |
| T-BE-027-2 | Escribir tests unitarios para prompt templates | 0.5h | Alta |
| T-BE-027-3 | Escribir tests de integracion para generacion de cursos (propuesta, chat, confirmacion) | 1h | Alta |
| T-BE-027-4 | Escribir tests de integracion para generacion de contenido Editor.js | 0.5h | Alta |
| T-BE-027-5 | Escribir tests de integracion para generacion de quizzes | 0.5h | Alta |
| T-BE-027-6 | Escribir tests de integracion para recomendaciones y cache | 0.5h | Alta |
| T-BE-027-7 | Escribir tests de integracion para expansion de paths | 0.5h | Alta |

## Notas Tecnicas

### Estructura de Tests

```
tests/
  unit/
    ai/
      ai-service.test.ts
      prompt-templates.test.ts
  integration/
    ai/
      course-generation.test.ts
      content-generation.test.ts
      quiz-generation.test.ts
      recommendations.test.ts
      path-expansion.test.ts
      ai-error-handling.test.ts
```

### Mock del SDK de OpenAI
```typescript
import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock del modulo OpenAI
vi.mock('openai', () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: vi.fn(),
        },
      },
    })),
  };
});

// Helper para configurar respuestas mock
function mockOpenAIResponse(content: string) {
  const mockCreate = vi.mocked(openaiInstance.chat.completions.create);
  mockCreate.mockResolvedValueOnce({
    choices: [{ message: { content }, finish_reason: 'stop' }],
  } as any);
}
```

### Respuestas Mock por Funcionalidad

**Generacion de curso:**
```json
{
  "title": "Curso de Test",
  "description": "Descripcion del curso de test",
  "modules": [
    {
      "title": "Modulo 1",
      "description": "Desc modulo 1",
      "lessons": [
        { "title": "Leccion 1", "contentOutline": "Outline 1" },
        { "title": "Leccion 2", "contentOutline": "Outline 2" }
      ]
    }
  ]
}
```

**Generacion de contenido Editor.js:**
```json
{
  "time": 1700000000000,
  "blocks": [
    { "type": "header", "data": { "text": "Titulo de Test", "level": 2 } },
    { "type": "paragraph", "data": { "text": "Contenido de test..." } }
  ],
  "version": "2.28.0"
}
```

**Generacion de quiz:**
```json
{
  "questions": [
    {
      "question": "Pregunta de test?",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 1,
      "explanation": "Explicacion de test"
    }
  ]
}
```

### Escenarios de Error
| Escenario | Mock | Resultado Esperado |
|-----------|------|-------------------|
| Timeout | `mockCreate.mockRejectedValue(new APITimeoutError())` | 504 Gateway Timeout |
| Rate limit OpenAI | `mockCreate.mockRejectedValue(new RateLimitError())` | 429 Too Many Requests |
| JSON invalido | `mockOpenAIResponse("esto no es JSON")` | 502 Bad Gateway |
| Schema invalido | `mockOpenAIResponse('{"invalid": true}')` | 502 Bad Gateway |
| Respuesta vacia | `mockOpenAIResponse("")` | 502 Bad Gateway |

### Ejemplo de Test - Generacion de Curso Completo
```typescript
describe('Generacion de Curso', () => {
  it('debe generar propuesta, permitir refinamiento y confirmar creacion', async () => {
    // Mock: primera propuesta
    mockOpenAIResponse(JSON.stringify(courseProposal));

    // 1. Generar propuesta
    const proposal = await request.post('/api/ai/generate-course')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ topic: 'TypeScript avanzado' })
      .expect(201);

    const conversationId = proposal.body.conversationId;

    // Mock: propuesta refinada
    mockOpenAIResponse(JSON.stringify(refinedProposal));

    // 2. Refinar con mensaje de seguimiento
    await request.post(`/api/ai/chat/${conversationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ message: 'Agrega un modulo de testing' })
      .expect(200);

    // 3. Confirmar creacion
    const confirmed = await request.post(`/api/ai/confirm-course/${conversationId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(201);

    // 4. Verificar registros en BD
    const course = await prisma.course.findUnique({
      where: { id: confirmed.body.courseId },
      include: { modules: { include: { lessons: true } } },
    });
    expect(course).toBeDefined();
    expect(course!.modules.length).toBeGreaterThanOrEqual(1);
  });
});
```

### Ejemplo de Test - Cache de Recomendaciones
```typescript
describe('Recomendaciones - Cache', () => {
  it('debe retornar recomendaciones desde cache sin llamar a la IA', async () => {
    // Primera llamada: genera y guarda
    mockOpenAIResponse(JSON.stringify(recommendationsResponse));
    const first = await request.get(`/api/ai/recommendations/${lessonId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(first.body.cached).toBe(false);

    // Segunda llamada: desde cache (no mockear, si llama a IA fallara)
    const second = await request.get(`/api/ai/recommendations/${lessonId}`)
      .set('Authorization', `Bearer ${userToken}`)
      .expect(200);
    expect(second.body.cached).toBe(true);
    expect(second.body.recommendations).toEqual(first.body.recommendations);
  });
});
```

### Consideraciones
- Los mocks deben representar fielmente la estructura de respuesta de la API de OpenAI para que los tests sean significativos.
- Usar `vi.spyOn` para verificar que el AIService no llama a OpenAI cuando hay cache.
- Los tests de error deben verificar que los errores se propagan correctamente hasta la respuesta HTTP.
- Para la expansion de paths, verificar que se crean Lesson, Quiz y LearningPathLesson para cada nueva leccion.
- Considerar usar `vi.useFakeTimers()` para tests de rate limiting y timeout.

## Dependencias
- **Depende de:** HU-BE-018 (Servicio OpenAI), HU-BE-019 (Generacion de Cursos), HU-BE-020 (Generacion de Contenido), HU-BE-021 (Generacion de Quizzes), HU-BE-022 (Recomendaciones), HU-BE-023 (Expansion de Paths)
- **Bloquea a:** Ninguna (epic de testing)
