# HU-FE-020: Layout System con Composición Avanzada

## Descripción
Como usuario de la plataforma, quiero navegar por una interfaz con un layout consistente y bien organizado para poder acceder a todas las secciones de forma intuitiva sin importar el dispositivo que use.

Esta historia de usuario implementa el sistema de layout principal de LearnPath utilizando el patrón de composición avanzada de React. Se crea un componente `AppLayout` como compound component con slots dedicados: `<AppLayout.Header>`, `<AppLayout.Sidebar>`, `<AppLayout.Content>` y `<AppLayout.Footer>`, donde cada slot acepta children como contenido y se posiciona automáticamente en el grid del layout. El componente `PageShell` actúa como wrapper para páginas individuales, aceptando children como slots para título, acciones y contenido, evitando prop drilling. El sidebar es colapsable en desktop y se transforma en un drawer deslizable en dispositivos móviles. El header incluye avatar del usuario, campana de notificaciones y toggle de tema claro/oscuro. Este enfoque demuestra claramente el principio de composición sobre herencia, donde la flexibilidad se logra componiendo elementos en lugar de extender clases base.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Joshua Rodriguez |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #1:** Composición Avanzada — Se implementa el patrón compound component en `AppLayout` donde los sub-componentes (Header, Sidebar, Content, Footer) se comunican implícitamente a través del contexto del padre sin necesidad de pasar props explícitamente. `PageShell` demuestra el patrón de slots con children, evitando prop drilling y favoreciendo composición sobre herencia.

## Criterios de Aceptación

### Funcionales
- [ ] **AC-1:** El `AppLayout` renderiza correctamente las cuatro secciones (header, sidebar, contenido principal, footer) en un grid CSS que ocupa el 100% del viewport, con el sidebar a la izquierda y el contenido principal a la derecha.
- [ ] **AC-2:** El sidebar muestra los enlaces de navegación principales (Dashboard, Catálogo, Mis Cursos, Perfil; y para admin: Gestión de Cursos, Usuarios), es colapsable mediante un botón toggle que reduce su ancho a solo íconos, y recuerda el estado colapsado durante la sesión.
- [ ] **AC-3:** En dispositivos móviles (< 768px), el sidebar se oculta completamente y se reemplaza por un drawer deslizable activado por un botón hamburguesa en el header.
- [ ] **AC-4:** El header muestra el logo de LearnPath a la izquierda, y a la derecha: campana de notificaciones con badge de conteo, toggle de tema (claro/oscuro) y avatar del usuario con menú dropdown (Perfil, Configuración, Cerrar sesión).
- [ ] **AC-5:** El componente `PageShell` permite definir el título de la página, acciones del header (botones) y el contenido principal como children, manteniendo consistencia visual en todas las páginas sin repetir código de layout.
- [ ] **AC-6:** El layout se adapta correctamente a las resoluciones de 320px, 768px, 1024px y 1440px sin desbordamientos, solapamientos ni scroll horizontal.

### Técnicos
- [ ] **AC-T1:** `AppLayout` se implementa como compound component con sub-componentes estáticos (`AppLayout.Header`, `AppLayout.Sidebar`, `AppLayout.Content`, `AppLayout.Footer`) que se comunican mediante un `LayoutContext` interno para compartir estado de colapsado/expandido del sidebar.
- [ ] **AC-T2:** El sidebar en móvil utiliza el componente `Sheet` de shadcn/ui con `side="left"` para el drawer, y la detección del breakpoint se realiza con un custom hook `useMediaQuery('(min-width: 768px)')`.
- [ ] **AC-T3:** El estado de colapso del sidebar se persiste en `localStorage` y se inicializa con el valor guardado para mantener la preferencia del usuario entre recargas.
- [ ] **AC-T4:** Los sub-componentes del compound component utilizan `displayName` para facilitar el debugging en React DevTools y se valida que solo se usen dentro de `AppLayout` mediante un check del contexto.

### QA
- [ ] **QA-1:** Verificar que al colapsar el sidebar en desktop, el contenido principal se expande para ocupar el espacio liberado, y que al expandirlo se reduce correctamente, con transición animada suave.
- [ ] **QA-2:** Comprobar que en un dispositivo móvil (o viewport de 375px), el drawer del sidebar se abre al presionar el botón hamburguesa, muestra los enlaces de navegación, y se cierra al seleccionar un enlace o al presionar fuera del drawer.
- [ ] **QA-3:** Validar que el `PageShell` mantiene el layout consistente en todas las páginas: al navegar entre Dashboard, Catálogo y Mis Cursos, el header, sidebar y footer permanecen estables y solo el contenido principal cambia.

## Tareas

| ID | Tarea | Estimación | Prioridad |
|----|-------|-----------|-----------|
| T-FE-095 | Implementar compound component `AppLayout` con sub-componentes Header, Sidebar, Content, Footer y LayoutContext interno | 1.5h | Alta |
| T-FE-096 | Desarrollar sidebar con enlaces de navegación, estado colapsable, transiciones animadas y persistencia en localStorage | 1h | Alta |
| T-FE-097 | Crear header con logo, campana de notificaciones, toggle de tema y avatar con dropdown usando componentes shadcn/ui | 1h | Alta |
| T-FE-098 | Implementar `PageShell` con slots para título, acciones y contenido principal | 0.5h | Alta |
| T-FE-099 | Desarrollar comportamiento responsivo: drawer con Sheet de shadcn/ui para móvil y custom hook `useMediaQuery` | 1h | Media |
| T-FE-100 | Crear footer y ajustar grid CSS del layout para todas las resoluciones objetivo | 1h | Media |

## Notas Técnicas
- Estructura del compound component:
  ```typescript
  const AppLayout = ({ children }) => {
    return <LayoutProvider>{children}</LayoutProvider>;
  };
  AppLayout.Header = LayoutHeader;
  AppLayout.Sidebar = LayoutSidebar;
  AppLayout.Content = LayoutContent;
  AppLayout.Footer = LayoutFooter;
  ```
- El grid CSS del layout puede usar: `grid-template-areas: "sidebar header" "sidebar content" "sidebar footer"` con `grid-template-columns: auto 1fr` para permitir que el sidebar tenga ancho variable según su estado.
- Para el toggle de tema en el header, solo renderizar el botón aquí; la lógica de cambio de tema se maneja en el `ThemeProvider` (HU-FE-021).
- El custom hook `useMediaQuery` puede implementarse con `window.matchMedia` y un listener de cambios para reaccionar a redimensionamiento del viewport.
- Considerar usar `NavigationMenu` de shadcn/ui para los enlaces del sidebar, con indicador de ruta activa usando `useLocation` de React Router.
- El dropdown del avatar puede usar `DropdownMenu` de shadcn/ui con `DropdownMenuTrigger`, `DropdownMenuContent` y `DropdownMenuItem`.

## Dependencias
- **Depende de:** HU-FE-001 (setup del proyecto con React Router, Tailwind CSS v4 y shadcn/ui configurados)
- **Bloquea a:** Todas las páginas que utilizan el layout: HU-FE-011 (dashboard), HU-FE-015 (catálogo), HU-FE-016 (mis cursos), HU-FE-017 (vista de lección)
