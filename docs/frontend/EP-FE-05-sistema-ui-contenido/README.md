# EP-FE-05: Sistema UI y Contenido

## Descripcion

Esta epica se enfoca en la construccion del sistema de componentes UI compartidos, la infraestructura de layout, los proveedores de contexto globales y la integracion del editor de contenido enriquecido. Joshua Rodriguez, como desarrollador frontend exclusivo, se especializa en crear los cimientos visuales y de interaccion sobre los que el resto del equipo construye sus interfaces.

El sistema de layout utiliza patrones avanzados de composicion de componentes en React, incluyendo slots, compound components y children composition para crear layouts flexibles y reutilizables. Se implementan Context Providers globales para temas (ThemeProvider con modo claro/oscuro) y notificaciones (NotificationProvider con sistema de toasts), asegurando que toda la aplicacion tenga acceso a estos servicios de forma consistente.

La integracion de Editor.js proporciona un editor de bloques robusto para que los administradores creen contenido educativo rico (texto, imagenes, codigo, listas, tablas). Ademas, se construye la UI de quizzes con sus distintos tipos de preguntas. Finalmente, se aplican tecnicas de optimizacion de rendimiento como React.memo, useMemo, useCallback y code splitting con React.lazy y Suspense para garantizar que la aplicacion sea rapida y eficiente, utilizando React Profiler para validar las optimizaciones.

## Responsable(s)

| Rol | Nombre |
|-----|--------|
| Desarrollador | Joshua Rodriguez |
| QA | Daniel Soto |

## Temas React Asociados

| # | Tema | Descripcion Breve |
|---|------|-------------------|
| 1 | Composicion de Componentes | Patrones de composicion avanzados: children, slots, compound components para layouts y componentes UI |
| 4 | Context API y Providers | Implementacion de ThemeProvider, NotificationProvider y otros contextos globales de la aplicacion |
| 5 | Code Splitting y Lazy Loading | React.lazy, Suspense para carga dinamica de rutas y componentes pesados como Editor.js |
| 12 | Optimizacion de Rendimiento | React.memo, useMemo, useCallback para componentes frecuentemente renderizados, y React Profiler para analisis |

## Historias de Usuario

| ID | Titulo | Prioridad | Semana |
|----|--------|-----------|--------|
| HU-FE-020 | Sistema de layout con composicion de componentes y slots | Alta | S1 |
| HU-FE-021 | Biblioteca de componentes UI compartidos (compound components) | Alta | S1 |
| HU-FE-022 | ThemeProvider con soporte para modo claro/oscuro | Media | S1 |
| HU-FE-023 | NotificationProvider y sistema de toasts | Media | S1 |
| HU-FE-024 | Integracion de Editor.js y UI de quizzes con code splitting | Alta | S1-S2 |
| HU-FE-025 | Optimizacion de rendimiento con React.memo y Profiler | Media | S2 |

### Detalle de Historias

#### HU-FE-020: Sistema de layout con composicion de componentes y slots

**Como** desarrollador del equipo, **quiero** un sistema de layout flexible basado en composicion de componentes con slots, **para** poder construir paginas con estructuras consistentes pero contenido variable sin duplicar codigo de layout.

**Criterios de Aceptacion:**
- Componente `MainLayout` con slots: `header`, `sidebar`, `content`, `footer`.
- Componente `AdminLayout` que extiende `MainLayout` con sidebar de navegacion admin.
- Componente `LearningLayout` con sidebar de progreso y area de contenido.
- Componente `AuthLayout` para paginas de login/registro (centrado, sin sidebar).
- Uso del patron children y slots con props renderizadas para flexibilidad.
- Los layouts son responsivos y se adaptan a diferentes tamanos de pantalla.
- Cada layout define sus propias reglas de espaciado, breakpoints y comportamiento de navegacion.

#### HU-FE-021: Biblioteca de componentes UI compartidos (compound components)

**Como** desarrollador del equipo, **quiero** una biblioteca de componentes UI reutilizables construidos con patrones de compound components, **para** tener una interfaz consistente y componentes flexibles que se adapten a distintos casos de uso.

**Criterios de Aceptacion:**
- `DataTable` como compound component: `<DataTable>`, `<DataTable.Header>`, `<DataTable.Body>`, `<DataTable.Row>`, `<DataTable.Pagination>`.
- `Modal` como compound component: `<Modal>`, `<Modal.Header>`, `<Modal.Body>`, `<Modal.Footer>`.
- `Tabs` como compound component: `<Tabs>`, `<Tabs.List>`, `<Tabs.Tab>`, `<Tabs.Panel>`.
- `Card` extendido: `<Card>`, `<Card.Header>`, `<Card.Content>`, `<Card.Actions>`.
- Todos los componentes usan composicion de React children, no configuracion via props.
- Componentes estilizados con TailwindCSS y variantes via `class-variance-authority`.
- Documentacion de uso (JSDoc) y tipos TypeScript completos.

