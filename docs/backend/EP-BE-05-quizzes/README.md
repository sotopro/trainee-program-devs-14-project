# EP-BE-05: Quizzes Backend

## Descripcion

Esta epica implementa el sistema de quizzes (evaluaciones) del backend de LearnPath. Los quizzes son un componente educativo fundamental que permite a los estudiantes poner a prueba sus conocimientos despues de completar lecciones o modulos. El sistema soporta multiples tipos de preguntas y proporciona evaluacion automatica con retroalimentacion inmediata.

Los quizzes se asocian a lecciones individuales y pueden ser generados manualmente por el administrador o automaticamente por el sistema de IA (EP-BE-06). Cada quiz contiene un conjunto de preguntas de distintos tipos: opcion multiple, verdadero/falso y respuesta corta. El sistema de evaluacion calcula el puntaje automaticamente para preguntas objetivas y almacena los intentos del estudiante para analisis posterior.

La estructura de datos de los quizzes utiliza JSON para almacenar las preguntas y opciones de forma flexible, permitiendo que la IA genere quizzes con estructuras variadas sin necesidad de migraciones de base de datos. El sistema de puntuacion pondera las preguntas segun su dificultad y proporciona un puntaje normalizado a 100.

## Responsable(s)

| Rol | Nombre |
|-----|--------|
| Desarrollador | Edgar Chacon |
| Desarrollador | Piero Aguilar |
| QA | Daniel Soto |

## Temas React Asociados

No aplica (epica de backend).

## Historias de Usuario

| ID | Titulo | Prioridad | Semana |
|----|--------|-----------|--------|
| HU-BE-016 | CRUD de quizzes y preguntas | Alta | S2 |
| HU-BE-017 | Evaluacion y puntuacion de quizzes | Alta | S2 |

### Detalle de Historias

#### HU-BE-016: CRUD de quizzes y preguntas

**Como** administrador, **quiero** endpoints para crear, ver, editar y eliminar quizzes asociados a lecciones, **para** agregar evaluaciones al contenido educativo de los cursos.

**Criterios de Aceptacion:**
- `POST /api/lessons/:lessonId/quizzes` — Crear quiz. Body:
  ```json
  {
    "title": "Quiz de Introduccion",
    "questions": [
      {
        "type": "multiple_choice",
        "text": "Pregunta...",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0,
        "points": 10
      },
      {
        "type": "true_false",
        "text": "Afirmacion...",
        "correctAnswer": true,
        "points": 5
      },
      {
        "type": "short_answer",
        "text": "Pregunta abierta...",
        "acceptedAnswers": ["respuesta1", "respuesta2"],
        "points": 15
      }
    ]
  }
  ```
- `GET /api/lessons/:lessonId/quizzes` — Listar quizzes de una leccion.
- `GET /api/quizzes/:quizId` — Obtener quiz completo. Para admin: incluye respuestas correctas. Para usuario: sin respuestas correctas.
- `PUT /api/quizzes/:quizId` — Actualizar quiz (titulo, preguntas). Solo admin.
- `DELETE /api/quizzes/:quizId` — Eliminar quiz. Solo admin.
- Validacion con Zod del esquema de preguntas (tipos validos, opciones no vacias, respuestas correctas validas).
- Un quiz puede tener entre 1 y 50 preguntas.
- Cada pregunta debe tener un tipo, texto, respuesta correcta y puntos.
- Los puntos deben ser positivos. El total de puntos se calcula automaticamente.

#### HU-BE-017: Evaluacion y puntuacion de quizzes

**Como** estudiante, **quiero** poder responder quizzes y recibir mi puntuacion de forma inmediata, **para** evaluar mi comprension del material y saber en que areas necesito mejorar.

**Criterios de Aceptacion:**
- `POST /api/quizzes/:quizId/attempts` — Enviar intento. Body:
  ```json
  {
    "answers": [
      { "questionIndex": 0, "answer": 2 },
      { "questionIndex": 1, "answer": true },
      { "questionIndex": 2, "answer": "mi respuesta" }
    ]
  }
  ```
- El sistema evalua automaticamente cada respuesta:
  - `multiple_choice`: comparacion directa del indice seleccionado.
  - `true_false`: comparacion directa del booleano.
  - `short_answer`: comparacion case-insensitive contra la lista de respuestas aceptadas.
- Se calcula el puntaje: `(puntos obtenidos / puntos totales) * 100`.
- Retorna resultado detallado:
  ```json
  {
    "score": 85,
    "totalPoints": 100,
    "earnedPoints": 85,
    "results": [
      { "questionIndex": 0, "correct": true, "pointsEarned": 10 },
      { "questionIndex": 1, "correct": false, "pointsEarned": 0, "correctAnswer": true }
    ],
    "passed": true
  }
  ```
- `GET /api/quizzes/:quizId/attempts/me` — Listar mis intentos anteriores con puntajes.
- `GET /api/quizzes/:quizId/attempts/:attemptId` — Detalle de un intento con respuestas y retroalimentacion.
- Se considera "aprobado" con puntaje >= 70%.
- Se permite multiples intentos (sin limite por defecto).
- Al aprobar un quiz, se actualiza el progreso de la leccion asociada como completada.
- Almacenar cada intento para analisis y estadisticas (no sobrescribir intentos anteriores).

## Dependencias

- **Depende de:** EP-BE-01 (Setup), EP-BE-02 (Autenticacion), EP-BE-03 (Gestion de Cursos - las lecciones deben existir).
- **Bloquea a:** EP-BE-06 (IA - la IA genera quizzes que usan estos endpoints), EP-BE-07 (Testing).

## Definition of Done

- [ ] CRUD completo de quizzes con tipos de preguntas: multiple_choice, true_false, short_answer.
- [ ] Validacion Zod del esquema de preguntas para todos los tipos.
- [ ] Sistema de evaluacion automatica funcional para los tres tipos de preguntas.
- [ ] Calculo de puntuacion correcto y normalizado a 100.
- [ ] Almacenamiento de intentos con detalle de respuestas y resultados.
- [ ] Endpoint para listar intentos anteriores del usuario.
- [ ] Integracion con progreso: aprobar quiz marca leccion como completada.
- [ ] Permisos correctos: admin CRUD completo, usuario solo intenta y consulta sus resultados.
- [ ] Quiz sin respuestas correctas expuestas cuando lo consulta un usuario.
- [ ] Respuestas de error consistentes y tipadas.
- [ ] Tipos TypeScript completos para la estructura de quizzes y evaluaciones.
