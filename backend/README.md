# LearnPath Backend

API del proyecto LearnPath construida con **Node.js + Express 5 + TypeScript**.

## Requisitos

- Node.js >= 20
- npm >= 10

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear tu archivo .env a partir del ejemplo
cp .env.example .env
# Edita .env y pega tu DATABASE_URL de Prisma Postgres
# (https://console.prisma.io/ -> tu proyecto -> Connect)

# 3. Aplicar migraciones a tu base de datos
npm run db:migrate

# 4. (Opcional) Poblar la DB con datos de ejemplo
npm run db:seed

# 5. Levantar el servidor en modo desarrollo (watch)
npm run dev
```

El servidor arranca por defecto en `http://localhost:3000`.

## Scripts disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Arranca el servidor en modo watch con `tsx` (recompila al guardar). |
| `npm run build` | Compila TypeScript a JavaScript en `dist/`. |
| `npm start` | Ejecuta la versión compilada (`node dist/server.js`). |
| `npm run lint` | Corre ESLint sobre todo el código fuente. |
| `npm run db:migrate` | Aplica/crea migraciones de Prisma en desarrollo. |
| `npm run db:seed` | Carga datos de ejemplo (admin user + 3 cursos). |
| `npm run db:studio` | Abre Prisma Studio (GUI web para explorar la DB). |
| `npm run db:reset` | Borra y recrea la DB desde cero, y corre el seed. |

## Endpoints disponibles

### Health check

```http
GET /api/health
```

Respuesta `200 OK`:

```json
{
  "status": "ok",
  "timestamp": "2026-04-16T20:00:00.000Z",
  "uptime": 12.34
}
```

## Estructura de carpetas

```
backend/
├── prisma/
│   ├── migrations/       # Historial de migraciones generado por Prisma
│   ├── schema.prisma     # Esquema de la base de datos (10 modelos + enums)
│   └── seed.ts           # Script de seed (admin user + cursos de muestra)
├── src/
│   ├── config/           # Configuración (Prisma Client singleton, env — HU-BE-003)
│   ├── controllers/      # Handlers HTTP que reciben request y devuelven response
│   ├── middleware/       # Middlewares de Express (errores, 404, etc.)
│   ├── routes/           # Definición de rutas Express
│   ├── services/         # Lógica de negocio (se agrega por épica)
│   ├── types/            # Tipos e interfaces compartidas
│   ├── utils/            # Helpers, clases auxiliares (AppError, etc.)
│   ├── app.ts            # Creación y configuración de la Express app
│   └── server.ts         # Entry point: arranca el servidor
├── dist/                 # Output del build (gitignored)
├── .env                  # Variables locales — DATABASE_URL (gitignored)
├── .env.example          # Template de variables para el equipo
├── eslint.config.js
├── tsconfig.json
└── package.json
```

## Base de datos

La DB está gestionada por **Prisma Postgres** (servicio en la nube de Prisma).

Modelos principales definidos en `prisma/schema.prisma`:

- **User** — usuarios con rol (ADMIN / USER).
- **Course**, **Module**, **Lesson** — jerarquía de contenido.
- **Enrollment** — inscripción usuario ↔ curso.
- **LearningPath**, **LearningPathItem** — rutas de aprendizaje con fork estilo Git.
- **Progress** — seguimiento de lecciones completadas, tiempo invertido.
- **Quiz**, **QuizAttempt** — cuestionarios y respuestas del usuario.

### Cómo usar Prisma Client en tu código

```ts
import { prisma } from '@/config/prisma.js';

const courses = await prisma.course.findMany({
  where: { status: 'PUBLISHED' },
  include: { author: true, modules: { include: { lessons: true } } },
});
```

### Credenciales del admin creado por el seed

- Email: `admin@learnpath.dev`
- Password: `admin123`

⚠️ Cambiar antes de desplegar a cualquier entorno no local.

## Convenciones

- **ESM nativo:** `"type": "module"` en `package.json`. Los imports relativos deben incluir la extensión `.js` (aunque los archivos fuente sean `.ts`).
- **TypeScript estricto:** `strict: true` en `tsconfig.json`.
- **Formato:** Prettier con las mismas reglas del frontend (semi, singleQuote, printWidth 100).
- **Lint:** ESLint 10 con flat config y reglas de `typescript-eslint`.

## Manejo de errores

- Express 5 soporta async handlers nativamente. No se necesita envolver handlers asíncronos en wrappers.
- Errores personalizados se lanzan con la clase `AppError(statusCode, message)` (ver `src/utils/app-error.ts`).
- El middleware global `errorHandler` (ver `src/middleware/error.middleware.ts`) captura todos los errores y devuelve una respuesta JSON consistente.
