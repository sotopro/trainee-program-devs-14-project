# HU-BE-003: Configuracion de Entornos Backend

## Descripcion
Como equipo de desarrollo, quiero tener una configuracion de entornos robusta con validacion de variables de entorno al arranque, para evitar errores en tiempo de ejecucion por variables faltantes o malformadas y facilitar el despliegue en diferentes ambientes.

La configuracion de entornos del backend establece un sistema de gestion de variables de entorno seguro y validado. Se crean archivos de entorno para tres ambientes: `.env` (desarrollo local), `.env.staging` y `.env.production`, cada uno con las variables necesarias para el funcionamiento del backend. Las variables incluyen `DATABASE_URL` para la conexion a Prisma Postgres, `JWT_SECRET` y `JWT_REFRESH_SECRET` para la firma de tokens, `OPENAI_API_KEY` como placeholder para la integracion con GPT-4o-mini, `PORT` para el puerto del servidor, `NODE_ENV` para identificar el ambiente, y `CORS_ORIGIN` para configurar los origenes permitidos. El modulo `env.ts` en `src/config/` utiliza Zod para validar todas las variables de entorno al arranque del servidor, lanzando un error descriptivo si alguna variable requerida falta o tiene un formato invalido. Esto garantiza que el servidor nunca arranque con una configuracion incompleta.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Equipo completo |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** Existe un archivo `.env.example` con todas las variables de entorno documentadas con valores de ejemplo y comentarios descriptivos.
- [ ] **AC-2:** El modulo `src/config/env.ts` exporta un objeto `env` con todas las variables de entorno tipadas y validadas con Zod.
- [ ] **AC-3:** Si una variable de entorno requerida falta al arrancar el servidor, se lanza un error descriptivo que indica cual variable falta y que formato se espera.
- [ ] **AC-4:** Las variables sensibles (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `OPENAI_API_KEY`, `DATABASE_URL`) tienen validaciones de longitud minima para evitar valores triviales en produccion.
- [ ] **AC-5:** La variable `NODE_ENV` solo acepta los valores 'development', 'staging' o 'production', y por defecto es 'development'.

### Tecnicos
- [ ] **AC-T1:** El schema Zod de validacion esta definido en `src/config/env.ts` y se ejecuta al importar el modulo, garantizando validacion temprana.
- [ ] **AC-T2:** Los archivos `.env`, `.env.staging` y `.env.production` estan incluidos en `.gitignore`; solo `.env.example` se versiona.
- [ ] **AC-T3:** El objeto `env` exportado es de solo lectura (`as const` o `Object.freeze`) para prevenir modificaciones accidentales en tiempo de ejecucion.

### QA
- [ ] **QA-1:** Al eliminar una variable requerida del `.env` y ejecutar `npm run dev`, el servidor falla con un mensaje de error claro que indica la variable faltante.
- [ ] **QA-2:** Al configurar `NODE_ENV` con un valor invalido (por ejemplo, 'testing'), el servidor falla con un mensaje indicando los valores permitidos.
- [ ] **QA-3:** Al copiar `.env.example` a `.env` y completar los valores, el servidor arranca correctamente sin errores de configuracion.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-020 | Crear archivo `.env.example` con todas las variables documentadas | 0.25h | Alta |
| T-BE-021 | Crear schema Zod de validacion en `src/config/env.ts` | 0.5h | Alta |
| T-BE-022 | Implementar logica de parseo y validacion al importar el modulo | 0.25h | Alta |
| T-BE-023 | Configurar `.gitignore` para excluir archivos `.env` (excepto `.env.example`) | 0.15h | Alta |
| T-BE-024 | Integrar modulo `env` en `src/server.ts` para validacion al arranque | 0.25h | Alta |
| T-BE-025 | Documentar las variables de entorno y sus formatos esperados en `.env.example` | 0.25h | Media |
| T-BE-026 | Verificar el comportamiento con variables faltantes y malformadas | 0.35h | Media |

## Notas Tecnicas
- Schema Zod sugerido para la validacion:
  ```typescript
  import { z } from 'zod';

  const envSchema = z.object({
    DATABASE_URL: z.string().url('DATABASE_URL debe ser una URL valida'),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET debe tener al menos 32 caracteres'),
    JWT_REFRESH_SECRET: z.string().min(32, 'JWT_REFRESH_SECRET debe tener al menos 32 caracteres'),
    OPENAI_API_KEY: z.string().startsWith('sk-', 'OPENAI_API_KEY debe comenzar con sk-'),
    PORT: z.coerce.number().default(3000),
    NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
    CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  });

  export const env = envSchema.parse(process.env);
  export type Env = z.infer<typeof envSchema>;
  ```
- Usar `z.coerce.number()` para `PORT` ya que las variables de entorno siempre son strings.
- El `.env.example` debe contener valores de ejemplo claros:
  ```
  # Base de datos
  DATABASE_URL=postgresql://user:password@localhost:5432/learnpath
  
  # JWT
  JWT_SECRET=your-secret-key-at-least-32-characters-long
  JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-chars
  
  # OpenAI
  OPENAI_API_KEY=sk-your-openai-api-key-here
  
  # Servidor
  PORT=3000
  NODE_ENV=development
  CORS_ORIGIN=http://localhost:5173
  ```
- Importar `dotenv/config` al inicio de `server.ts` (antes de importar `env.ts`) para asegurar que las variables estan disponibles.

## Dependencias
- **Depende de:** HU-BE-001 (Scaffold del proyecto)
- **Bloquea a:** HU-BE-004 (Registro de Usuarios), HU-BE-005 (Login JWT)
