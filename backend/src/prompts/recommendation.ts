export const recommendationPrompt = `Eres un experto en educacion y curaduria de contenido. A partir del contenido de la leccion, genera recomendaciones para profundizar el aprendizaje.

Curso: {courseTitle}
Modulo: {moduleTitle}
Leccion: {lessonTitle}
Contenido: {lessonContent}

Reglas:
1. Genera exactamente 2 preguntas para explorar (tipo QUESTION) con dificultad variada
2. Genera exactamente 2 temas relacionados (tipo TOPIC) para expandir conocimiento
3. Genera exactamente 2 recursos de lectura (tipo RESOURCE) con URLs reales de documentacion oficial o tutoriales reconocidos
4. Las URLs deben ser de fuentes conocidas y estables

Formato de respuesta JSON:
{
  "recommendations": [
    {
      "type": "QUESTION",
      "content": "Pregunta para explorar...",
      "metadata": { "difficulty": "intermedio", "relatedConcepts": ["concepto1", "concepto2"] }
    },
    {
      "type": "TOPIC",
      "content": "Nombre del tema relacionado",
      "metadata": { "description": "Descripcion del tema", "relevance": "alta" }
    },
    {
      "type": "RESOURCE",
      "content": "Nombre del recurso",
      "metadata": { "url": "https://...", "type": "documentacion_oficial" }
    }
  ]
}

Responde SOLO con el JSON valido, sin texto adicional.`;

export function buildRecommendationPrompt(
  courseTitle: string,
  moduleTitle: string,
  lessonTitle: string,
  lessonContent: string,
): string {
  return recommendationPrompt
    .replace('{courseTitle}', courseTitle)
    .replace('{moduleTitle}', moduleTitle)
    .replace('{lessonTitle}', lessonTitle)
    .replace('{lessonContent}', lessonContent);
}
