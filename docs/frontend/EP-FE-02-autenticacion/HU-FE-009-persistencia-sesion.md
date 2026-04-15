# HU-FE-009: Persistencia de Sesion y Preferencias

## Descripcion
Como usuario autenticado, quiero que mi sesion se mantenga activa al recargar la pagina o cerrar el navegador, y que mis preferencias personales se conserven entre visitas para tener una experiencia fluida y personalizada.

La persistencia de sesion es critica para la experiencia del usuario en LearnPath. Sin ella, los usuarios tendrian que iniciar sesion cada vez que recargan la pagina, lo cual seria frustrante e inaceptable para una plataforma de aprendizaje donde las sesiones suelen ser prolongadas. Esta historia implementa tres aspectos clave: primero, la configuracion del middleware `persist` de Zustand para el auth store, asegurando que los tokens y datos del usuario se almacenen en localStorage y se rehidraten automaticamente al cargar la aplicacion; segundo, un hook personalizado `useLocalStorage` para persistir preferencias del usuario como tema visual, estado del sidebar y otras configuraciones de interfaz; tercero, el manejo correcto de la hidratacion para evitar el "flash" de estado incorrecto (como mostrar brevemente la pagina de login antes de reconocer que el usuario ya esta autenticado). Adicionalmente, se implementa la logica de auto-refresco del token cuando la aplicacion detecta que el accessToken ha expirado al cargar.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #8:** Persistencia de Estado — Esta historia aborda directamente la persistencia de estado en React utilizando multiples estrategias: Zustand `persist` middleware para estado critico de autenticacion, un hook `useLocalStorage` generico para preferencias de usuario, y tecnicas de hidratacion para evitar parpadeos de interfaz. Se exploran las diferencias entre persistir en localStorage vs sessionStorage, serializacion/deserializacion de datos, y manejo de estados corruptos o incompatibles.

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** Al recargar la pagina, un usuario previamente autenticado sigue autenticado sin necesidad de volver a ingresar credenciales.
- [ ] **AC-2:** El hook `useLocalStorage` permite guardar y recuperar preferencias del usuario: tema (claro/oscuro), estado del sidebar (expandido/colapsado), y configuraciones de visualizacion.
- [ ] **AC-3:** No se produce un "flash" de contenido no autenticado al recargar la pagina; se muestra un estado de carga mientras se rehidrata la sesion.
- [ ] **AC-4:** Si el accessToken esta expirado al cargar la aplicacion pero el refreshToken es valido, se realiza un refresco automatico del token.
- [ ] **AC-5:** Si el refreshToken tambien esta expirado, el usuario es redirigido al login con un mensaje indicando que la sesion expiro.

### Tecnicos
- [ ] **AC-T1:** El middleware `persist` de Zustand esta configurado con `partialize` para persistir solo los datos necesarios (tokens y user), excluyendo estados transitorios.
- [ ] **AC-T2:** El hook `useLocalStorage<T>(key, defaultValue)` es generico, tipado con TypeScript, y maneja correctamente la serializacion/deserializacion de JSON.
- [ ] **AC-T3:** Se implementa un mecanismo de versionado del storage (`version` en persist config) para manejar migraciones cuando cambia la estructura del estado.
- [ ] **AC-T4:** El hook `useLocalStorage` maneja errores de localStorage (cuota excedida, modo privado) graciosamente con fallback al valor por defecto.

### QA
- [ ] **QA-1:** Abrir la aplicacion en una pestana nueva (sin cerrar la anterior) muestra la sesion activa sin necesidad de login.
- [ ] **QA-2:** Cambiar el tema a oscuro, recargar la pagina, y verificar que el tema oscuro se mantiene.
- [ ] **QA-3:** Limpiar manualmente el localStorage desde DevTools y recargar la pagina: el usuario debe ser redirigido al login sin errores de JavaScript.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-059 | Configurar middleware `persist` en el auth store con `partialize` y `version` | 0.5h | Alta |
| T-FE-060 | Crear hook generico `useLocalStorage<T>` con serializacion JSON y manejo de errores | 0.5h | Alta |
| T-FE-061 | Implementar logica de hidratacion con estado de carga en el punto de entrada de la app | 0.5h | Alta |
| T-FE-062 | Implementar auto-refresco de token al cargar la aplicacion si el accessToken esta expirado | 0.5h | Alta |
| T-FE-063 | Crear hook `useUserPreferences` que use `useLocalStorage` para preferencias comunes (tema, sidebar) | 0.25h | Media |
| T-FE-064 | Implementar migracion de version del storage para cambios futuros de estructura | 0.25h | Media |
| T-FE-065 | Escribir tests unitarios para `useLocalStorage` y logica de hidratacion | 0.5h | Media |

## Notas Tecnicas
- Configuracion del persist middleware con versionado:
  ```typescript
  persist(
    (set, get) => ({
      // estado y acciones
    }),
    {
      name: 'learnpath-auth',
      version: 1,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      migrate: (persistedState, version) => {
        // Manejar migraciones entre versiones
        return persistedState as AuthState;
      },
    }
  )
  ```
- Implementacion del hook `useLocalStorage`:
  ```typescript
  function useLocalStorage<T>(key: string, defaultValue: T): [T, (value: T | ((prev: T) => T)) => void] {
    const [storedValue, setStoredValue] = useState<T>(() => {
      try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    });

    const setValue = (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error writing to localStorage key "${key}":`, error);
      }
    };

    return [storedValue, setValue];
  }
  ```
- Para la hidratacion, el componente raiz debe verificar si Zustand ya termino de cargar:
  ```typescript
  const App = () => {
    const isHydrated = useAuthStore((state) => state._hasHydrated);

    if (!isHydrated) {
      return <LoadingScreen />;
    }

    return <RouterProvider router={router} />;
  };
  ```
- El auto-refresco de token puede implementarse en un `useEffect` en el componente raiz o usando el callback `onRehydrateStorage` del middleware persist.
- Para verificar si el token esta expirado, decodificar el JWT en el cliente (sin verificar firma) y comparar el campo `exp` con la fecha actual.

## Dependencias
- **Depende de:** HU-FE-006 (Auth Store con Zustand)
- **Bloquea a:** HU-FE-007 (para el manejo de rehidratacion en los guards)
