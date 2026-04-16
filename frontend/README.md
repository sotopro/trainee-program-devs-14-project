# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```



## Setup Guide & Core Tools

> Implementation of **HU-FE-003**.

### 1. Environment Variables & Configuration
Implemented a secure and strongly-typed environment management system.

* **Local Files:** You must create your own `.env.development` file based on the provided `.env.example`.
* **Validation:** The `src/config/env.ts` module automatically validates that all strictly required variables (such as `VITE_API_URL`) are present at application startup.
* **Typing:** Environment variables feature full autocomplete support thanks to the interface defined in `src/vite-env.d.ts`.

---

### 2. Global State Management (Zustand 5)
Used for handling shared state across components without the need for *prop drilling*.

* **Location:** All global stores are located inside `src/shared/store/`.
* **Example Setup:** A base `useUIStore.ts` is included to control UI elements (e.g., toggling the Sidebar state).
* **Debugging:** Redux DevTools middleware is configured to be active *only* in development mode or when the `DEBUG` environment flag is enabled.

---

### 3. Data Synchronization (TanStack Query 5)

* **Provider:** The entire application is wrapped with the `QueryClientProvider` at the entry point in `src/main.tsx`.
* **Base Configuration:**
  * `staleTime`: **5 minutes** (prevents unnecessary repetitive requests to the server).
  * `retry`: **1 automatic retry** in case of network failures.
  * `refetchOnWindowFocus`: **Disabled** by default to optimize performance and network resources.

```typescript
// Default caching behavior applied globally:
defaultOptions: {
  queries: {
    staleTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: false,
  },
}
```