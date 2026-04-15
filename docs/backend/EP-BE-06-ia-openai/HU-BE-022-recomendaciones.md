# HU-BE-022: Motor de Recomendaciones

## Descripcion
Como usuario, quiero recibir recomendaciones personalizadas al completar una leccion para poder explorar temas relacionados, profundizar en conceptos y descubrir recursos adicionales de aprendizaje.

El motor de recomendaciones genera tres tipos de sugerencias basadas en el contenido de la leccion y el progreso del usuario: preguntas para explorar mas a fondo (QUESTION), temas relacionados (TOPIC) y recursos de lectura sugeridos (RESOURCE). Las recomendaciones se almacenan en el modelo Recommendation y se comparten entre usuarios para la misma leccion, evitando regeneraciones innecesarias.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Piero Aguilar |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint GET /api/ai/recommendations/:lessonId genera y retorna recomendaciones basadas en el contenido de la leccion.
- [ ] **AC-2:** Las recomendaciones incluyen tres tipos: QUESTION (preguntas para profundizar), TOPIC (temas relacionados) y RESOURCE (recursos de lectura).
- [ ] **AC-3:** Cada recomendacion contiene: type, content (texto descriptivo) y metadata (informacion adicional segun el tipo).
- [ ] **AC-4:** Las recomendaciones se almacenan en cache en el modelo Recommendation; si ya existen para la leccion, se retornan sin regenerar.
- [ ] **AC-5:** Las recomendaciones son compartidas entre usuarios para la misma leccion (no son personalizadas por usuario individual).

### Tecnicos
- [ ] **AC-T1:** Antes de generar, se consulta si ya existen recomendaciones para la leccion; si existen, se retornan directamente desde la base de datos.
- [ ] **AC-T2:** La generacion usa el contenido de la leccion y el contexto del curso/modulo para producir recomendaciones relevantes.
- [ ] **AC-T3:** La respuesta de la IA se valida con un schema Zod que verifica la estructura de cada tipo de recomendacion.
- [ ] **AC-T4:** El endpoint esta protegido con middleware de autenticacion (cualquier usuario autenticado puede acceder).

### QA
- [ ] **QA-1:** Verificar que las recomendaciones incluyen al menos una de cada tipo (QUESTION, TOPIC, RESOURCE).
- [ ] **QA-2:** Verificar que la cache funciona: la segunda llamada al mismo lessonId retorna las mismas recomendaciones sin llamar a la IA.
- [ ] **QA-3:** Verificar que las recomendaciones son relevantes al contenido de la leccion.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-022-1 | Disenar prompt template para generacion de recomendaciones por tipo | 1h | Alta |
| T-BE-022-2 | Definir schema Zod para la estructura de recomendaciones | 0.5h | Alta |
| T-BE-022-3 | Implementar RecommendationService con logica de cache y generacion | 1h | Alta |
| T-BE-022-4 | Implementar controlador y ruta con middleware de autenticacion | 0.5h | Alta |
| T-BE-022-5 | Implementar logica de almacenamiento y consulta de cache en Recommendation | 1h | Media |

## Notas Tecnicas

### Especificacion de Endpoints

**GET /api/ai/recommendations/:lessonId** (Autenticado)
- Respuesta (200 OK):
```json
{
  "lessonId": "uuid",
  "cached": false,
  "recommendations": [
    {
      "id": "uuid",
      "type": "QUESTION",
      "content": "Como se comportan los tipos genericos cuando se combinan con conditional types?",
      "metadata": {
        "difficulty": "avanzado",
        "relatedConcepts": ["Generics", "Conditional Types"]
      }
    },
    {
      "id": "uuid",
      "type": "QUESTION",
      "content": "Que ventajas tiene usar mapped types sobre definir interfaces manualmente?",
      "metadata": {
        "difficulty": "intermedio",
        "relatedConcepts": ["Mapped Types", "Interfaces"]
      }
    },
    {
      "id": "uuid",
      "type": "TOPIC",
      "content": "Template Literal Types en TypeScript",
      "metadata": {
        "description": "Explora como TypeScript permite crear tipos basados en template strings",
        "relevance": "alta"
      }
    },
    {
      "id": "uuid",
      "type": "TOPIC",
      "content": "Patrones de diseno con tipos avanzados",
      "metadata": {
        "description": "Aprende patrones como Builder, Factory y Strategy usando el sistema de tipos",
        "relevance": "media"
      }
    },
    {
      "id": "uuid",
      "type": "RESOURCE",
      "content": "TypeScript Handbook - Generics",
      "metadata": {
        "url": "https://www.typescriptlang.org/docs/handbook/2/generics.html",
        "type": "documentacion_oficial"
      }
    },
    {
      "id": "uuid",
      "type": "RESOURCE",
      "content": "Total TypeScript - Advanced Patterns",
      "metadata": {
        "url": "https://www.totaltypescript.com/tutorials",
        "type": "tutorial"
      }
    }
  ]
}
```

### Modelo Recommendation
```
Recommendation {
  id        String   @id @default(uuid())
  lessonId  String
  type      String   // "QUESTION", "TOPIC", "RESOURCE"
  content   String
  metadata  Json
  createdAt DateTime @default(now())
}
```

### Schema Zod de Recomendaciones
```typescript
const recommendationSchema = z.object({
  type: z.enum(['QUESTION', 'TOPIC', 'RESOURCE']),
  content: z.string().min(10),
  metadata: z.record(z.unknown()),
});

const recommendationsResponseSchema = z.object({
  recommendations: z.array(recommendationSchema).min(3),
});
```

### Prompt Template (Extracto)
```
Eres un experto en educacion y curaduria de contenido. A partir del contenido de la siguiente leccion,
genera recomendaciones para que el estudiante profundice en su aprendizaje.

Curso: {{courseTitle}}
Modulo: {{moduleTitle}}
Leccion: {{lessonTitle}}
Contenido: {{lessonContent}}

Genera exactamente:
- 2 preguntas para explorar (tipo QUESTION) con dificultad variada
- 2 temas relacionados (tipo TOPIC) para expandir conocimiento
- 2 recursos de lectura (tipo RESOURCE) con URLs reales de documentacion oficial o tutoriales reconocidos

Formato JSON...
```

### Consideraciones
- Las recomendaciones se cachean por leccion (no por usuario) ya que el contenido es el mismo para todos.
- El flag `cached` en la respuesta indica si las recomendaciones vinieron de cache o fueron generadas.
- Las URLs en recomendaciones tipo RESOURCE deben ser de fuentes conocidas y estables (documentacion oficial, MDN, etc.).
- Para futuras versiones, se podria personalizar las recomendaciones segun el progreso del usuario.
- Las recomendaciones tipo TOPIC son las que alimentan la expansion de learning paths (HU-BE-023).

## Dependencias
- **Depende de:** HU-BE-018 (Setup del Servicio OpenAI), HU-BE-015 (Tracking de Progreso)
- **Bloquea a:** HU-BE-023 (Expansion de Learning Paths)
