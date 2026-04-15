# HU-FE-022: Integración de Editor.js

## Descripción
Como administrador, quiero usar un editor de contenido rico y versátil para crear el contenido de las lecciones para poder producir material educativo atractivo con texto, imágenes, videos, código y otros elementos multimedia.

Esta historia de usuario implementa la integración de Editor.js en LearnPath como el editor de contenido principal para la creación de lecciones. Se desarrolla un componente `EditorWrapper` que inicializa Editor.js con un conjunto completo de herramientas (tools): Header para títulos jerárquicos, List para listas ordenadas y no ordenadas, Code para bloques de código, Image para imágenes, Embed para videos de YouTube, Quote para citas, Delimiter para separadores visuales y Table para tablas de datos. El editor soporta dos modos de operación: modo de edición completo para administradores creando contenido, y modo de solo lectura para usuarios visualizando las lecciones. Los datos se guardan y cargan como JSON, lo que facilita el almacenamiento y la renderización posterior. Adicionalmente, se implementa un componente `MediaEmbed` dedicado para embeds de YouTube e imágenes con comportamiento responsivo.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Joshua Rodriguez |
| QA | Daniel Soto |

## Criterios de Aceptación

### Funcionales
- [ ] **AC-1:** El editor permite insertar y editar los siguientes tipos de bloques: encabezados (H1-H6), párrafos de texto con formato (negrita, cursiva, enlace), listas (ordenadas y no ordenadas), bloques de código, imágenes, embeds de YouTube, citas, delimitadores y tablas.
- [ ] **AC-2:** En modo de edición, el editor muestra una barra lateral de herramientas (tool sidebar) al hacer clic en el botón "+" que permite seleccionar el tipo de bloque a insertar, y una toolbar inline al seleccionar texto para aplicar formato.
- [ ] **AC-3:** En modo de solo lectura, el contenido se muestra sin controles de edición, las herramientas están deshabilitadas y el usuario no puede modificar ningún bloque.
- [ ] **AC-4:** El contenido se guarda como JSON estructurado al invocar el método `save()` del editor, y se carga desde JSON al inicializar el editor con la prop `data`, permitiendo persistencia completa del contenido.
- [ ] **AC-5:** Los embeds de YouTube se renderizan como reproductores responsivos que aceptan URLs estándar de YouTube (`youtube.com/watch?v=` y `youtu.be/`) y las imágenes se muestran con caption opcional y comportamiento responsivo.

### Técnicos
- [ ] **AC-T1:** El componente `EditorWrapper` acepta las props: `data` (JSON inicial), `readOnly` (boolean), `onChange` (callback al cambiar contenido), `placeholder` (texto placeholder) y `editorRef` (ref para acceder a la instancia del editor desde el componente padre).
- [ ] **AC-T2:** La inicialización de Editor.js se realiza dentro de un `useEffect` con cleanup que destruye la instancia al desmontar el componente, previniendo memory leaks y errores de doble inicialización en React 19 Strict Mode.
- [ ] **AC-T3:** Las herramientas del editor se configuran mediante imports dinámicos de los paquetes: `@editorjs/header`, `@editorjs/list`, `@editorjs/code`, `@editorjs/image`, `@editorjs/embed`, `@editorjs/quote`, `@editorjs/delimiter`, `@editorjs/table`.
- [ ] **AC-T4:** El componente `MediaEmbed` encapsula la lógica de renderización de YouTube (extracción de video ID, iframe con aspect-ratio 16:9) e imágenes (loading lazy, max-width responsivo, caption), reutilizable tanto en el editor como en el renderer de lecciones.

### QA
- [ ] **QA-1:** Verificar que al crear contenido con todos los tipos de bloques disponibles, guardar el JSON y recargar el editor con ese JSON, el contenido se restaura idénticamente sin pérdida de formato o estructura.
- [ ] **QA-2:** Comprobar que en modo de solo lectura no es posible modificar ningún bloque: no aparecen toolbars, no se pueden eliminar bloques y el contenido no es editable al hacer clic.
- [ ] **QA-3:** Validar que los embeds de YouTube funcionan con al menos 3 formatos de URL distintos (`https://www.youtube.com/watch?v=xxx`, `https://youtu.be/xxx`, `https://www.youtube.com/embed/xxx`) y que se renderizan responsivamente en móvil y desktop.

## Tareas

| ID | Tarea | Estimación | Prioridad |
|----|-------|-----------|-----------|
| T-FE-107 | Instalar Editor.js y todos los plugins necesarios como dependencias del proyecto | 0.5h | Alta |
| T-FE-108 | Implementar componente `EditorWrapper` con inicialización, cleanup, modos de edición/lectura y props tipadas | 1.5h | Alta |
| T-FE-109 | Configurar las herramientas del editor (Header, List, Code, Image, Embed, Quote, Delimiter, Table) con opciones personalizadas | 1h | Alta |
| T-FE-110 | Desarrollar componente `MediaEmbed` para YouTube e imágenes con comportamiento responsivo y caption | 0.5h | Alta |
| T-FE-111 | Implementar lógica de save/load JSON con callback `onChange` para integración con formularios de RHF | 0.5h | Alta |
| T-FE-112 | Aplicar estilos CSS/Tailwind al editor para consistencia visual con el diseño de la plataforma y el tema activo | 1h | Media |

## Notas Técnicas
- Editor.js manipula el DOM directamente, lo que puede entrar en conflicto con el Virtual DOM de React. El `useEffect` de inicialización debe tener un guard para evitar doble inicialización: usar un `useRef(false)` como flag de inicialización.
- Para React 19 Strict Mode (que ejecuta effects dos veces en desarrollo), es crucial que el cleanup de `useEffect` destruya correctamente la instancia con `editorInstance.destroy()`.
- La integración con React Hook Form se logra registrando el editor como campo controlado con `Controller`: en `onChange` del editor, llamar `field.onChange(editorData)` para sincronizar el estado del formulario.
- Para el tema oscuro, aplicar estilos CSS custom al editor que sobrescriban los estilos por defecto de Editor.js cuando la clase `dark` está presente: `.dark .ce-block { color: white; }`.
- La tool de Image puede configurarse para subir archivos a un endpoint o aceptar URLs directas; para el MVP, priorizar la entrada de URL directa para simplificar.
- Considerar lazy loading del editor con `React.lazy` ya que Editor.js y sus plugins son relativamente pesados (~150KB) y solo se necesitan en las páginas de edición y visualización.

## Dependencias
- **Depende de:** HU-FE-001 (setup del proyecto)
- **Bloquea a:** HU-FE-012 (formulario de lecciones usa Editor.js para el campo de contenido), HU-FE-017 (vista de lección renderiza contenido de Editor.js en modo lectura)
