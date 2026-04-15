# HU-BE-018: Setup del Servicio OpenAI

## Descripcion
Como desarrollador, quiero tener un servicio centralizado para interactuar con la API de OpenAI para poder reutilizar la configuracion, manejo de errores y rate limiting en todas las funcionalidades de IA de la plataforma.

El servicio AIService encapsula la comunicacion con la API de OpenAI usando el SDK oficial. Provee metodos genericos para enviar mensajes con system prompts y para generar respuestas estructuradas usando `response_format`. Incluye rate limiting por usuario (maximo 10 peticiones por minuto), manejo de errores (timeout, rate limit de OpenAI, respuestas invalidas) y almacenamiento de prompt templates en archivos separados bajo el directorio `prompts/`.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Piero Aguilar |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El servicio AIService se configura con la API key de OpenAI desde variables de entorno (`OPENAI_API_KEY`).
- [ ] **AC-2:** El metodo `sendMessage(systemPrompt, userMessage)` envia un mensaje a GPT-4o-mini y retorna la respuesta como string.
- [ ] **AC-3:** El metodo `generateStructured(prompt, schema)` envia un prompt y retorna una respuesta JSON parseada segun el schema proporcionado usando `response_format`.
- [ ] **AC-4:** El rate limiting restringe a un maximo de 10 peticiones por minuto por usuario, retornando 429 Too Many Requests al exceder el limite.
- [ ] **AC-5:** Los prompt templates se almacenan en archivos separados bajo `src/prompts/` y se cargan dinamicamente.

### Tecnicos
- [ ] **AC-T1:** La instancia de OpenAI SDK se inicializa como singleton con la configuracion de API key y timeout de 30 segundos.
- [ ] **AC-T2:** El rate limiting se implementa con un almacen en memoria (Map) con ventana deslizante por userId.
- [ ] **AC-T3:** Los errores de la API de OpenAI se capturan y transforman en errores HTTP apropiados: 429 (rate limit), 504 (timeout), 502 (respuesta invalida).
- [ ] **AC-T4:** Los prompts templates usan template literals con placeholders que se reemplazan dinamicamente con el contexto proporcionado.

### QA
- [ ] **QA-1:** Verificar que el rate limiting funciona correctamente: la peticion 11 dentro de un minuto recibe 429 y la peticion 1 despues de un minuto recibe 200.
- [ ] **QA-2:** Verificar que los errores de timeout (30s) se manejan correctamente y retornan 504 con mensaje descriptivo.
- [ ] **QA-3:** Verificar que el metodo `generateStructured` parsea correctamente la respuesta JSON y rechaza respuestas que no cumplan el schema.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-018-1 | Configurar OpenAI SDK con variables de entorno y timeout | 0.5h | Alta |
| T-BE-018-2 | Implementar AIService con metodos sendMessage y generateStructured | 1h | Alta |
| T-BE-018-3 | Implementar rate limiting por usuario con ventana deslizante | 1h | Alta |
| T-BE-018-4 | Implementar manejo de errores centralizado para la API de OpenAI | 0.5h | Alta |
| T-BE-018-5 | Crear directorio de prompts y definir templates base | 0.5h | Media |
| T-BE-018-6 | Crear middleware de rate limiting para rutas de IA | 0.5h | Media |

## Notas Tecnicas

### Estructura del Servicio

```typescript
// src/services/ai.service.ts
import OpenAI from 'openai';

class AIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY, // sk-placeholder-replace-with-real-key en dev
      timeout: 30000, // 30 segundos
    });
  }

  async sendMessage(systemPrompt: string, userMessage: string): Promise<string> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    });
    return response.choices[0].message.content ?? '';
  }

  async generateStructured<T>(prompt: string, schema: z.ZodSchema<T>): Promise<T> {
    const response = await this.client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });
    const parsed = JSON.parse(response.choices[0].message.content ?? '{}');
    return schema.parse(parsed);
  }
}
```

### Rate Limiting

```typescript
// src/middleware/ai-rate-limit.ts
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function aiRateLimit(req, res, next) {
  const userId = req.user.id;
  const now = Date.now();
  const entry = requestCounts.get(userId);

  if (!entry || now > entry.resetAt) {
    requestCounts.set(userId, { count: 1, resetAt: now + 60000 });
    return next();
  }

  if (entry.count >= 10) {
    return res.status(429).json({ error: 'Limite de peticiones de IA excedido. Intenta en un minuto.' });
  }

  entry.count++;
  return next();
}
```

### Estructura de Prompts

```
src/prompts/
  course-generation.ts     // Prompt para generar estructura de cursos
  content-generation.ts    // Prompt para generar contenido de lecciones
  quiz-generation.ts       // Prompt para generar quizzes
  recommendation.ts        // Prompt para generar recomendaciones
  path-expansion.ts        // Prompt para expandir learning paths
```

### Manejo de Errores

| Error OpenAI | Codigo HTTP | Mensaje |
|-------------|-------------|---------|
| RateLimitError | 429 | Limite de la API de OpenAI alcanzado |
| APITimeoutError | 504 | Timeout al comunicarse con OpenAI |
| APIError | 502 | Error en el servicio de IA |
| JSON parse error | 502 | Respuesta invalida del servicio de IA |
| Zod validation error | 502 | Estructura de respuesta inesperada |

### Consideraciones
- Usar `sk-placeholder-replace-with-real-key` como placeholder en archivos de ejemplo/documentacion. La key real se configura en `.env`.
- El modelo `gpt-4o-mini` se usa por su balance entre costo y calidad para un MVP.
- El timeout de 30 segundos es suficiente para generacion de contenido largo.
- El rate limiting en memoria es adecuado para el MVP; en produccion considerar Redis.

## Dependencias
- **Depende de:** HU-BE-001 (Setup del proyecto), HU-BE-003 (Variables de entorno)
- **Bloquea a:** HU-BE-019 (Generacion de Cursos), HU-BE-020 (Generacion de Contenido), HU-BE-021 (Generacion de Quizzes), HU-BE-022 (Recomendaciones), HU-BE-023 (Expansion de Paths)
