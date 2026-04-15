# HU-BE-023: Expansion de Learning Paths

## Descripcion
Como usuario, quiero expandir mi learning path forkeado seleccionando una recomendacion para que la IA genere nuevas lecciones sobre ese tema, permitiendo que mi ruta de aprendizaje crezca de forma organica.

Esta funcionalidad es el nucleo de la propuesta de valor de LearnPath: el contenido crece organicamente a medida que los usuarios exploran recomendaciones. Al seleccionar una recomendacion, la IA genera entre 1 y 3 nuevas lecciones sobre ese tema, incluyendo contenido en formato Editor.js y quiz para cada una. Las nuevas lecciones se agregan al learning path forkeado del usuario, extendiendo su ruta de aprendizaje personalizada.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Piero Aguilar |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint POST /api/ai/expand-path/:pathId recibe un `recommendationId` y genera nuevas lecciones basadas en esa recomendacion.
- [ ] **AC-2:** La IA genera entre 1 y 3 nuevas lecciones con titulo, contenido Editor.js y quiz para cada una.
- [ ] **AC-3:** Las nuevas lecciones se agregan al final del learning path del usuario en la tabla LearningPathLesson.
- [ ] **AC-4:** Solo se puede expandir un learning path forkeado (no el path por defecto ni paths de otros usuarios).
- [ ] **AC-5:** El endpoint retorna las nuevas lecciones creadas con su contenido y quiz.
- [ ] **AC-6:** El progreso del usuario se recalcula para reflejar las nuevas lecciones (el total aumenta, el porcentaje puede disminuir).

### Tecnicos
- [ ] **AC-T1:** La generacion de lecciones, contenido y quizzes se ejecuta en una unica transaccion de Prisma para garantizar consistencia.
- [ ] **AC-T2:** Se verifica que el path pertenece al usuario autenticado y que es un fork (tiene parentPathId).
- [ ] **AC-T3:** Se valida que el recommendationId existe y pertenece a una leccion del path del usuario.
- [ ] **AC-T4:** La generacion reutiliza los servicios de HU-BE-020 (contenido) y HU-BE-021 (quiz) internamente.

### QA
- [ ] **QA-1:** Verificar que las nuevas lecciones se crean correctamente en la base de datos con contenido Editor.js valido y quiz vinculado.
- [ ] **QA-2:** Verificar que las lecciones se agregan al final del learning path con orden correcto (continuando desde el ultimo orden existente).
- [ ] **QA-3:** Verificar que no se puede expandir el path por defecto ni un path que no pertenece al usuario (403 Forbidden).

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-023-1 | Disenar prompt template para generacion de lecciones a partir de recomendaciones | 1h | Alta |
| T-BE-023-2 | Implementar PathExpansionService que orquesta la generacion de lecciones, contenido y quizzes | 1.5h | Alta |
| T-BE-023-3 | Implementar logica de insercion de nuevas lecciones en el LearningPathLesson | 0.5h | Alta |
| T-BE-023-4 | Implementar validaciones de propiedad del path y tipo fork | 0.5h | Alta |
| T-BE-023-5 | Implementar controlador y ruta con middleware de autenticacion | 0.5h | Alta |
| T-BE-023-6 | Implementar recalculo de progreso post-expansion | 1h | Media |

## Notas Tecnicas

### Especificacion de Endpoints

**POST /api/ai/expand-path/:pathId** (Autenticado, propietario del fork)
- Body:
```json
{
  "recommendationId": "uuid-de-la-recomendacion"
}
```
- Respuesta (201 Created):
```json
{
  "pathId": "uuid",
  "pathName": "Main Branch - Fork de Juan",
  "newLessons": [
    {
      "id": "uuid-new-lesson-1",
      "title": "Template Literal Types: Fundamentos",
      "order": 11,
      "content": { "time": 1700000000000, "blocks": [...], "version": "2.28.0" },
      "quiz": {
        "id": "uuid-quiz",
        "questionCount": 5
      }
    },
    {
      "id": "uuid-new-lesson-2",
      "title": "Template Literal Types: Patrones Avanzados",
      "order": 12,
      "content": { "time": 1700000000000, "blocks": [...], "version": "2.28.0" },
      "quiz": {
        "id": "uuid-quiz-2",
        "questionCount": 6
      }
    }
  ],
  "updatedProgress": {
    "completedLessons": 5,
    "totalLessons": 12,
    "percentage": 41.7
  }
}
```

### Flujo de Expansion
1. Validar que el path pertenece al usuario y es un fork.
2. Obtener la recomendacion y extraer el tema/contexto.
3. Generar estructura de 1-3 nuevas lecciones con la IA (titulos y esquemas).
4. Para cada leccion:
   a. Crear el registro Lesson en la base de datos.
   b. Generar contenido Editor.js y guardarlo (reutilizando ContentGenerationService).
   c. Generar quiz y guardarlo (reutilizando QuizGenerationService).
   d. Crear entrada en LearningPathLesson con el orden correcto.
5. Recalcular progreso del usuario.
6. Retornar las nuevas lecciones creadas.

### Prompt Template (Extracto)
```
Eres un experto en educacion. A partir de la siguiente recomendacion, genera entre 1 y 3 lecciones
nuevas que expandan el conocimiento del estudiante sobre este tema.

Contexto del curso: {{courseTitle}}
Modulo actual: {{moduleTitle}}
Leccion origen: {{originLessonTitle}}
Recomendacion: {{recommendationContent}}
Tipo de recomendacion: {{recommendationType}}

Para cada leccion genera:
1. Un titulo descriptivo y conciso
2. Un esquema de contenido detallado

Responde en formato JSON...
```

### Consideraciones
- Este es el endpoint mas complejo del sistema ya que orquesta multiples generaciones de IA en secuencia.
- Para optimizar el tiempo de respuesta, considerar generar contenido y quiz en paralelo para cada leccion usando `Promise.all`.
- Las nuevas lecciones se crean en el contexto del modulo de la leccion origen de la recomendacion.
- Si alguna generacion falla (contenido o quiz), la transaccion hace rollback y se retorna error.
- El tiempo de respuesta puede ser alto (>30s) por multiples llamadas a la IA; considerar un patron de job asincrono para futuras versiones.
- La leccion se vincula al modulo de la leccion que origino la recomendacion.

## Dependencias
- **Depende de:** HU-BE-018 (Setup del Servicio OpenAI), HU-BE-014 (Fork de Learning Path), HU-BE-020 (Generacion de Contenido), HU-BE-021 (Generacion de Quizzes)
- **Bloquea a:** HU-BE-014 (Fork de Learning Path - dependencia circular, desarrollar con contratos definidos)
