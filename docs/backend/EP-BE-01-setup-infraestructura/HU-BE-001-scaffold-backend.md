# HU-BE-001: Scaffold del Proyecto Express + TypeScript

## Descripcion
Como equipo de desarrollo, quiero tener un proyecto backend inicializado con Express 5 y TypeScript con todas las dependencias y estructura base definida, para comenzar a desarrollar los modulos de la API sobre una base solida y estandarizada.

El scaffold del proyecto establece las bases tecnicas del backend de LearnPath. Se inicializa un proyecto Node.js con Express 5, TypeScript y las dependencias esenciales: Prisma 6 y `@prisma/client` para el ORM, OpenAI SDK para integracion con GPT-4o-mini, Zod para validacion de schemas, `jsonwebtoken` y `bcryptjs` para autenticacion, y middleware de seguridad y logging (`cors`, `helmet`, `morgan`, `dotenv`). Se configura el `tsconfig.json` con opciones estrictas, scripts de build y un servidor de desarrollo con `tsx` o `nodemon` para recarga automatica. La estructura de carpetas sigue una arquitectura modular con `src/` como raiz conteniendo `config/` para configuraciones, `middleware/` para middleware compartido, `modules/` para los dominios de negocio (auth, courses, learning, ai) y `shared/` para utilidades y tipos compartidos. Esta estructura permite que cada miembro del equipo trabaje en su modulo de forma independiente minimizando conflictos.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Equipo completo (Carlos Vasquez lidera) |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El proyecto se inicializa correctamente con `npm init` y las dependencias se instalan sin errores: express 5, prisma 6, @prisma/client, openai, zod, jsonwebtoken, bcryptjs, cors, helmet, morgan, dotenv.
- [ ] **AC-2:** El servidor Express arranca en el puerto configurado (por defecto 3000) y responde a una peticion GET `/api/health` con `{ status: 'ok', timestamp: '...' }`.
- [ ] **AC-3:** El script `npm run dev` inicia el servidor en modo desarrollo con recarga automatica al guardar cambios en archivos `.ts`.
- [ ] **AC-4:** El script `npm run build` compila el proyecto TypeScript sin errores y genera la salida en el directorio `dist/`.
- [ ] **AC-5:** La estructura de carpetas `src/` contiene los directorios: `config/`, `middleware/`, `modules/` (con subdirectorios para auth, courses, learning, ai), y `shared/`.

### Tecnicos
- [ ] **AC-T1:** El `tsconfig.json` esta configurado con `strict: true`, `target: ES2022`, `module: NodeNext`, `moduleResolution: NodeNext` y path aliases para imports limpios.
- [ ] **AC-T2:** El archivo `src/app.ts` configura Express con los middleware globales: `cors()`, `helmet()`, `morgan('dev')`, `express.json()` y un handler de errores global.
- [ ] **AC-T3:** Existe un archivo `src/server.ts` que importa la app y la inicia en el puerto configurado, separando la configuracion de Express del arranque del servidor.
- [ ] **AC-T4:** El `.gitignore` incluye `node_modules/`, `dist/`, `.env`, `.env.*` (excepto `.env.example`) y otros archivos generados.

### QA
- [ ] **QA-1:** Al ejecutar `npm run dev`, el servidor arranca sin errores y el endpoint `/api/health` responde con status 200.
- [ ] **QA-2:** Al ejecutar `npm run build`, la compilacion de TypeScript completa sin errores y el directorio `dist/` contiene los archivos JavaScript generados.
- [ ] **QA-3:** Al clonar el repositorio y ejecutar `npm install && npm run dev`, el proyecto arranca correctamente siguiendo las instrucciones del README.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-001 | Inicializar proyecto con `npm init` y configurar `package.json` con scripts | 0.25h | Alta |
| T-BE-002 | Instalar dependencias de produccion (express, prisma, openai, zod, jwt, bcrypt, cors, helmet, morgan, dotenv) | 0.25h | Alta |
| T-BE-003 | Instalar dependencias de desarrollo (typescript, tsx, @types/*, vitest, nodemon) | 0.25h | Alta |
| T-BE-004 | Configurar `tsconfig.json` con opciones estrictas y path aliases | 0.25h | Alta |
| T-BE-005 | Crear estructura de carpetas: config/, middleware/, modules/, shared/ | 0.25h | Alta |
| T-BE-006 | Crear `src/app.ts` con configuracion de Express y middleware globales | 0.5h | Alta |
| T-BE-007 | Crear `src/server.ts` con arranque del servidor | 0.25h | Alta |
| T-BE-008 | Crear endpoint de health check GET `/api/health` | 0.25h | Media |
| T-BE-009 | Configurar `.gitignore` y `.env.example` | 0.25h | Media |
| T-BE-010 | Verificar que `npm run dev` y `npm run build` funcionan correctamente | 0.5h | Alta |

## Notas Tecnicas
- Scripts sugeridos para `package.json`:
  ```json
  {
    "scripts": {
      "dev": "tsx watch src/server.ts",
      "build": "tsc",
      "start": "node dist/server.js",
      "lint": "eslint src/",
      "test": "vitest"
    }
  }
  ```
- Configuracion minima de `src/app.ts`:
  ```typescript
  import express from 'express';
  import cors from 'cors';
  import helmet from 'helmet';
  import morgan from 'morgan';

  const app = express();

  app.use(cors());
  app.use(helmet());
  app.use(morgan('dev'));
  app.use(express.json());

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  export default app;
  ```
- Usar `tsx` en lugar de `ts-node` para el servidor de desarrollo por su mejor rendimiento y compatibilidad con ESM.
- Configurar path aliases en `tsconfig.json`: `@config/*`, `@middleware/*`, `@modules/*`, `@shared/*` apuntando a los directorios correspondientes en `src/`.
- Express 5 usa promesas nativas para el manejo de errores en middleware async, eliminando la necesidad de `express-async-handler`.

## Dependencias
- **Depende de:** Ninguna (es la primera historia del backend)
- **Bloquea a:** HU-BE-002 (Schema de Prisma), HU-BE-003 (Configuracion de Entornos), HU-BE-004 (Registro de Usuarios)
