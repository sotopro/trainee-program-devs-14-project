# HU-FE-002: Configuracion de Entornos Frontend

## Descripcion
Como equipo de desarrollo, queremos tener archivos de configuracion de entorno separados para desarrollo, staging y produccion para manejar variables de entorno de forma segura y organizada.

La configuracion de entornos es esencial para que la aplicacion LearnPath se comporte correctamente en cada fase del ciclo de vida del software. Se deben crear tres archivos de entorno (`.env.development`, `.env.staging`, `.env.production`) con las variables necesarias para cada ambiente. Adicionalmente, se debe crear un modulo `env.ts` centralizado que lea las variables `VITE_` y las exporte tipadas, garantizando que cualquier acceso a variables de entorno pase por este modulo. Las variables principales incluyen: `API_URL` para la URL del backend, `APP_ENV` para identificar el entorno actual, `OPENAI_ENABLED` para habilitar/deshabilitar funcionalidades de IA, y `DEBUG` para activar logs de depuracion. Tambien se debe incluir un archivo `.env.example` como referencia para nuevos desarrolladores.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Equipo Completo |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** Existen los archivos `.env.development`, `.env.staging` y `.env.production` con las variables `VITE_API_URL`, `VITE_APP_ENV`, `VITE_OPENAI_ENABLED` y `VITE_DEBUG` correctamente definidas para cada entorno.
- [ ] **AC-2:** Existe un archivo `.env.example` documentando todas las variables requeridas con valores de ejemplo.
- [ ] **AC-3:** El modulo `src/config/env.ts` exporta un objeto tipado con todas las variables de entorno, con valores por defecto seguros.
- [ ] **AC-4:** Al ejecutar `npm run dev`, la aplicacion carga las variables de `.env.development` y se pueden verificar en consola.
- [ ] **AC-5:** Las variables de entorno estan correctamente tipadas con TypeScript y el IDE ofrece autocompletado.

### Tecnicos
- [ ] **AC-T1:** El archivo `env.ts` valida las variables de entorno al iniciar la aplicacion y lanza un error claro si falta alguna variable requerida.
- [ ] **AC-T2:** Los archivos `.env.staging` y `.env.production` NO se incluyen en el repositorio (estan en `.gitignore`); solo `.env.example` y `.env.development` se versionan.
- [ ] **AC-T3:** El modulo `env.ts` usa `import.meta.env` de Vite para acceder a las variables y exporta constantes inmutables.
- [ ] **AC-T4:** Se declara el tipo `ImportMetaEnv` en un archivo `vite-env.d.ts` para que TypeScript reconozca las variables `VITE_` personalizadas.

### QA
- [ ] **QA-1:** Al cambiar una variable en `.env.development` y reiniciar el servidor de desarrollo, el cambio se refleja correctamente en la aplicacion.
- [ ] **QA-2:** Si se omite una variable requerida, la aplicacion muestra un error descriptivo al iniciar.
- [ ] **QA-3:** El archivo `.env.example` contiene todas las variables usadas en `env.ts` con descripciones claras.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-011 | Crear archivos `.env.development`, `.env.staging`, `.env.production` con variables base | 0.25h | Alta |
| T-FE-012 | Crear archivo `.env.example` con documentacion de variables | 0.25h | Alta |
| T-FE-013 | Crear modulo `src/config/env.ts` con lectura y validacion de variables | 0.5h | Alta |
| T-FE-014 | Configurar tipos en `vite-env.d.ts` para variables VITE_ personalizadas | 0.25h | Media |
| T-FE-015 | Actualizar `.gitignore` para excluir archivos de entorno sensibles | 0.25h | Alta |
| T-FE-016 | Verificar carga correcta de variables en cada modo de Vite | 0.5h | Media |

## Notas Tecnicas
- Vite carga automaticamente los archivos `.env.[mode]` segun el modo de ejecucion (`development`, `staging`, `production`).
- Solo las variables con prefijo `VITE_` son expuestas al codigo del cliente por Vite.
- El modulo `env.ts` debe seguir este patron:
  ```typescript
  const env = {
    API_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    APP_ENV: import.meta.env.VITE_APP_ENV || 'development',
    OPENAI_ENABLED: import.meta.env.VITE_OPENAI_ENABLED === 'true',
    DEBUG: import.meta.env.VITE_DEBUG === 'true',
  } as const;
  ```
- Para staging, configurar el script en `package.json`: `"dev:staging": "vite --mode staging"`.
- Nunca almacenar secretos (API keys de OpenAI) en variables `VITE_`; esos valores deben manejarse exclusivamente en el backend.

## Dependencias
- **Depende de:** HU-FE-001
- **Bloquea a:** Todas las historias que consuman la API del backend
