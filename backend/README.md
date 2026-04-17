# LearnPath Backend

API del proyecto LearnPath construida con **Node.js + Express 5 + TypeScript**.

## Requisitos

- Node.js >= 20
- npm >= 10

## Setup local

```bash
# 1. Instalar dependencias
npm install

# 2. Levantar el servidor en modo desarrollo (watch)
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
├── src/
│   ├── config/           # Configuración y variables de entorno (HU-BE-003)
│   ├── controllers/      # Handlers HTTP que reciben request y devuelven response
│   ├── middleware/       # Middlewares de Express (errores, 404, etc.)
│   ├── routes/           # Definición de rutas Express
│   ├── services/         # Lógica de negocio (se agrega por épica)
│   ├── types/            # Tipos e interfaces compartidas
│   ├── utils/            # Helpers, clases auxiliares (AppError, etc.)
│   ├── app.ts            # Creación y configuración de la Express app
│   └── server.ts         # Entry point: arranca el servidor
├── dist/                 # Output del build (gitignored)
├── .env                  # Variables locales (gitignored, se agrega en HU-BE-003)
├── eslint.config.js
├── tsconfig.json
└── package.json
```

## Convenciones

- **ESM nativo:** `"type": "module"` en `package.json`. Los imports relativos deben incluir la extensión `.js` (aunque los archivos fuente sean `.ts`).
- **TypeScript estricto:** `strict: true` en `tsconfig.json`.
- **Formato:** Prettier con las mismas reglas del frontend (semi, singleQuote, printWidth 100).
- **Lint:** ESLint 10 con flat config y reglas de `typescript-eslint`.

## Manejo de errores

- Express 5 soporta async handlers nativamente. No se necesita envolver handlers asíncronos en wrappers.
- Errores personalizados se lanzan con la clase `AppError(statusCode, message)` (ver `src/utils/app-error.ts`).
- El middleware global `errorHandler` (ver `src/middleware/error.middleware.ts`) captura todos los errores y devuelve una respuesta JSON consistente.
