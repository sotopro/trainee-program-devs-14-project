# HU-FE-028: Custom Hooks de IA

## Descripcion
Como desarrollador del equipo, quiero contar con custom hooks reutilizables que encapsulen la logica de negocio de las funcionalidades de IA, para mantener los componentes limpios y facilitar la reutilizacion de la logica en diferentes partes de la aplicacion.

Este conjunto de hooks representa la capa de logica de negocio para todas las funcionalidades de inteligencia artificial de LearnPath. Se implementan tres hooks principales: `useAIChat(courseId)` que gestiona el estado completo del chat con la IA incluyendo envio de mensajes, recepcion de respuestas en streaming y persistencia de conversaciones; `useRecommendations(lessonId)` que obtiene y cachea las recomendaciones personalizadas para una leccion; y `useContentGeneration()` que dispara la generacion de contenido con manejo de estados de carga y error. Los hooks demuestran el patron de composicion de hooks, donde `useAIChat` utiliza internamente `useRecommendations` para sugerir temas relacionados durante la creacion del curso. Esta arquitectura permite que la logica de negocio sea testeada de forma independiente y reutilizada en diferentes componentes sin duplicacion de codigo.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Piero Aguilar |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #2:** Estrategias de Hooks — Los hooks de IA demuestran composicion avanzada de hooks, donde hooks complejos se construyen a partir de hooks mas simples. `useAIChat` compone internamente `useRecommendations` y hooks de React Query, ilustrando como encapsular logica de negocio compleja en abstracciones reutilizables y testeables.

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El hook `useAIChat(courseId)` expone las funciones `sendMessage(content)`, `clearChat()` y `saveDraft()`, junto con los estados `messages`, `isStreaming` e `error`.
- [ ] **AC-2:** El hook `useRecommendations(lessonId)` retorna `recommendations`, `isLoading`, `error` y `refetch`, obteniendo los datos del endpoint de recomendaciones con caching automatico.
- [ ] **AC-3:** El hook `useContentGeneration()` expone `generateContent(prompt)`, `generatedContent`, `isGenerating` y `error`, permitiendo generar contenido de IA bajo demanda.
- [ ] **AC-4:** La composicion de hooks funciona correctamente: `useAIChat` utiliza internamente `useRecommendations` para sugerir temas relacionados al contexto del chat cuando se esta creando un curso.
- [ ] **AC-5:** Todos los hooks manejan correctamente los estados de error, mostrando mensajes descriptivos y permitiendo reintentos sin perder el estado previo.

### Tecnicos
- [ ] **AC-T1:** Cada hook esta en su propio archivo dentro de `src/modules/ai/hooks/` y se exporta mediante un barrel file (`index.ts`).
- [ ] **AC-T2:** Los hooks usan `useMutation` y `useQuery` de TanStack Query internamente, configurando `queryKey`, `staleTime`, `retry` y callbacks de forma apropiada.
- [ ] **AC-T3:** El hook `useAIChat` maneja el streaming usando `useRef` para la conexion activa y `useCallback` para las funciones expuestas, evitando re-renders innecesarios.
- [ ] **AC-T4:** Los tipos TypeScript de los hooks estan definidos en `src/modules/ai/types.ts` y son estrictos (sin uso de `any`).

### QA
- [ ] **QA-1:** Al llamar `sendMessage()` con `useAIChat`, el array de `messages` se actualiza correctamente con el mensaje del usuario y posteriormente con la respuesta del asistente.
- [ ] **QA-2:** Al llamar `useRecommendations` con un `lessonId` invalido, el hook retorna `error` con un mensaje descriptivo y `recommendations` como array vacio.
- [ ] **QA-3:** La composicion de hooks no genera loops infinitos de re-render: verificar con React DevTools Profiler que no hay renders excesivos al usar `useAIChat`.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-193 | Definir tipos TypeScript para mensajes de chat, recomendaciones y contenido generado en `types.ts` | 0.5h | Alta |
| T-FE-194 | Implementar hook `useAIChat(courseId)` con logica de streaming y manejo de estado | 1.5h | Alta |
| T-FE-195 | Implementar hook `useRecommendations(lessonId)` con React Query y caching | 0.5h | Alta |
| T-FE-196 | Implementar hook `useContentGeneration()` con manejo de estados de carga y error | 0.5h | Alta |
| T-FE-197 | Implementar composicion: integrar `useRecommendations` dentro de `useAIChat` | 0.5h | Media |
| T-FE-198 | Crear barrel file de exportacion y documentar la API publica de cada hook | 0.5h | Baja |

## Notas Tecnicas
- Estructura de archivos sugerida:
  ```
  src/modules/ai/
    hooks/
      useAIChat.ts
      useRecommendations.ts
      useContentGeneration.ts
      index.ts
    types.ts
    services/
      aiService.ts
  ```
- Para el streaming en `useAIChat`, usar un patron con `AbortController` para poder cancelar la solicitud si el usuario navega fuera:
  ```typescript
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const sendMessage = useCallback(async (content: string) => {
    abortControllerRef.current = new AbortController();
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      signal: abortControllerRef.current.signal,
      body: JSON.stringify({ courseId, message: content }),
    });
    const reader = response.body?.getReader();
    // leer chunks...
  }, [courseId]);
  ```
- Las `queryKey` deben seguir la convencion del proyecto: `['ai', 'recommendations', lessonId]`, `['ai', 'chat', courseId]`.
- Usar `useCallback` para todas las funciones expuestas y `useMemo` para datos derivados, evitando re-renders innecesarios en los componentes consumidores.
- La composicion de `useAIChat` con `useRecommendations` se activa condicionalmente: solo cuando el chat tiene suficiente contexto (al menos 2 mensajes de ida y vuelta).

## Dependencias
- **Depende de:** HU-BE-018 (endpoints de IA del backend)
- **Bloquea a:** HU-FE-026 (Componente AI Chat), HU-FE-027 (Cards de Recomendaciones), HU-FE-033 (Tests de Integracion IA)
