# EP-FE-06: IA y Recomendaciones Frontend

## Descripcion

Esta epica se encarga de construir todas las interfaces de usuario relacionadas con la inteligencia artificial en LearnPath. El componente central es el panel de chat con IA, que permite a los administradores generar cursos completos mediante conversacion natural con GPT-4o-mini. El chat funciona como un asistente que guia al administrador a traves del proceso de creacion de contenido, generando estructuras de cursos, modulos, lecciones y quizzes de forma iterativa.

Ademas del chat de IA para administradores, esta epica implementa el sistema de tarjetas de recomendaciones para usuarios finales. Basandose en el progreso del estudiante, los cursos completados y los intereses detectados, el sistema presenta recomendaciones de cursos y rutas de aprendizaje personalizadas. Estas recomendaciones se muestran como tarjetas interactivas en el dashboard del usuario y en el catalogo de cursos.

Se crean custom hooks especializados para la interaccion con la IA (`useAIChat`, `useRecommendations`, `useAIGeneration`) que encapsulan la logica de streaming de respuestas, manejo de estados de carga y error, y cache de respuestas previas. Estos hooks usan useEffect para manejar el ciclo de vida de las conexiones con el servicio de IA y la limpieza de recursos.

## Responsable(s)

| Rol | Nombre |
|-----|--------|
| Desarrollador | Piero Aguilar |
| QA | Daniel Soto |

## Temas React Asociados

| # | Tema | Descripcion Breve |
|---|------|-------------------|
| 2 | Efectos y Ciclo de Vida | `useEffect` para manejar streaming de respuestas IA, suscripciones a eventos del chat y cleanup de conexiones |

## Historias de Usuario

| ID | Titulo | Prioridad | Semana |
|----|--------|-----------|--------|
| HU-FE-026 | Componente de chat con IA para generacion de cursos (Admin) | Alta | S1-S2 |
| HU-FE-027 | Tarjetas de recomendaciones personalizadas (User) | Media | S2 |
| HU-FE-028 | Custom hooks para interaccion con servicios de IA | Alta | S1 |

### Detalle de Historias

#### HU-FE-026: Componente de chat con IA para generacion de cursos (Admin)

**Como** administrador, **quiero** un panel de chat donde pueda conversar con la IA para generar cursos completos paso a paso, **para** crear contenido educativo de alta calidad de forma rapida y asistida sin necesidad de escribir todo manualmente.

**Criterios de Aceptacion:**
- Panel de chat con interfaz tipo mensajeria (burbujas de usuario e IA).
- Input de texto con boton de enviar y soporte para Enter.
- Streaming de la respuesta de la IA (texto que aparece progresivamente).
- Indicador de "IA escribiendo..." mientras se genera la respuesta.
- Historial de conversacion scrolleable con auto-scroll al ultimo mensaje.
- La IA puede generar: estructura de curso, contenido de lecciones, preguntas de quiz.
- Botones de accion en respuestas de la IA: "Aplicar estructura", "Generar contenido", "Editar".
- `useEffect` para manejar la conexion de streaming y cleanup al desmontar.
- Manejo de errores de red y timeout con mensajes informativos.
- El chat se abre como panel lateral o modal dentro del panel de administracion.

#### HU-FE-027: Tarjetas de recomendaciones personalizadas (User)

**Como** estudiante, **quiero** ver recomendaciones personalizadas de cursos y rutas de aprendizaje basadas en mi progreso e intereses, **para** descubrir contenido relevante que me ayude a continuar aprendiendo.

**Criterios de Aceptacion:**
- Seccion de "Recomendado para ti" en el dashboard del usuario.
- Tarjetas de recomendacion con: titulo del curso, razon de la recomendacion, nivel, duracion.
- Carrusel horizontal de tarjetas con navegacion.
- Las recomendaciones se cargan via `useQuery` con cache de 5 minutos.
- Boton de "No me interesa" para descartar recomendaciones individuales.
- Boton "Inscribirme" directamente desde la tarjeta de recomendacion.
- Seccion de "Continuar aprendiendo" con cursos en progreso.
- `useEffect` para registrar interacciones del usuario con las recomendaciones (analytics).

#### HU-FE-028: Custom hooks para interaccion con servicios de IA

**Como** desarrollador, **quiero** custom hooks especializados para la interaccion con los servicios de IA, **para** encapsular toda la logica compleja de comunicacion, streaming y cache en hooks reutilizables.

**Criterios de Aceptacion:**
- `useAIChat(options)`: gestiona el estado del chat (mensajes, loading, error), envio de mensajes y recepcion de respuestas con streaming.
- `useRecommendations(userId)`: obtiene y cachea las recomendaciones personalizadas, con funciones para descartar y refrescar.
- `useAIGeneration(type)`: hook para generacion de contenido por tipo (course_structure, lesson_content, quiz_questions).
- Todos los hooks usan `useEffect` con cleanup adecuado para conexiones de streaming.
- Los hooks integran TanStack Query para cache y sincronizacion donde sea apropiado.
- Manejo de estados: idle, loading, streaming, success, error.
- Tipos TypeScript completos para mensajes, respuestas y opciones de configuracion.
- Los hooks son configurables (modelo, temperatura, max tokens) via parametros.

## Dependencias

- **Depende de:** EP-FE-01 (Setup), EP-FE-02 (Autenticacion - para identificar usuario), EP-FE-05 (Componentes UI - layouts y componentes base), EP-BE-06 (IA/OpenAI Backend - endpoints de generacion).
- **Bloquea a:** EP-FE-07 (Testing - necesita hooks y componentes para testear).

## Definition of Done

- [ ] Chat de IA funcional con streaming de respuestas.
- [ ] Interfaz de chat con historial, auto-scroll e indicador de escritura.
- [ ] Botones de accion en respuestas de IA (Aplicar, Generar, Editar).
- [ ] Tarjetas de recomendaciones personalizadas renderizadas en dashboard.
- [ ] Carrusel de recomendaciones con navegacion y acciones (inscribirse, descartar).
- [ ] Hook `useAIChat` completo con manejo de streaming y cleanup.
- [ ] Hook `useRecommendations` con cache y actualizacion.
- [ ] Hook `useAIGeneration` para diferentes tipos de contenido.
- [ ] `useEffect` con cleanup apropiado en todas las suscripciones de streaming.
- [ ] Manejo de errores de red, timeout y limites de API.
- [ ] Todos los hooks y componentes con tipos TypeScript completos.
- [ ] Integracion verificada con endpoints reales del backend de IA.
