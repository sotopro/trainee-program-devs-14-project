# EP-BE-06: IA / OpenAI Backend

## Descripcion

Esta epica implementa toda la integracion con la API de OpenAI (GPT-4o-mini) para potenciar las funcionalidades de inteligencia artificial de LearnPath. El servicio de IA es el diferenciador principal de la plataforma, permitiendo la generacion automatizada de contenido educativo, la creacion asistida de cursos completos mediante chat conversacional, la generacion de quizzes contextuales y el sistema de recomendaciones personalizadas.

El servicio de OpenAI se implementa como una capa de abstraccion que encapsula todas las interacciones con la API, manejando prompts, tokens, rate limiting, streaming de respuestas y fallback en caso de errores. Se utilizan system prompts especializados para cada tipo de generacion (estructura de curso, contenido de leccion, preguntas de quiz, recomendaciones) que producen respuestas estructuradas en JSON parseables por el sistema.

La funcionalidad de chat conversacional permite a los administradores interactuar con la IA de forma iterativa para refinar la estructura y contenido de los cursos. El sistema mantiene el contexto de la conversacion para que la IA pueda hacer referencia a decisiones anteriores. Las recomendaciones personalizadas analizan el progreso del estudiante, sus cursos completados y el tiempo dedicado para sugerir los proximos pasos mas relevantes en su aprendizaje. Ademas, se implementa la expansion automatica de rutas de aprendizaje donde la IA puede sugerir lecciones complementarias.

## Responsable(s)

| Rol | Nombre |
|-----|--------|
| Desarrollador | Piero Aguilar |
| QA | Daniel Soto |

## Temas React Asociados

No aplica (epica de backend).

## Historias de Usuario

| ID | Titulo | Prioridad | Semana |
|----|--------|-----------|--------|
| HU-BE-018 | Servicio base de OpenAI (abstraccion y configuracion) | Alta | S1 |
| HU-BE-019 | Generacion de estructura de cursos via chat | Alta | S1-S2 |
| HU-BE-020 | Generacion de contenido de lecciones | Alta | S2 |
| HU-BE-021 | Generacion automatica de quizzes | Media | S2 |
| HU-BE-022 | Sistema de recomendaciones personalizadas | Media | S2 |
| HU-BE-023 | Expansion y sugerencias para rutas de aprendizaje | Media | S2 |

### Detalle de Historias

#### HU-BE-018: Servicio base de OpenAI (abstraccion y configuracion)

**Como** desarrollador, **quiero** un servicio abstraccion para interactuar con la API de OpenAI, **para** centralizar la configuracion, el manejo de errores y los prompts en un solo lugar reutilizable por todos los endpoints de IA.

**Criterios de Aceptacion:**
- Clase/modulo `OpenAIService` que encapsula el cliente oficial de OpenAI.
- Configuracion centralizada: API key desde env, modelo (`gpt-4o-mini`), temperatura, max tokens.
- Metodo generico `chat(messages, options)` para enviar conversaciones y recibir respuestas.
- Metodo `chatStream(messages, options)` para respuestas en streaming (SSE).
- Manejo de errores de la API de OpenAI: rate limiting (429), timeout, tokens excedidos, API key invalida.
- Retry automatico con backoff exponencial para errores transitorios (429, 500, 503).
- Logging de todas las llamadas: prompt, tokens usados, latencia, errores.
- Tipos TypeScript para mensajes, opciones y respuestas.
- Metodo helper `parseJSONResponse(response)` para extraer JSON estructurado de respuestas de texto.
- Conteo y logging de tokens consumidos para monitoreo de costos.

#### HU-BE-019: Generacion de estructura de cursos via chat

**Como** administrador, **quiero** poder conversar con la IA para generar la estructura de un curso completo (modulos y lecciones), **para** crear cursos de forma rapida y asistida sin tener que definir toda la estructura manualmente.

**Criterios de Aceptacion:**
- `POST /api/ai/chat` — Endpoint de chat conversacional. Body: `{ message, conversationHistory?, context? }`. Solo admin.
- El system prompt guia a la IA para actuar como un disenador instruccional experto.
- La IA genera estructuras de curso en JSON parseable:
  ```json
  {
    "title": "Curso de...",
    "description": "...",
    "modules": [
      {
        "title": "Modulo 1: ...",
        "description": "...",
        "lessons": [
          { "title": "Leccion 1.1: ...", "type": "TEXT", "estimatedDuration": 15 }
        ]
      }
    ]
  }
  ```
- `POST /api/ai/chat/stream` — Mismo endpoint pero con streaming (SSE) para respuestas largas.
- `POST /api/ai/courses/generate` — Generar y guardar directamente la estructura en la DB. Body: `{ prompt, options? }`.
- El contexto de la conversacion se mantiene enviando el historial de mensajes.
- El admin puede iterar: "Agrega un modulo sobre X", "Divide la leccion Y en dos partes", etc.
- Soporte para streaming de la respuesta al frontend.

#### HU-BE-020: Generacion de contenido de lecciones

**Como** administrador, **quiero** que la IA genere el contenido completo de una leccion basandose en su titulo y contexto del curso, **para** poblar rapidamente las lecciones con contenido educativo de calidad.