#### HU-FE-022: ThemeProvider con soporte para modo claro/oscuro

**Como** usuario, **quiero** poder alternar entre modo claro y oscuro en la plataforma, **para** ajustar la interfaz a mis preferencias visuales y condiciones de iluminacion.

**Criterios de Aceptacion:**
- `ThemeContext` creado con `createContext` que provee `theme` (light/dark) y `toggleTheme()`.
- `ThemeProvider` que envuelve la aplicacion y gestiona el estado del tema.
- Persistencia de la preferencia del usuario en `localStorage`.
- Deteccion automatica de preferencia del sistema operativo (`prefers-color-scheme`).
- Toggle de tema accesible desde el header/navbar.
- Las clases de TailwindCSS (`dark:`) se aplican correctamente en todo el arbol de componentes.
- Transicion suave al cambiar de tema.

#### HU-FE-023: NotificationProvider y sistema de toasts

**Como** usuario, **quiero** recibir notificaciones visuales (toasts) cuando realizo acciones importantes (inscripcion exitosa, error al guardar, etc.), **para** tener retroalimentacion inmediata de mis interacciones con la plataforma.

**Criterios de Aceptacion:**
- `NotificationContext` con funciones: `notify(message, type)`, `dismiss(id)`, `clearAll()`.
- `NotificationProvider` que renderiza un contenedor de toasts posicionado en la esquina.
- Tipos de notificacion: success, error, warning, info.
- Auto-dismiss configurable (default 5 segundos).
- Maximo de 5 notificaciones simultaneas (queue para las siguientes).
- Animaciones de entrada y salida.
- Hook `useNotification()` para consumir el contexto en cualquier componente.
- Los toasts usan componentes de shadcn/ui para consistencia visual.

#### HU-FE-024: Integracion de Editor.js y UI de quizzes con code splitting

**Como** administrador, **quiero** un editor de contenido rico para crear lecciones, y como estudiante quiero una UI de quizzes interactiva, cargados dinamicamente para no afectar el rendimiento inicial, **para** crear/consumir contenido educativo de alta calidad sin sacrificar la velocidad de la aplicacion.

**Criterios de Aceptacion:**
- Editor.js integrado como componente React con los plugins: Header, List, Image, Code, Table, Quote, Delimiter.
- El componente de Editor.js se carga con `React.lazy()` y se muestra un `Suspense` fallback durante la carga.
- Serializacion/deserializacion del contenido de Editor.js a JSON para almacenamiento en el backend.
- Componente `LessonRenderer` que renderiza el JSON de Editor.js como HTML/React readonly.
- UI de Quiz con tipos de preguntas: opcion multiple, verdadero/falso, respuesta corta.
- El componente de Quiz tambien se carga con code splitting.
- Code splitting aplicado a las rutas principales (admin, learning, auth) con `React.lazy`.

#### HU-FE-025: Optimizacion de rendimiento con React.memo y Profiler

**Como** desarrollador, **quiero** optimizar los componentes que se renderizan frecuentemente para asegurar una experiencia fluida, **para** que la aplicacion sea rapida incluso con listas grandes de cursos, lecciones y usuarios.

**Criterios de Aceptacion:**
- Identificar componentes candidatos a optimizacion con React Profiler.
- Aplicar `React.memo` a componentes puros que reciben las mismas props frecuentemente (CourseCard, LessonItem, UserRow).
- Implementar `useMemo` para calculos costosos (filtrado de listas, estadisticas de progreso).
- Implementar `useCallback` para handlers pasados como props a componentes hijos memoizados.
- Documentar las mejoras de rendimiento medidas con React Profiler (antes vs despues).
- Asegurar que los componentes memoizados no tienen dependencias que cambien innecesariamente.
- Revision de re-renders innecesarios en componentes clave usando React DevTools.

## Dependencias

- **Depende de:** EP-FE-01 (Setup e Infraestructura).
- **Bloquea a:** EP-FE-03 (parcialmente - usa layouts), EP-FE-04 (usa layouts y componentes UI), EP-FE-06 (usa componentes UI).

## Definition of Done

- [ ] Sistema de layouts implementado con composicion y slots (Main, Admin, Learning, Auth).
- [ ] Componentes compound implementados y documentados (DataTable, Modal, Tabs, Card).
- [ ] ThemeProvider funcional con modo claro/oscuro y persistencia.
- [ ] NotificationProvider con sistema de toasts funcional.
- [ ] Editor.js integrado y funcional con serializacion JSON.
- [ ] LessonRenderer para visualizacion readonly del contenido.
- [ ] UI de Quiz implementada para los tres tipos de preguntas.
- [ ] Code splitting aplicado a Editor.js, Quiz y rutas principales.
- [ ] React.memo, useMemo y useCallback aplicados a componentes clave.
- [ ] Mediciones de rendimiento documentadas con React Profiler.
- [ ] Todos los componentes con tipos TypeScript completos.
- [ ] Componentes estilizados con TailwindCSS y consistentes con shadcn/ui.
