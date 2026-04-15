# HU-BE-020: Generacion de Contenido de Lecciones

## Descripcion
Como administrador, quiero generar el contenido completo de una leccion mediante IA para poder poblar rapidamente las lecciones con material educativo de calidad en formato Editor.js.

El sistema toma el titulo de la leccion junto con el contexto del curso (titulo del curso, titulo del modulo) para generar contenido coherente y relevante. La IA produce contenido en formato JSON de Editor.js que incluye parrafos, encabezados, listas, bloques de codigo y otros elementos enriquecidos. El contenido se guarda directamente en el campo `content` de la leccion. Si la leccion ya tiene contenido, se puede regenerar con confirmacion.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Piero Aguilar |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint POST /api/ai/generate-content/:lessonId genera contenido completo para la leccion en formato Editor.js JSON.
- [ ] **AC-2:** La generacion utiliza como contexto el titulo del curso, titulo del modulo y titulo de la leccion para producir contenido coherente.
- [ ] **AC-3:** El contenido generado incluye variedad de bloques Editor.js: encabezados (header), parrafos (paragraph), listas (list) y bloques de codigo (code) cuando es relevante.
- [ ] **AC-4:** El contenido se guarda automaticamente en el campo `content` de la leccion.
- [ ] **AC-5:** Si la leccion ya tiene contenido, el endpoint requiere el parametro `overwrite: true` en el body para confirmar la regeneracion.
- [ ] **AC-6:** Solo administradores pueden generar contenido.

### Tecnicos
- [ ] **AC-T1:** El prompt del sistema instruye a la IA a generar contenido en formato JSON de Editor.js valido, con bloques tipados correctamente.
- [ ] **AC-T2:** La respuesta de la IA se valida con un schema Zod que verifica la estructura de Editor.js (time, blocks, version).
- [ ] **AC-T3:** El contenido generado se almacena como JSONB en PostgreSQL a traves de Prisma.
- [ ] **AC-T4:** Se implementa un mecanismo de reintento (1 reintento) si la IA genera JSON invalido.

### QA
- [ ] **QA-1:** Verificar que el contenido generado es un JSON Editor.js valido con al menos 3 bloques de contenido.
- [ ] **QA-2:** Verificar que sin `overwrite: true`, la regeneracion de una leccion con contenido existente retorna 409 Conflict.
- [ ] **QA-3:** Verificar que el contexto del curso y modulo influye en el contenido generado (el contenido es relevante al tema).

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-020-1 | Disenar prompt template para generacion de contenido en formato Editor.js | 1h | Alta |
| T-BE-020-2 | Definir schema Zod para validar la estructura Editor.js de la respuesta | 0.5h | Alta |
| T-BE-020-3 | Implementar ContentGenerationService con logica de generacion y guardado | 1.5h | Alta |
| T-BE-020-4 | Implementar logica de overwrite con confirmacion | 0.5h | Media |
| T-BE-020-5 | Implementar controlador y ruta con middleware de auth ADMIN | 0.5h | Alta |
| T-BE-020-6 | Implementar mecanismo de reintento para JSON invalido | 1h | Media |

## Notas Tecnicas

### Especificacion de Endpoints

**POST /api/ai/generate-content/:lessonId** (Admin)
- Body (opcional):
```json
{
  "overwrite": true
}
```
- Respuesta (200 OK):
```json
{
  "lessonId": "uuid",
  "content": {
    "time": 1700000000000,
    "blocks": [
      {
        "id": "block-1",
        "type": "header",
        "data": { "text": "Introduccion a los Tipos en TypeScript", "level": 2 }
      },
      {
        "id": "block-2",
        "type": "paragraph",
        "data": { "text": "TypeScript es un superconjunto de JavaScript que anade tipado estatico al lenguaje..." }
      },
      {
        "id": "block-3",
        "type": "header",
        "data": { "text": "Tipos Primitivos", "level": 3 }
      },
      {
        "id": "block-4",
        "type": "list",
        "data": {
          "style": "unordered",
          "items": ["string - cadenas de texto", "number - numeros", "boolean - verdadero o falso"]
        }
      },
      {
        "id": "block-5",
        "type": "code",
        "data": { "code": "let nombre: string = 'TypeScript';\nlet version: number = 5;\nlet esGenial: boolean = true;" }
      },
      {
        "id": "block-6",
        "type": "paragraph",
        "data": { "text": "Al declarar variables con tipos, TypeScript puede detectar errores en tiempo de compilacion..." }
      }
    ],
    "version": "2.28.0"
  },
  "generated": true,
  "overwritten": false
}
```

### Schema Zod de Editor.js
```typescript
const editorBlockSchema = z.object({
  id: z.string().optional(),
  type: z.enum(['header', 'paragraph', 'list', 'code', 'quote', 'delimiter', 'table']),
  data: z.record(z.unknown()),
});

const editorContentSchema = z.object({
  time: z.number(),
  blocks: z.array(editorBlockSchema).min(1),
  version: z.string(),
});
```

### Prompt Template (Extracto)
```
Eres un experto en educacion tecnica. Genera contenido para una leccion en formato JSON de Editor.js.

Contexto:
- Curso: {{courseTitle}}
- Modulo: {{moduleTitle}}
- Leccion: {{lessonTitle}}

Genera contenido educativo completo y detallado que incluya:
1. Un encabezado principal (header level 2)
2. Parrafos explicativos claros
3. Listas cuando sea apropiado
4. Bloques de codigo con ejemplos practicos (si el tema lo requiere)
5. Al menos 5-8 bloques de contenido

El formato de respuesta debe ser un JSON valido de Editor.js...
```

### Consideraciones
- El contenido generado debe ser suficientemente extenso para una leccion educativa (minimo 5 bloques).
- Los bloques de codigo deben incluir ejemplos practicos y funcionales.
- Si la IA genera JSON invalido en el primer intento, se reintenta una vez con un prompt de correccion.
- El campo `overwrite` protege contra regeneracion accidental de contenido ya editado manualmente.

## Dependencias
- **Depende de:** HU-BE-018 (Setup del Servicio OpenAI), HU-BE-010 (CRUD de Lessons)
- **Bloquea a:** HU-BE-021 (Generacion de Quizzes con IA), HU-BE-023 (Expansion de Learning Paths)
