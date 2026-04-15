# HU-FE-027: Cards de Recomendaciones para Usuario

## Descripcion
Como usuario de la plataforma, quiero ver tarjetas de recomendaciones al finalizar una leccion para explorar contenido relacionado, temas sugeridos y recursos adicionales que enriquezcan mi ruta de aprendizaje.

Las tarjetas de recomendaciones se presentan al usuario antes de completar una leccion, ofreciendo tres tipos de contenido sugerido por la IA: QUESTION (preguntas relacionadas que podria explorar), TOPIC (temas sugeridos para profundizar) y RESOURCE (recursos adicionales como articulos o videos complementarios). Cada tarjeta es clickeable y puede desencadenar un fork en la ruta de aprendizaje del usuario. Al hacer clic en el boton "Explorar este tema", se crea una nueva rama (branch) en la ruta de aprendizaje con contenido generado por la IA a partir del tema seleccionado. Las recomendaciones se obtienen del endpoint `/api/ai/recommend` usando React Query para el fetching y caching, asegurando que las recomendaciones se carguen de forma eficiente y se mantengan en cache para evitar llamadas redundantes. El diseno de las tarjetas debe ser atractivo y diferenciado visualmente segun el tipo de recomendacion.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Piero Aguilar |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** Se muestran hasta 3 tarjetas de recomendaciones al usuario al acercarse al final de una leccion, diferenciadas visualmente por tipo: QUESTION (icono de pregunta, borde azul), TOPIC (icono de libro, borde verde) y RESOURCE (icono de enlace, borde naranja).
- [ ] **AC-2:** Cada tarjeta muestra un titulo descriptivo, un breve resumen del contenido sugerido y un boton de accion principal.
- [ ] **AC-3:** Al hacer clic en el boton "Explorar este tema" de una tarjeta tipo TOPIC, se inicia el proceso de fork de la ruta de aprendizaje, mostrando un modal de confirmacion antes de proceder.
- [ ] **AC-4:** Las tarjetas tipo QUESTION redirigen al usuario a una busqueda o leccion relacionada dentro del curso actual.
- [ ] **AC-5:** Las tarjetas tipo RESOURCE abren el recurso externo en una nueva pestana del navegador.
- [ ] **AC-6:** Si no hay recomendaciones disponibles para una leccion, se muestra un estado vacio con un mensaje informativo en lugar de una seccion vacia.

### Tecnicos
- [ ] **AC-T1:** Las recomendaciones se obtienen mediante `useQuery` de TanStack Query al endpoint `/api/ai/recommend?lessonId={id}`, con `staleTime` configurado para evitar refetches innecesarios.
- [ ] **AC-T2:** El componente `RecommendationCard` es reutilizable y acepta props tipadas para los tres tipos de recomendacion, usando una interfaz TypeScript discriminada por tipo.
- [ ] **AC-T3:** La accion de fork utiliza `useMutation` de TanStack Query para crear la nueva rama, con invalidacion de cache de la ruta de aprendizaje tras el exito.
- [ ] **AC-T4:** Los componentes usan componentes base de shadcn/ui (`Card`, `Button`, `Badge`) para mantener la consistencia visual con el resto de la aplicacion.

### QA
- [ ] **QA-1:** Al cargar las recomendaciones, se muestra un skeleton loader en el espacio de las tarjetas hasta que los datos estan disponibles.
- [ ] **QA-2:** Al hacer clic en "Explorar este tema" y confirmar el fork, la ruta de aprendizaje del usuario se actualiza correctamente mostrando la nueva rama.
- [ ] **QA-3:** Si el endpoint de recomendaciones falla, se muestra un mensaje de error discreto con opcion de reintentar, sin afectar la visualizacion de la leccion principal.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-187 | Crear componente `RecommendationCard` con variantes por tipo (QUESTION, TOPIC, RESOURCE) | 1h | Alta |
| T-FE-188 | Implementar hook `useRecommendations(lessonId)` con React Query | 0.5h | Alta |
| T-FE-189 | Crear componente contenedor `RecommendationsPanel` con layout de grid y estado vacio | 0.5h | Alta |
| T-FE-190 | Implementar modal de confirmacion para fork de ruta de aprendizaje | 0.5h | Media |
| T-FE-191 | Integrar mutacion de fork con invalidacion de cache de learning path | 1h | Alta |
| T-FE-192 | Implementar skeleton loader y manejo de errores | 0.5h | Media |

## Notas Tecnicas
- Interfaz TypeScript discriminada para las recomendaciones:
  ```typescript
  type Recommendation =
    | { type: 'QUESTION'; title: string; summary: string; relatedLessonId: string }
    | { type: 'TOPIC'; title: string; summary: string; suggestedContent: string }
    | { type: 'RESOURCE'; title: string; summary: string; url: string };
  ```
- El `staleTime` de las recomendaciones debe ser de al menos 5 minutos (`staleTime: 5 * 60 * 1000`) ya que el contenido sugerido no cambia frecuentemente.
- Para el fork, enviar POST a `/api/learning-paths/{pathId}/fork` con el ID de la recomendacion seleccionada.
- Las tarjetas deben ser responsive: en desktop se muestran en una fila horizontal (grid de 3 columnas), en tablet en 2 columnas, y en mobile en una columna vertical.
- Usar `target="_blank"` con `rel="noopener noreferrer"` para los enlaces de recursos externos.

## Dependencias
- **Depende de:** HU-BE-022 (endpoint de recomendaciones del backend), HU-FE-017 (vista de leccion del usuario)
- **Bloquea a:** HU-FE-028 (Custom Hooks de IA), HU-FE-033 (Tests de Integracion IA)
