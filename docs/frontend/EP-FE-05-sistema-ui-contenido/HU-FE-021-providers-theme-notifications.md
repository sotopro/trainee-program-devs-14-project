# HU-FE-021: Providers - Theme y Notifications

## Descripción
Como usuario, quiero poder alternar entre modo claro y oscuro y recibir notificaciones visuales de las acciones que realizo para poder personalizar mi experiencia visual y estar informado del resultado de mis acciones en la plataforma.

Esta historia de usuario implementa dos providers fundamentales de LearnPath utilizando la Context API de React. El **ThemeProvider** gestiona el modo visual de la aplicación (claro/oscuro/sistema), persiste la preferencia del usuario en localStorage, aplica variables CSS correspondientes al tema seleccionado y detecta automáticamente la preferencia del sistema operativo como valor inicial. El **NotificationProvider** implementa un sistema de notificaciones tipo toast que soporta cuatro tipos (success, error, warning, info), gestiona una cola de notificaciones para evitar sobrecarga visual, permite auto-dismiss configurable y stack de múltiples toasts. Ambos providers se componen en un archivo `app/providers.tsx` que los anida en el orden correcto, demostrando cuándo Context API es la solución adecuada (concerns transversales de UI que requieren acceso global) versus cuándo no lo es (estado que cambia frecuentemente y causa re-renders innecesarios).

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Joshua Rodriguez |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #5:** Context API — Se utiliza Context API para dos casos donde es la solución idónea: tema visual (acceso global, cambios infrecuentes) y notificaciones (concern transversal de UI). Se documenta explícitamente por qué estos son buenos casos de uso para Context (vs. estado que cambia cada keystroke o datos de servidor que React Query maneja mejor).

## Criterios de Aceptación

### Funcionales
- [ ] **AC-1:** El toggle de tema permite alternar entre tres modos: "Claro", "Oscuro" y "Sistema", donde "Sistema" sigue automáticamente la preferencia del sistema operativo (`prefers-color-scheme`).
- [ ] **AC-2:** Al cambiar el tema, toda la interfaz se actualiza instantáneamente: colores de fondo, texto, bordes, tarjetas y todos los componentes de shadcn/ui respetan el tema seleccionado sin recarga de página.
- [ ] **AC-3:** La preferencia de tema seleccionada se persiste en localStorage y se restaura correctamente al recargar la página o volver a la aplicación.
- [ ] **AC-4:** Las notificaciones tipo toast se muestran en la esquina superior derecha con cuatro variantes visuales distinguibles: success (verde), error (rojo), warning (amarillo) e info (azul), cada una con ícono correspondiente.
- [ ] **AC-5:** Las notificaciones se auto-descartan después de 5 segundos por defecto (configurable), pueden descartarse manualmente con un botón de cierre, y se apilan verticalmente cuando hay múltiples activas simultáneamente (máximo 3 visibles).

### Técnicos
- [ ] **AC-T1:** El `ThemeProvider` expone mediante contexto: `{ theme, setTheme, resolvedTheme }` donde `theme` es la preferencia guardada ('light'|'dark'|'system') y `resolvedTheme` es el tema efectivo aplicado ('light'|'dark'), calculado considerando la preferencia del sistema cuando `theme === 'system'`.
- [ ] **AC-T2:** El tema se aplica añadiendo/removiendo la clase `dark` en el elemento `<html>` y las variables CSS se definen en `:root` y `.dark` para que Tailwind CSS v4 y shadcn/ui respeten los cambios automáticamente.
- [ ] **AC-T3:** El `NotificationProvider` expone: `{ notify, dismiss, clearAll }` donde `notify({ type, title, message, duration? })` añade una notificación a la cola y retorna un `id` para dismiss programático.
- [ ] **AC-T4:** Ambos providers se componen en `src/app/providers.tsx` envolviendo el árbol de la aplicación: `<ThemeProvider><NotificationProvider><QueryClientProvider>...</QueryClientProvider></NotificationProvider></ThemeProvider>`.

### QA
- [ ] **QA-1:** Verificar que al seleccionar modo "Sistema" y cambiar la preferencia del SO (en DevTools: `prefers-color-scheme: dark`), el tema de la aplicación cambia automáticamente sin necesidad de recargar.
- [ ] **QA-2:** Comprobar que al disparar 5 notificaciones rápidamente, solo se muestran 3 como máximo, las más antiguas se descartan primero, y cada una se auto-descarta tras el timeout configurado.
- [ ] **QA-3:** Validar que la preferencia de tema persiste tras cerrar y abrir el navegador, y que no hay flash de tema incorrecto al cargar la página (FOUC prevention).

## Tareas

| ID | Tarea | Estimación | Prioridad |
|----|-------|-----------|-----------|
| T-FE-101 | Implementar `ThemeProvider` con Context, detección de preferencia del sistema, persistencia en localStorage y aplicación de clase CSS | 1h | Alta |
| T-FE-102 | Crear custom hook `useTheme()` que expone `theme`, `setTheme` y `resolvedTheme` consumiendo el ThemeContext | 0.5h | Alta |
| T-FE-103 | Implementar `NotificationProvider` con Context, sistema de cola, auto-dismiss y límite de toasts visibles | 1h | Alta |
| T-FE-104 | Crear componente `Toast` con variantes visuales (success, error, warning, info), animaciones de entrada/salida y botón de cierre | 0.5h | Alta |
| T-FE-105 | Componer providers en `src/app/providers.tsx` con el orden correcto de anidamiento | 0.5h | Media |
| T-FE-106 | Prevenir FOUC (Flash of Unstyled Content) mediante script inline en `index.html` que aplica el tema antes del render de React | 0.5h | Media |

## Notas Técnicas
- Para prevenir FOUC, agregar un script bloqueante en `<head>` de `index.html` que lee `localStorage.getItem('theme')` y aplica la clase `dark` al `<html>` antes de que React monte: esto evita el flash de tema incorrecto al cargar.
- La detección de preferencia del sistema usa `window.matchMedia('(prefers-color-scheme: dark)')` con un listener `change` para reaccionar a cambios en tiempo real.
- Para las notificaciones, considerar usar el componente `Toast`/`Toaster` de shadcn/ui como base visual, extendiendo con la lógica del provider para el sistema de cola.
- Documentar en comentarios del código por qué Context es apropiado aquí: el tema cambia raramente (clicks del usuario) y las notificaciones son transversales a toda la app. Contraejemplo: datos de formulario o estado de fetching donde `useState` local o React Query son mejores opciones.
- El `NotificationProvider` debe usar `useReducer` internamente para manejar la cola de notificaciones (ADD_NOTIFICATION, DISMISS_NOTIFICATION, CLEAR_ALL) en lugar de múltiples `useState`.
- Las animaciones de entrada/salida de los toasts pueden usar `keyframes` de Tailwind o `framer-motion` si ya está en las dependencias del proyecto.

## Dependencias
- **Depende de:** HU-FE-001 (setup del proyecto con Tailwind CSS v4 y shadcn/ui configurados)
- **Bloquea a:** HU-FE-020 (el toggle de tema en el header usa el ThemeProvider), todas las historias que usen notificaciones de feedback (HU-FE-012, HU-FE-014, HU-FE-016, HU-FE-019)
