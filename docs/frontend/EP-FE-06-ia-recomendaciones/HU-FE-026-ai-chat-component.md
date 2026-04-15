# HU-FE-026: Componente AI Chat para Admin

## Descripcion
Como administrador, quiero interactuar con un chat de IA (GPT-4o-mini) para generar la estructura de un curso nuevo, de modo que pueda crear cursos de forma rapida y asistida sin necesidad de definir manualmente cada modulo y leccion.

El componente AI Chat es la interfaz principal mediante la cual los administradores crean cursos en LearnPath. El flujo comienza cuando el admin describe un tema o area de conocimiento en el campo de texto del chat. La IA responde con una propuesta de estructura de curso que incluye modulos y lecciones organizados jerarquicamente. El admin puede refinar la estructura enviando mensajes adicionales como "agrega mas detalle al modulo 2", "cambia el enfoque hacia..." o "divide la leccion 3 en dos partes". La interfaz muestra burbujas de mensajes diferenciadas para usuario y asistente, un indicador de escritura (typing indicator) mientras la IA procesa, y renderiza las respuestas en streaming para una experiencia fluida. Una vez satisfecho con la estructura generada, el admin puede guardarla como borrador de curso con un boton dedicado. El componente utiliza React Query para las mutaciones de envio de mensajes y guardado, y un custom hook `useAIChat()` que encapsula toda la logica de estado del chat, el envio de mensajes y la recepcion de respuestas en streaming.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Piero Aguilar |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** La interfaz del chat muestra burbujas de mensaje diferenciadas visualmente para el usuario (admin) y el asistente (IA), con alineacion a la derecha e izquierda respectivamente.
- [ ] **AC-2:** Al enviar un mensaje, se muestra un indicador de escritura (typing indicator con animacion de puntos) mientras la IA procesa la solicitud.
- [ ] **AC-3:** Las respuestas de la IA se renderizan en streaming (caracter por caracter o por chunks), permitiendo al usuario ver el progreso de la generacion en tiempo real.
- [ ] **AC-4:** El admin puede refinar la estructura generada enviando mensajes adicionales de seguimiento (por ejemplo: "agrega mas detalle al modulo 2", "cambia el enfoque hacia practicas"), y la IA responde con la estructura actualizada manteniendo el contexto de la conversacion.
- [ ] **AC-5:** Existe un boton "Guardar como borrador" que toma la estructura generada por la IA y la persiste como un nuevo curso en estado borrador mediante una mutacion al backend.
- [ ] **AC-6:** El campo de entrada de texto se deshabilita mientras la IA esta generando una respuesta, y se rehabilita automaticamente cuando la respuesta esta completa.

### Tecnicos
- [ ] **AC-T1:** El componente utiliza el custom hook `useAIChat(courseId?)` que encapsula el estado de mensajes, envio, recepcion en streaming y persistencia de la conversacion.
- [ ] **AC-T2:** Las mutaciones de envio de mensaje y guardado de borrador usan `useMutation` de TanStack Query con callbacks `onSuccess`, `onError` y `onSettled` correctamente configurados.
- [ ] **AC-T3:** El componente renderiza las respuestas de la IA con soporte para Markdown (listas, negritas, encabezados) usando una libreria como `react-markdown`.
- [ ] **AC-T4:** El scroll del contenedor de mensajes se ajusta automaticamente al ultimo mensaje (auto-scroll) y permite scroll manual hacia arriba para revisar el historial.

### QA
- [ ] **QA-1:** Al enviar un mensaje vacio o con solo espacios, el formulario no realiza ninguna llamada al backend y el campo de texto conserva el foco.
- [ ] **QA-2:** Al guardar como borrador exitosamente, se muestra una notificacion de exito y el usuario es redirigido a la vista de edicion del curso creado.
- [ ] **QA-3:** Si la API de IA responde con error (timeout, rate limit), se muestra un mensaje de error en el chat con opcion de reintentar el ultimo mensaje.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-180 | Crear componente `ChatBubble` con variantes user/assistant y soporte Markdown | 1h | Alta |
| T-FE-181 | Implementar componente `TypingIndicator` con animacion de puntos | 0.5h | Media |
| T-FE-182 | Crear componente `ChatInput` con campo de texto, boton de envio y estado deshabilitado | 0.5h | Alta |
| T-FE-183 | Implementar logica de streaming de respuestas en el custom hook `useAIChat()` | 1.5h | Alta |
| T-FE-184 | Crear componente contenedor `AIChatPanel` con layout de mensajes y auto-scroll | 1h | Alta |
| T-FE-185 | Implementar boton "Guardar como borrador" con mutacion para persistir estructura del curso | 1h | Alta |
| T-FE-186 | Manejar estados de error y reintentos en la interfaz del chat | 0.5h | Media |

## Notas Tecnicas
- El hook `useAIChat()` debe manejar internamente un estado de mensajes (`messages[]`), un flag `isStreaming`, y funciones `sendMessage()` y `saveDraft()`.
- Para el streaming, utilizar `fetch()` con `ReadableStream` para leer la respuesta del endpoint `/api/ai/chat` chunk por chunk. No usar axios para streaming.
- Estructura sugerida del mensaje:
  ```typescript
  interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    metadata?: {
      courseStructure?: CourseStructure;
    };
  }
  ```
- El boton "Guardar como borrador" debe extraer la estructura del curso del ultimo mensaje del asistente que contenga `metadata.courseStructure` y enviarla via POST a `/api/courses/draft`.
- Usar `useRef` para el contenedor de mensajes y `scrollIntoView({ behavior: 'smooth' })` para el auto-scroll.
- El componente debe ser responsive: en desktop ocupa un panel lateral, en mobile ocupa la pantalla completa.

## Dependencias
- **Depende de:** HU-BE-019 (endpoint de chat IA del backend), HU-FE-001 (scaffold del proyecto)
- **Bloquea a:** HU-FE-028 (Custom Hooks de IA), HU-FE-033 (Tests de Integracion IA)
