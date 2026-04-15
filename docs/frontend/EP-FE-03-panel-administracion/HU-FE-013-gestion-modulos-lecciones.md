# HU-FE-013: Gestión de Módulos y Lecciones

## Descripción
Como administrador, quiero gestionar los módulos y lecciones de un curso con una interfaz intuitiva de acordeones para poder organizar, editar y eliminar contenido de forma eficiente sin salir de la vista del curso.

Esta historia de usuario implementa la interfaz de gestión de la estructura interna de un curso en LearnPath. Se presenta una vista basada en acordeones (Accordion de shadcn/ui) donde cada módulo se muestra como un panel colapsable que, al expandirse, revela las lecciones contenidas. El administrador puede reordenar módulos y lecciones mediante drag & drop, editar títulos y descripciones directamente en línea (modo de edición inline) sin necesidad de abrir un formulario separado, y eliminar elementos con un diálogo de confirmación que advierte sobre las consecuencias. Todas las operaciones de mutación (crear, editar, reordenar, eliminar) utilizan React Query mutations con invalidación de cache adecuada para mantener la UI sincronizada con el servidor.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Edgar Chacon |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #9:** TanStack Query Mutations — Se aplican patrones de mutaciones con `useMutation` incluyendo invalidación selectiva de cache, manejo de estados de carga por mutación individual, y actualización optimista del orden tras drag & drop.

## Criterios de Aceptación

### Funcionales
- [ ] **AC-1:** Los módulos de un curso se muestran en una lista de acordeones colapsables, donde cada acordeón muestra el título del módulo, número de lecciones y controles de acción (editar, eliminar, reordenar).
- [ ] **AC-2:** Al expandir un acordeón de módulo, se listan las lecciones contenidas con su título, orden y controles individuales (editar, eliminar, reordenar).
- [ ] **AC-3:** El drag & drop permite reordenar tanto módulos entre sí como lecciones dentro de un módulo, actualizando visualmente el orden y persistiendo el cambio en el backend.
- [ ] **AC-4:** El modo de edición inline se activa al hacer clic en el botón de editar o doble clic sobre el título, transformando el texto en un campo editable que se guarda al presionar Enter o perder foco.
- [ ] **AC-5:** Al intentar eliminar un módulo o lección, se muestra un diálogo de confirmación de shadcn/ui indicando las consecuencias (ej. "Este módulo contiene 5 lecciones que también se eliminarán") y requiere confirmación explícita.
- [ ] **AC-6:** Se puede agregar un nuevo módulo al final de la lista o una nueva lección al final de un módulo mediante botones "Agregar módulo" y "Agregar lección" respectivamente.

### Técnicos
- [ ] **AC-T1:** Las operaciones de reordenamiento utilizan `useMutation` con actualización optimista del estado local y rollback automático si la petición al API falla.
- [ ] **AC-T2:** Tras cada mutación exitosa (crear, editar, eliminar, reordenar), se invalida selectivamente la cache de React Query usando `queryClient.invalidateQueries(['courses', courseId, 'modules'])` para refrescar solo los datos afectados.
- [ ] **AC-T3:** Los componentes de acordeón utilizan `Accordion`, `AccordionItem`, `AccordionTrigger` y `AccordionContent` de shadcn/ui para mantener consistencia visual.
- [ ] **AC-T4:** El modo de edición inline utiliza un estado local controlado (`isEditing`) y `useRef` para el auto-focus del campo de texto al activarse.

### QA
- [ ] **QA-1:** Verificar que al reordenar un módulo mediante drag & drop, el nuevo orden se refleja visualmente de inmediato y persiste tras recargar la página.
- [ ] **QA-2:** Comprobar que al eliminar un módulo con lecciones, el diálogo de confirmación muestra el conteo correcto de lecciones afectadas y que tras confirmar, tanto el módulo como sus lecciones desaparecen de la vista.
- [ ] **QA-3:** Validar que la edición inline funciona correctamente: el campo se activa con doble clic, se guarda al presionar Enter, se cancela con Escape, y los cambios se reflejan inmediatamente en la UI.

## Tareas

| ID | Tarea | Estimación | Prioridad |
|----|-------|-----------|-----------|
| T-FE-053 | Implementar componente `ModuleAccordion` con shadcn/ui Accordion mostrando módulos y lecciones anidadas | 1h | Alta |
| T-FE-054 | Integrar drag & drop con `@dnd-kit` para reordenamiento de módulos y lecciones con actualización optimista | 1.5h | Alta |
| T-FE-055 | Desarrollar componente `InlineEdit` reutilizable para edición inline de títulos y descripciones | 0.5h | Alta |
| T-FE-056 | Implementar mutaciones de React Query para CRUD de módulos y lecciones con invalidación de cache selectiva | 1h | Alta |
| T-FE-057 | Crear diálogo de confirmación de eliminación con conteo de elementos afectados | 0.5h | Media |
| T-FE-058 | Agregar botones y flujo para crear nuevos módulos y lecciones desde la vista de gestión | 0.5h | Media |

## Notas Técnicas
- Para el drag & drop, reutilizar la misma implementación de `@dnd-kit` configurada en HU-FE-012 pero adaptada al contexto de la lista de acordeones.
- El componente `InlineEdit` debe ser genérico y reutilizable: recibe `value`, `onSave`, `onCancel` y opcionalmente un esquema Zod para validación inline.
- Considerar usar `useMutation` con `onMutate` para actualización optimista del orden: guardar el snapshot previo, aplicar el cambio inmediatamente y revertir en `onError`.
- Para la eliminación en cascada, el diálogo debe consultar el número de lecciones del módulo antes de mostrarse; esta información ya debería estar en la cache de React Query.
- El estado de los acordeones abiertos/cerrados puede manejarse con el prop `value` del componente `Accordion` de shadcn/ui para permitir múltiples acordeones abiertos simultáneamente (`type="multiple"`).
- Implementar feedback visual durante el drag: sombra elevada en el elemento arrastrado y un placeholder en la posición de destino.

## Dependencias
- **Depende de:** HU-FE-012 (formularios de cursos, módulos y lecciones con Zod)
- **Bloquea a:** HU-FE-017 (la vista de lección depende de que existan módulos y lecciones gestionados)