**Criterios de Aceptacion:**
- `POST /api/ai/lessons/:lessonId/generate-content` — Generar contenido para una leccion existente. Solo admin.
- El system prompt incluye: titulo de la leccion, contexto del modulo y curso, nivel de dificultad, publico objetivo.
- El contenido se genera en formato JSON compatible con Editor.js (bloques de texto, headers, listas, codigo).
- El contenido generado se puede previsualizar antes de guardar.
- `POST /api/ai/lessons/:lessonId/generate-content/apply` — Guardar el contenido generado en la leccion.
- La IA genera contenido adaptado al nivel de dificultad del curso (principiante, intermedio, avanzado).
- Se incluyen ejemplos de codigo cuando el tema lo requiere.
- El contenido tiene una estructura pedagogica: introduccion, desarrollo, ejemplos, resumen.

#### HU-BE-021: Generacion automatica de quizzes

**Como** administrador, **quiero** que la IA genere quizzes automaticamente basados en el contenido de las lecciones, **para** crear evaluaciones relevantes sin tener que redactar cada pregunta manualmente.

**Criterios de Aceptacion:**
- `POST /api/ai/lessons/:lessonId/generate-quiz` — Generar quiz basado en el contenido de la leccion. Solo admin.
- Body opcional: `{ numberOfQuestions?, types?: ["multiple_choice", "true_false", "short_answer"], difficulty? }`.
- El system prompt incluye el contenido completo de la leccion como contexto.
- La IA genera preguntas en el formato JSON del modelo de Quiz (EP-BE-05).
- Las preguntas cubren los conceptos clave de la leccion.
- Se genera un mix de tipos de preguntas si no se especifica.
- Preview del quiz generado antes de guardarlo.
- `POST /api/ai/lessons/:lessonId/generate-quiz/apply` — Guardar el quiz generado usando los endpoints de EP-BE-05.
- Validacion del JSON generado contra el esquema Zod de quizzes antes de guardarlo.

#### HU-BE-022: Sistema de recomendaciones personalizadas

**Como** estudiante, **quiero** recibir recomendaciones de cursos y lecciones basadas en mi progreso e intereses, **para** descubrir contenido relevante que me ayude a continuar aprendiendo de forma efectiva.

**Criterios de Aceptacion:**
- `GET /api/ai/recommendations/me` — Obtener recomendaciones personalizadas. Requiere autenticacion.
- El sistema analiza:
  - Cursos completados y en progreso del usuario.
  - Categorias y temas en los que el usuario ha mostrado interes.
  - Lecciones completadas y puntuaciones de quizzes.
  - Tiempo dedicado a diferentes temas.
- La IA genera recomendaciones con una razon explicativa:
  ```json
  {
    "recommendations": [
      {
        "courseId": "...",
        "title": "Curso recomendado",
        "reason": "Basado en tu interes en JavaScript, te recomendamos este curso de React",
        "relevanceScore": 0.92
      }
    ]
  }
  ```
- Cache de recomendaciones con TTL de 1 hora (no llamar a OpenAI en cada request).
- Endpoint para descartar una recomendacion: `POST /api/ai/recommendations/:id/dismiss`.
- Maximo 10 recomendaciones por request.
- Fallback a recomendaciones populares si no hay suficiente data del usuario.

#### HU-BE-023: Expansion y sugerencias para rutas de aprendizaje

**Como** estudiante, **quiero** que la IA sugiera lecciones complementarias para expandir mi ruta de aprendizaje, **para** profundizar en los temas que estoy estudiando con contenido adicional relevante.

**Criterios de Aceptacion:**
- `GET /api/ai/learning-paths/:pathId/suggestions` — Obtener sugerencias de expansion para una ruta. Requiere autenticacion.
- El sistema analiza la ruta actual del usuario y sugiere:
  - Lecciones de otros cursos que complementan el tema.
  - Lecciones de refuerzo para temas donde el usuario tuvo bajo puntaje en quizzes.
  - Lecciones avanzadas para temas donde el usuario mostro dominio.
- Las sugerencias incluyen una explicacion de por que se recomiendan.
- `POST /api/ai/learning-paths/:pathId/suggestions/apply` — Agregar las sugerencias seleccionadas a la ruta.
- Cache de sugerencias por ruta con TTL de 2 horas.
- Maximo 5 sugerencias por consulta.

## Dependencias

- **Depende de:** EP-BE-01 (Setup), EP-BE-02 (Autenticacion), EP-BE-03 (Cursos - necesita cursos y lecciones), EP-BE-04 (Learning Paths - necesita progreso y rutas), EP-BE-05 (Quizzes - necesita formato de quiz).
- **Bloquea a:** EP-BE-07 (Testing).

## Definition of Done

- [ ] Servicio base de OpenAI funcional con manejo de errores y retry.
- [ ] Chat conversacional para generacion de estructura de cursos (con streaming).
- [ ] Generacion de contenido de lecciones en formato Editor.js JSON.
- [ ] Generacion automatica de quizzes basados en contenido de lecciones.
- [ ] Sistema de recomendaciones personalizadas con cache.
- [ ] Sugerencias de expansion de rutas de aprendizaje.
- [ ] System prompts optimizados para cada tipo de generacion.
- [ ] Respuestas de la IA parseadas y validadas con Zod antes de almacenar.
- [ ] Streaming de respuestas funcional (SSE).
- [ ] Rate limiting y control de costos (logging de tokens).
- [ ] Manejo de errores de OpenAI (rate limit, timeout, tokens excedidos).
- [ ] Todos los endpoints protegidos con autenticacion apropiada.
- [ ] Tipos TypeScript completos para prompts, respuestas y configuracion.
