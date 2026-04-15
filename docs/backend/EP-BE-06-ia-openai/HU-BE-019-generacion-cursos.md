# HU-BE-019: Generacion de Estructura de Cursos

## Descripcion
Como administrador, quiero generar la estructura de un curso a traves de una conversacion con IA para poder crear cursos completos de forma rapida y eficiente, refinando la estructura mediante mensajes de seguimiento.

El flujo de generacion de cursos funciona como un chat: el administrador describe el tema del curso, la IA genera una propuesta de estructura (titulo, descripcion, modulos y lecciones), y el administrador puede enviar mensajes adicionales para refinar la propuesta. La conversacion se almacena en el modelo AIConversation para mantener el contexto. Una vez satisfecho, el administrador confirma y el sistema crea automaticamente el curso con todos sus modulos y lecciones en la base de datos.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Piero Aguilar |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint POST /api/ai/generate-course recibe una descripcion del tema y retorna una propuesta de estructura de curso generada por IA.
- [ ] **AC-2:** La propuesta incluye: titulo, descripcion, modulos (con titulo y descripcion) y lecciones por modulo (con titulo y esquema de contenido).
- [ ] **AC-3:** El endpoint POST /api/ai/chat/:conversationId permite enviar mensajes de seguimiento para refinar la estructura, manteniendo el contexto de la conversacion.
- [ ] **AC-4:** El endpoint POST /api/ai/confirm-course/:conversationId toma la ultima propuesta de la conversacion y crea el curso, modulos y lecciones en la base de datos.
- [ ] **AC-5:** La conversacion se almacena en el modelo AIConversation con todos los mensajes intercambiados.
- [ ] **AC-6:** Solo administradores pueden acceder a estos endpoints.

### Tecnicos
- [ ] **AC-T1:** La respuesta de la IA se genera usando `generateStructured` con un schema Zod que valida la estructura completa del curso propuesto.
- [ ] **AC-T2:** El modelo AIConversation almacena: userId, tipo (COURSE_GENERATION), mensajes como JSON array, y la ultima propuesta estructurada.
- [ ] **AC-T3:** La confirmacion del curso crea todos los registros (Course, Modules, Lessons, LearningPath por defecto) dentro de una transaccion de Prisma.
- [ ] **AC-T4:** El prompt del sistema incluye instrucciones para generar estructura pedagogica coherente con progresion de dificultad.

### QA
- [ ] **QA-1:** Verificar que la estructura generada por la IA cumple con el schema Zod y contiene al menos 2 modulos con al menos 2 lecciones cada uno.
- [ ] **QA-2:** Verificar que la confirmacion crea todos los registros en la base de datos: curso, modulos con orden correcto, lecciones con orden correcto y learning path por defecto.
- [ ] **QA-3:** Verificar que los mensajes de seguimiento mantienen el contexto y la IA refina la propuesta en base a la retroalimentacion.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-019-1 | Disenar prompt template para generacion de estructura de cursos | 1h | Alta |
| T-BE-019-2 | Definir schema Zod para la estructura de curso propuesto por IA | 0.5h | Alta |
| T-BE-019-3 | Implementar CourseGenerationService con logica de conversacion | 1.5h | Alta |
| T-BE-019-4 | Implementar logica de confirmacion: creacion transaccional de curso completo | 1h | Alta |
| T-BE-019-5 | Implementar controladores para los tres endpoints | 1h | Alta |
| T-BE-019-6 | Implementar modelo AIConversation y gestion de mensajes | 1h | Media |

## Notas Tecnicas

### Especificacion de Endpoints

**POST /api/ai/generate-course** (Admin)
- Body:
```json
{
  "topic": "Curso completo de TypeScript para desarrolladores JavaScript",
  "level": "intermedio",
  "targetAudience": "Desarrolladores JavaScript con 1+ anio de experiencia"
}
```
- Respuesta (201 Created):
```json
{
  "conversationId": "uuid",
  "proposal": {
    "title": "TypeScript para Desarrolladores JavaScript",
    "description": "Curso intermedio que cubre desde los fundamentos de tipado...",
    "modules": [
      {
        "title": "Fundamentos del Sistema de Tipos",
        "description": "Tipos primitivos, interfaces y type aliases",
        "lessons": [
          { "title": "Tipos Primitivos y Anotaciones", "contentOutline": "Introduccion a string, number, boolean..." },
          { "title": "Interfaces y Type Aliases", "contentOutline": "Diferencias entre interface y type..." }
        ]
      },
      {
        "title": "Tipos Avanzados",
        "description": "Generics, utility types y type guards",
        "lessons": [
          { "title": "Generics Basicos", "contentOutline": "Funciones y clases genericas..." },
          { "title": "Utility Types", "contentOutline": "Partial, Required, Pick, Omit..." }
        ]
      }
    ]
  }
}
```

**POST /api/ai/chat/:conversationId** (Admin)
- Body:
```json
{
  "message": "Agrega un modulo sobre decoradores y otro sobre testing con TypeScript"
}
```
- Respuesta:
```json
{
  "conversationId": "uuid",
  "proposal": {
    "title": "TypeScript para Desarrolladores JavaScript",
    "description": "...",
    "modules": [
      { "title": "Fundamentos del Sistema de Tipos", "description": "...", "lessons": [...] },
      { "title": "Tipos Avanzados", "description": "...", "lessons": [...] },
      { "title": "Decoradores", "description": "...", "lessons": [...] },
      { "title": "Testing con TypeScript", "description": "...", "lessons": [...] }
    ]
  }
}
```

**POST /api/ai/confirm-course/:conversationId** (Admin)
- No requiere body.
- Respuesta (201 Created):
```json
{
  "courseId": "uuid",
  "title": "TypeScript para Desarrolladores JavaScript",
  "modulesCreated": 4,
  "lessonsCreated": 12,
  "learningPathId": "uuid-default-path"
}
```

### Schema Zod de Propuesta de Curso
```typescript
const lessonProposalSchema = z.object({
  title: z.string().min(5),
  contentOutline: z.string().min(10),
});

const moduleProposalSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  lessons: z.array(lessonProposalSchema).min(1),
});

const courseProposalSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(20),
  modules: z.array(moduleProposalSchema).min(1),
});
```

### Modelo AIConversation
```
AIConversation {
  id           String   @id @default(uuid())
  userId       String
  type         String   // "COURSE_GENERATION"
  messages     Json     // Array de { role: "user"|"assistant", content: string }
  lastProposal Json?    // Ultima propuesta estructurada
  status       String   // "ACTIVE", "CONFIRMED", "CANCELLED"
  courseId      String?  // ID del curso creado (si fue confirmado)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

### Consideraciones
- El prompt del sistema debe instruir a la IA a generar contenido pedagogicamente estructurado, con progresion de dificultad y coherencia tematica.
- Cada mensaje de seguimiento envia el historial completo de la conversacion a la IA para mantener contexto.
- La confirmacion es idempotente: si se llama dos veces, la segunda retorna el curso ya creado.
- El status de la conversacion cambia a CONFIRMED al confirmar y se vincula al courseId creado.

## Dependencias
- **Depende de:** HU-BE-018 (Setup del Servicio OpenAI), HU-BE-008 (CRUD de Courses)
- **Bloquea a:** HU-BE-020 (Generacion de Contenido de Lecciones)
