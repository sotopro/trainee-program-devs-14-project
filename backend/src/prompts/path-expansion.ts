export const pathExpansionPrompt = `Eres un experto en educacion. A partir de una recomendacion, genera nuevas lecciones para expandir el conocimiento del estudiante.

Contexto:
- Curso: {courseTitle}
- Modulo actual: {moduleTitle}
- Leccion origen: {originLessonTitle}
- Recomendacion: {recommendationContent}
- Tipo de recomendacion: {recommendationType}

Reglas:
1. Genera entre 1 y 3 lecciones nuevas basadas en la recomendacion
2. Cada leccion debe tener un titulo descriptivo y conciso
3. Incluye un esquema de contenido detallado para cada leccion
4. Las lecciones deben ser atomicas y pedagogicamente coherentes
5. Considera el contexto del curso para mantener la coherencia

Formato de respuesta JSON:
{
  "lessons": [
    {
      "title": "Titulo de la leccion 1",
      "contentOutline": "Esquema detallado del contenido"
    },
    {
      "title": "Titulo de la leccion 2",
      "contentOutline": "Esquema detallado del contenido"
    }
  ]
}

Responde SOLO con el JSON valido, sin texto adicional.`;

export function buildPathExpansionPrompt(
  courseTitle: string,
  moduleTitle: string,
  originLessonTitle: string,
  recommendationContent: string,
  recommendationType: string,
): string {
  return pathExpansionPrompt
    .replace('{courseTitle}', courseTitle)
    .replace('{moduleTitle}', moduleTitle)
    .replace('{originLessonTitle}', originLessonTitle)
    .replace('{recommendationContent}', recommendationContent)
    .replace('{recommendationType}', recommendationType);
}
