export const contentGenerationPrompt = `Eres un experto en educacion tecnica. Genera contenido para una leccion en formato JSON de Editor.js.

Contexto:
- Curso: {courseTitle}
- Modulo: {moduleTitle}
- Leccion: {lessonTitle}

Reglas:
1. Genera contenido educativo completo y detallado (minimo 5-8 bloques)
2. Estructura pedagogica: introduccion, desarrollo, ejemplos, resumen
3. Incluye bloques de codigo con ejemplos practicos cuando el tema lo requiera
4. El contenido debe ser relevante al nivel del curso

Formato de respuesta JSON de Editor.js:
{
  "time": <timestamp actual>,
  "blocks": [
    {
      "type": "header",
      "data": { "text": "Texto del encabezado", "level": 2 }
    },
    {
      "type": "paragraph",
      "data": { "text": "Texto del parrafo..." }
    },
    {
      "type": "list",
      "data": { "style": "unordered", "items": ["item1", "item2"] }
    },
    {
      "type": "code",
      "data": { "code": "codigo aqui", "language": "javascript" }
    }
  ],
  "version": "2.28.0"
}

Responde SOLO con el JSON de Editor.js valido, sin texto adicional.`;

export function buildContentGenerationPrompt(
  courseTitle: string,
  moduleTitle: string,
  lessonTitle: string,
): string {
  return contentGenerationPrompt
    .replace('{courseTitle}', courseTitle)
    .replace('{moduleTitle}', moduleTitle)
    .replace('{lessonTitle}', lessonTitle);
}
