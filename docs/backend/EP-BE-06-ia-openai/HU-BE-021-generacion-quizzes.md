# HU-BE-021: Generacion de Quizzes con IA

## Descripcion
Como administrador, quiero generar quizzes automaticamente a partir del contenido de una leccion para poder evaluar la comprension de los usuarios sin tener que crear las preguntas manualmente.

La IA lee el contenido de la leccion y genera entre 5 y 10 preguntas de opcion multiple con explicaciones detalladas. Las preguntas generadas siguen el formato JSON del modelo Quiz, con enunciado, opciones, respuesta correcta y explicacion. El quiz generado se guarda automaticamente vinculado a la leccion. Si la leccion ya tiene un quiz, se puede regenerar.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Piero Aguilar |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint POST /api/ai/generate-quiz/:lessonId genera un quiz basado en el contenido de la leccion.
- [ ] **AC-2:** El quiz generado contiene entre 5 y 10 preguntas de opcion multiple.
- [ ] **AC-3:** Cada pregunta incluye enunciado, 4 opciones de respuesta, indice de la respuesta correcta y una explicacion detallada.
- [ ] **AC-4:** El quiz se guarda automaticamente vinculado a la leccion mediante el modelo Quiz.
- [ ] **AC-5:** Si la leccion ya tiene un quiz, el endpoint lo reemplaza (comportamiento upsert).
- [ ] **AC-6:** La leccion debe tener contenido generado previamente; si no tiene contenido, se retorna 400 Bad Request.

### Tecnicos
- [ ] **AC-T1:** El prompt del sistema envia el contenido de la leccion (texto plano extraido de los bloques Editor.js) e instruye a la IA a generar preguntas basadas exclusivamente en ese contenido.
- [ ] **AC-T2:** La respuesta de la IA se valida con el schema Zod de quiz questions (mismo schema de HU-BE-016).
- [ ] **AC-T3:** Se implementa extraccion de texto plano de los bloques Editor.js para enviar al prompt de la IA.
- [ ] **AC-T4:** Solo administradores pueden acceder a este endpoint.

### QA
- [ ] **QA-1:** Verificar que las preguntas generadas son relevantes al contenido de la leccion y no contienen informacion inventada fuera del contexto.
- [ ] **QA-2:** Verificar que el quiz generado cumple con el schema Zod: entre 5-10 preguntas, cada una con 4 opciones, correctAnswer valido y explicacion.
- [ ] **QA-3:** Verificar que la regeneracion reemplaza el quiz existente y no crea duplicados.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-021-1 | Disenar prompt template para generacion de quizzes a partir de contenido | 1h | Alta |
| T-BE-021-2 | Implementar funcion de extraccion de texto plano desde bloques Editor.js | 0.5h | Alta |
| T-BE-021-3 | Implementar QuizGenerationService con logica de generacion y upsert | 1h | Alta |
| T-BE-021-4 | Implementar controlador y ruta con middleware de auth ADMIN | 0.5h | Alta |
| T-BE-021-5 | Implementar validacion de contenido existente y manejo de errores | 1h | Media |

## Notas Tecnicas

### Especificacion de Endpoints

**POST /api/ai/generate-quiz/:lessonId** (Admin)
- No requiere body.
- Respuesta (201 Created o 200 OK si reemplaza):
```json
{
  "quizId": "uuid",
  "lessonId": "uuid",
  "questionCount": 7,
  "questions": [
    {
      "question": "Cual de las siguientes es la forma correcta de declarar una variable con tipo string en TypeScript?",
      "options": [
        "var nombre = string('Juan')",
        "let nombre: string = 'Juan'",
        "let nombre = String('Juan')",
        "string nombre = 'Juan'"
      ],
      "correctAnswer": 1,
      "explanation": "En TypeScript, se usa la sintaxis 'let variable: tipo = valor' para declarar variables con anotacion de tipo."
    },
    {
      "question": "Que ocurre cuando se asigna un valor de tipo incorrecto a una variable tipada?",
      "options": [
        "Se convierte automaticamente al tipo correcto",
        "Se genera un error en tiempo de ejecucion",
        "Se genera un error en tiempo de compilacion",
        "No ocurre nada"
      ],
      "correctAnswer": 2,
      "explanation": "TypeScript detecta errores de tipo en tiempo de compilacion, antes de que el codigo se ejecute."
    }
  ],
  "generated": true,
  "replaced": false
}
```

### Extraccion de Texto Plano
```typescript
function extractPlainText(editorContent: EditorJsContent): string {
  return editorContent.blocks
    .map(block => {
      switch (block.type) {
        case 'header':
        case 'paragraph':
          return block.data.text;
        case 'list':
          return block.data.items.join('\n');
        case 'code':
          return `Codigo: ${block.data.code}`;
        default:
          return '';
      }
    })
    .filter(Boolean)
    .join('\n\n');
}
```

### Prompt Template (Extracto)
```
Eres un experto en educacion y evaluacion. A partir del siguiente contenido de leccion,
genera entre 5 y 10 preguntas de opcion multiple.

Contenido de la leccion:
{{lessonContent}}

Para cada pregunta:
1. El enunciado debe ser claro y basado exclusivamente en el contenido proporcionado
2. Proporciona exactamente 4 opciones de respuesta
3. Solo una opcion debe ser correcta (indica su indice basado en 0)
4. Incluye una explicacion detallada de por que la respuesta es correcta
5. Varia la dificultad: incluye preguntas faciles, intermedias y dificiles

Responde en formato JSON...
```

### Consideraciones
- Se extrae texto plano del Editor.js para evitar enviar JSON complejo al prompt.
- Las preguntas deben cubrir los conceptos clave de la leccion con variedad de dificultad.
- El upsert usa la constraint unique de `lessonId` en el modelo Quiz.
- Si la IA genera menos de 5 preguntas, se puede reintentar con un prompt mas explicito.

## Dependencias
- **Depende de:** HU-BE-018 (Setup del Servicio OpenAI), HU-BE-016 (CRUD de Quizzes), HU-BE-020 (Generacion de Contenido)
- **Bloquea a:** HU-BE-023 (Expansion de Learning Paths)
