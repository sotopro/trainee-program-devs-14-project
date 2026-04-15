# HU-FE-017: Vista de Lección y Contenido

## Descripción
Como usuario inscrito en un curso, quiero visualizar el contenido de cada lección de forma clara y navegar entre lecciones fácilmente para poder avanzar en mi aprendizaje de manera fluida y organizada.

La vista de lección es el componente central de la experiencia de aprendizaje en LearnPath. Presenta el contenido de una lección renderizando los bloques creados con Editor.js en modo de solo lectura, soportando distintos tipos de contenido: texto enriquecido, encabezados, listas, bloques de código, citas, tablas, imágenes y embeds de YouTube. La interfaz se divide en dos secciones principales: un sidebar lateral izquierdo que muestra la estructura del módulo actual (lista de lecciones con indicadores de estado completada/actual/pendiente) y el área principal de contenido a la derecha. En la parte inferior del contenido se ubican los botones de navegación (lección anterior/siguiente) y un botón "Marcar como completada" que registra el progreso del usuario. La navegación es intuitiva y permite al usuario moverse libremente entre las lecciones del módulo sin perder su lugar.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Jazir Olivera |
| QA | Daniel Soto |

## Criterios de Aceptación

### Funcionales
- [ ] **AC-1:** El contenido de la lección se renderiza correctamente en modo solo lectura, mostrando todos los tipos de bloques de Editor.js: encabezados (H1-H6), párrafos, listas (ordenadas y no ordenadas), bloques de código con resaltado de sintaxis, citas, tablas, delimitadores e imágenes.
- [ ] **AC-2:** Los embeds de YouTube se renderizan como reproductores de video embebidos responsivos que mantienen la proporción 16:9 y funcionan correctamente en todas las resoluciones.
- [ ] **AC-3:** El sidebar lateral muestra las lecciones del módulo actual con indicadores visuales de estado: check verde para completadas, punto azul para la lección actual, y gris para pendientes, permitiendo navegar a cualquier lección haciendo clic.
- [ ] **AC-4:** Los botones "Lección anterior" y "Siguiente lección" en la parte inferior permiten navegación secuencial, deshabilitándose cuando no hay lección previa o siguiente respectivamente; al llegar a la última lección del módulo, "Siguiente" lleva al primer lección del siguiente módulo.
- [ ] **AC-5:** El botón "Marcar como completada" registra la lección como completada, se transforma en un indicador visual de "Completada" con check, y avanza automáticamente a la siguiente lección tras un breve delay.

### Técnicos
- [ ] **AC-T1:** El renderizado del contenido de Editor.js utiliza un componente `EditorJsRenderer` que recibe el JSON de bloques y mapea cada tipo de bloque a un componente React correspondiente (HeaderBlock, ParagraphBlock, ListBlock, CodeBlock, ImageBlock, EmbedBlock, etc.).
- [ ] **AC-T2:** El componente `YouTubeEmbed` utiliza un iframe con `loading="lazy"` y un wrapper con `aspect-ratio: 16/9` para carga diferida y responsividad.
- [ ] **AC-T3:** La navegación entre lecciones utiliza `useNavigate` con la ruta `/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}` y los datos se pre-cargan con `queryClient.prefetchQuery` al hacer hover sobre los botones de navegación.
- [ ] **AC-T4:** El sidebar de módulos utiliza `useQuery` con clave `['modules', moduleId, 'lessons']` para obtener la lista de lecciones y su estado de completitud para el usuario actual.

### QA
- [ ] **QA-1:** Verificar que una lección con contenido mixto (texto, imagen, video de YouTube, bloque de código y lista) renderiza todos los elementos correctamente sin errores de layout o contenido faltante.
- [ ] **QA-2:** Comprobar que al marcar una lección como completada, el indicador del sidebar se actualiza a check verde, y que al navegar a otra lección y volver, el estado de completada se mantiene.
- [ ] **QA-3:** Validar que la navegación "Siguiente lección" al final de un módulo lleva correctamente a la primera lección del módulo siguiente, y que al estar en la primera lección del primer módulo el botón "Anterior" está deshabilitado.

## Tareas

| ID | Tarea | Estimación | Prioridad |
|----|-------|-----------|-----------|
| T-FE-077 | Crear componente `EditorJsRenderer` que mapea bloques JSON de Editor.js a componentes React de visualización | 1.5h | Alta |
| T-FE-078 | Implementar componentes individuales de bloque: `HeaderBlock`, `ParagraphBlock`, `ListBlock`, `CodeBlock`, `ImageBlock`, `EmbedBlock`, `QuoteBlock`, `TableBlock`, `DelimiterBlock` | 1h | Alta |
| T-FE-079 | Desarrollar sidebar de navegación de módulo con lista de lecciones e indicadores de estado (completada/actual/pendiente) | 0.5h | Alta |
| T-FE-080 | Implementar navegación entre lecciones (anterior/siguiente) con soporte de cross-module y prefetch en hover | 0.5h | Alta |
| T-FE-081 | Crear funcionalidad "Marcar como completada" con mutación, actualización de UI y avance automático | 0.5h | Alta |
| T-FE-082 | Implementar layout responsivo de la vista de lección: sidebar colapsable en móvil como drawer | 1h | Media |

## Notas Técnicas
- El `EditorJsRenderer` debe ser un componente robusto que maneje graciosamente bloques desconocidos (fallback a un párrafo o un aviso de bloque no soportado) para evitar errores si se añaden nuevos tipos de bloque en el futuro.
- Para el resaltado de sintaxis en bloques de código, considerar `react-syntax-highlighter` con el tema que mejor se adapte al diseño de la plataforma.
- Las imágenes deben renderizarse con `loading="lazy"` y un contenedor con `max-width: 100%` para evitar desbordamientos.
- El sidebar en móvil (pantallas < 768px) debe convertirse en un drawer deslizable desde la izquierda, activable con un botón hamburguesa, usando `Sheet` de shadcn/ui.
- Para el prefetch en hover, usar: `onMouseEnter={() => queryClient.prefetchQuery({ queryKey: ['lessons', nextLessonId], queryFn: ... })}` en los botones de navegación.
- El avance automático tras marcar completada debe tener un delay de ~1.5 segundos para que el usuario perciba el feedback visual antes de navegar.

## Dependencias
- **Depende de:** HU-FE-016 (flujo de inscripción que habilita el acceso a las lecciones), HU-FE-023 (Editor.js que define los formatos de contenido a renderizar, el QuizPlayer si hay quiz en la lección)
- **Bloquea a:** HU-FE-019 (progreso con optimistic updates depende de la funcionalidad de marcar lección completada), HU-FE-025 (optimización del LessonView con React.memo)
