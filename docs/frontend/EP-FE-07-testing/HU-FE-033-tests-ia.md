# HU-FE-033: Tests de Integracion IA

## Descripcion
Como equipo de desarrollo, quiero contar con una suite completa de tests unitarios e integracion para las funcionalidades de inteligencia artificial, para asegurar que los hooks de IA, el componente de chat y las tarjetas de recomendaciones funcionan correctamente bajo diferentes escenarios incluyendo estados de error.

La suite de tests del modulo de IA cubre tanto los hooks individuales como los componentes compuestos. A nivel unitario, se testea el hook `useAIChat` verificando el envio de mensajes y la recepcion de respuestas (mockeando el streaming), y el hook `useRecommendations` verificando el fetching y caching de recomendaciones. A nivel de integracion, se testea el componente `AIChat` simulando el flujo completo de escribir un mensaje, enviarlo y ver la respuesta renderizada; y el componente `RecommendationCards` verificando el renderizado de las tarjetas y la accion de fork al hacer clic. Las respuestas de OpenAI se mockean completamente para aislar los tests del servicio externo. Se presta especial atencion a los estados de error: timeout de la API, rate limiting (429) y respuestas malformadas, verificando que la UI los maneja de forma elegante.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Piero Aguilar |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #15:** Testing (Vitest/RTL) — Esta historia aplica testing de hooks asincrono-complejos que manejan streaming, y testing de componentes con multiples estados (carga, exito, error, timeout).

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** Existen tests unitarios para el hook `useAIChat` que verifican: `sendMessage()` agrega el mensaje del usuario al array, la respuesta del asistente se agrega al completar, y `isStreaming` cambia correctamente durante el proceso.
- [ ] **AC-2:** Existen tests unitarios para el hook `useRecommendations` que verifican: retorna recomendaciones correctamente, cachea los resultados (no refetch en segunda llamada con mismo `lessonId`), y maneja errores retornando array vacio.
- [ ] **AC-3:** Existe un test de integracion para `AIChat` que simula: el usuario escribe un mensaje en el input, hace clic en enviar, ve el mensaje en la burbuja de usuario, ve el indicador de typing, y finalmente ve la respuesta en la burbuja del asistente.
- [ ] **AC-4:** Existe un test de integracion para `RecommendationCards` que verifica: se renderizan las tarjetas con los tres tipos (QUESTION, TOPIC, RESOURCE), al hacer clic en una tarjeta TOPIC se muestra el modal de confirmacion de fork.
- [ ] **AC-5:** Existen tests para el estado de error por timeout de la API: despues de un tiempo configurable sin respuesta, se muestra un mensaje de error con opcion de reintentar.
- [ ] **AC-6:** Existe un test para el estado de error por rate limit (HTTP 429): se muestra un mensaje especifico indicando que se ha excedido el limite de solicitudes con un tiempo de espera sugerido.

### Tecnicos
- [ ] **AC-T1:** Las respuestas de OpenAI se mockean usando MSW o `vi.mock` en el servicio `aiService`, retornando respuestas predefinidas que simulan la estructura de la API de OpenAI.
- [ ] **AC-T2:** El test de streaming mockea el `ReadableStream` con chunks predefinidos para simular la recepcion incremental de datos sin depender de la API real.
- [ ] **AC-T3:** Los tests de timeout usan `vi.useFakeTimers()` para simular el paso del tiempo sin esperas reales, verificando que el timeout se dispara correctamente.
- [ ] **AC-T4:** Todos los tests limpian los mocks, timers y cache de React Query en `afterEach` para garantizar aislamiento entre tests.

### QA
- [ ] **QA-1:** La cobertura de tests del modulo de IA (`src/modules/ai/`) alcanza al menos 80% en lineas y ramas.
- [ ] **QA-2:** Los tests cubren al menos 3 escenarios de error distintos (timeout, rate limit, respuesta malformada) y verifican que la UI se recupera correctamente.
- [ ] **QA-3:** Al modificar la logica de streaming en `useAIChat` (por ejemplo, cambiar como se procesan los chunks), al menos un test falla inmediatamente.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-227 | Configurar mocks para API de OpenAI y streaming con MSW o vi.mock | 0.5h | Alta |
| T-FE-228 | Escribir tests unitarios para hook `useAIChat` (sendMessage, isStreaming, clearChat) | 1h | Alta |
| T-FE-229 | Escribir tests unitarios para hook `useRecommendations` (fetch, cache, error) | 0.5h | Alta |
| T-FE-230 | Escribir test de integracion para componente `AIChat` (flujo completo de mensaje) | 0.75h | Alta |
| T-FE-231 | Escribir test de integracion para `RecommendationCards` (renderizado y fork) | 0.5h | Alta |
| T-FE-232 | Escribir tests de estados de error: timeout, rate limit (429), respuesta malformada | 0.75h | Media |

## Notas Tecnicas
- Para mockear el streaming de OpenAI:
  ```typescript
  function createMockStream(chunks: string[]) {
    return new ReadableStream({
      start(controller) {
        chunks.forEach((chunk) => {
          controller.enqueue(new TextEncoder().encode(chunk));
        });
        controller.close();
      },
    });
  }
  
  vi.spyOn(global, 'fetch').mockResolvedValue(
    new Response(createMockStream(['Hola', ', este', ' es el curso']), {
      headers: { 'Content-Type': 'text/event-stream' },
    })
  );
  ```
- Para testear el timeout, configurar fake timers y avanzar el tiempo:
  ```typescript
  vi.useFakeTimers();
  const { result } = renderHook(() => useAIChat('course-1'));
  act(() => result.current.sendMessage('crear curso'));
  vi.advanceTimersByTime(30000); // 30s timeout
  expect(result.current.error).toBe('La solicitud ha excedido el tiempo de espera');
  vi.useRealTimers();
  ```
- Para testear rate limit, configurar el mock para responder con status 429 y verificar el mensaje de error en la UI.
- Los mocks de respuestas de IA deben incluir la estructura completa esperada:
  ```typescript
  const mockCourseStructure = {
    title: 'Curso de React',
    modules: [
      { title: 'Modulo 1', lessons: [{ title: 'Leccion 1' }] },
    ],
  };
  ```
- Usar `waitFor` de RTL para esperar actualizaciones asincronas en los tests de integracion.

## Dependencias
- **Depende de:** HU-FE-026 (AI Chat Component), HU-FE-027 (Recommendation Cards), HU-FE-028 (Custom Hooks IA)
- **Bloquea a:** Ninguna
