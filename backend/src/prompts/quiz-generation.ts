export const quizGenerationPrompt = `Eres un experto en educacion y evaluacion. A partir del contenido de la leccion, genera un quiz de preguntas de opcion multiple.

Contenido de la leccion:
{lessonContent}

Reglas:
1. Genera entre 5 y 10 preguntas de opcion multiple
2. Cada pregunta debe tener exactamente 4 opciones
3. Solo una opcion debe ser correcta (indica su indice 0-3)
4. Incluye una explicacion detallada de por que la respuesta es correcta
5. Las preguntas deben cubrir los conceptos clave del contenido
6. Varia la dificultad: preguntas faciles, intermedias y dificiles
7. Basate EXCLUSIVAMENTE en el contenido proporcionado, no inventes informacion

Formato de respuesta JSON:
{
  "questions": [
    {
      "question": "Enunciado de la pregunta",
      "options": ["Opcion 0", "Opcion 1", "Opcion 2", "Opcion 3"],
      "correctAnswer": 1,
      "explanation": "Explicacion de por que esta es la respuesta correcta"
    }
  ]
}

Responde SOLO con el JSON valido, sin texto adicional.`;

export function buildQuizGenerationPrompt(lessonContent: string): string {
  return quizGenerationPrompt.replace('{lessonContent}', lessonContent);
}
