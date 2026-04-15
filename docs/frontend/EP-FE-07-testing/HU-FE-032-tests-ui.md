# HU-FE-032: Tests de Componentes UI

## Descripcion
Como equipo de desarrollo, quiero contar con una suite completa de tests unitarios, de integracion y snapshot para los componentes del sistema de UI, para asegurar que los componentes compartidos funcionan correctamente y mantienen su apariencia visual consistente.

La suite de tests del sistema de UI cubre los componentes fundacionales de la aplicacion. A nivel unitario, se testea el `ThemeProvider` verificando que alterna correctamente entre modo oscuro y claro, y el `ErrorBoundary` verificando que captura errores de renderizado y muestra el componente fallback adecuado. A nivel de integracion, se testea el `AppLayout` verificando que renderiza correctamente los slots de contenido (header, sidebar, main); el `QuizPlayer` simulando el flujo de responder una pregunta y verificar el resultado; y el wrapper de Editor.js verificando la carga y el guardado de contenido enriquecido. Adicionalmente, se incluyen snapshot tests para componentes clave (`CourseCard`, `LessonView`) que garantizan que la estructura visual no cambia inesperadamente ante refactorizaciones.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Joshua Rodriguez |
| QA | Daniel Soto |

## Tema React Asociado
**Tema #15:** Testing (Vitest/RTL) — Esta historia aplica testing de componentes de UI incluyendo snapshot testing, testing de providers de contexto (ThemeProvider) y testing de componentes que manejan errores (ErrorBoundary).

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** Existen tests unitarios para `ThemeProvider` que verifican: el tema por defecto es 'light', al invocar `toggleTheme()` cambia a 'dark', y la clase CSS correspondiente se aplica al elemento raiz.
- [ ] **AC-2:** Existen tests unitarios para `ErrorBoundary` que verifican: cuando un componente hijo lanza un error, se renderiza el componente fallback en lugar del componente con error, y el error se registra correctamente.
- [ ] **AC-3:** Existe un test de integracion para `AppLayout` que verifica que los slots de header, sidebar y contenido principal se renderizan correctamente con los children proporcionados.
- [ ] **AC-4:** Existe un test de integracion para `QuizPlayer` que simula: seleccionar una respuesta, hacer clic en "Verificar", y verificar que se muestra si la respuesta es correcta o incorrecta con el feedback correspondiente.
- [ ] **AC-5:** Existe un test de integracion para el wrapper de Editor.js que verifica la carga del editor con contenido inicial y el guardado del contenido editado.
- [ ] **AC-6:** Existen snapshot tests para `CourseCard` y `LessonView` que capturan la estructura HTML renderizada y fallan si hay cambios inesperados.

### Tecnicos
- [ ] **AC-T1:** Los snapshot tests usan `toMatchSnapshot()` de Vitest y los archivos de snapshot se almacenan en `__snapshots__/` junto a los archivos de test.
- [ ] **AC-T2:** El test de `ErrorBoundary` usa un componente de test que lanza un error intencionalmente y verifica que `console.error` se llama (mockeando `console.error` para evitar ruido en la salida de tests).
- [ ] **AC-T3:** Los tests del wrapper de Editor.js mockean la libreria Editor.js completamente ya que no funciona en entorno JSDOM, verificando las interacciones a nivel de la API del wrapper.
- [ ] **AC-T4:** Los tests de `ThemeProvider` acceden al contexto usando un componente de test consumidor que lee el tema actual y expone la funcion de toggle.

### QA
- [ ] **QA-1:** La cobertura de tests del modulo de UI (`src/modules/ui/` y `src/shared/components/`) alcanza al menos 75% en lineas.
- [ ] **QA-2:** Los snapshot tests se actualizan intencionalmente (con `--update`) solo cuando hay cambios visuales deliberados; cambios accidentales causan que el test falle.
- [ ] **QA-3:** Al romper el layout del `AppLayout` (por ejemplo, eliminar un slot), el test de integracion correspondiente falla.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-220 | Escribir tests unitarios para `ThemeProvider` (toggle, clase CSS, estado inicial) | 0.5h | Alta |
| T-FE-221 | Escribir tests unitarios para `ErrorBoundary` (captura de error, renderizado de fallback) | 0.5h | Alta |
| T-FE-222 | Escribir tests de integracion para `AppLayout` (renderizado de slots) | 0.5h | Media |
| T-FE-223 | Escribir tests de integracion para `QuizPlayer` (flujo de respuesta completo) | 1h | Alta |
| T-FE-224 | Escribir tests de integracion para wrapper de Editor.js (carga y guardado) | 0.5h | Media |
| T-FE-225 | Crear snapshot tests para `CourseCard` y `LessonView` | 0.5h | Media |
| T-FE-226 | Configurar mocks necesarios para Editor.js y componentes complejos | 0.5h | Alta |

## Notas Tecnicas
- Para testear `ThemeProvider`:
  ```typescript
  function TestConsumer() {
    const { theme, toggleTheme } = useTheme();
    return (
      <div>
        <span data-testid="theme">{theme}</span>
        <button onClick={toggleTheme}>Toggle</button>
      </div>
    );
  }
  
  it('debe alternar entre light y dark', async () => {
    render(<ThemeProvider><TestConsumer /></ThemeProvider>);
    expect(screen.getByTestId('theme')).toHaveTextContent('light');
    await userEvent.click(screen.getByText('Toggle'));
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });
  ```
- Para testear `ErrorBoundary`, mockear `console.error` para suprimir la salida de error esperada:
  ```typescript
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  // ... render component that throws ...
  consoleSpy.mockRestore();
  ```
- Para Editor.js, crear un mock completo del modulo que simule la API de inicializacion y guardado:
  ```typescript
  vi.mock('@editorjs/editorjs', () => ({
    default: vi.fn().mockImplementation(() => ({
      isReady: Promise.resolve(),
      save: vi.fn().mockResolvedValue({ blocks: [] }),
      destroy: vi.fn(),
    })),
  }));
  ```
- Los snapshot tests deben renderizar los componentes con datos representativos (no vacios) para capturar una estructura significativa.

## Dependencias
- **Depende de:** HU-FE-020 (ThemeProvider), HU-FE-021 (AppLayout), HU-FE-022 (ErrorBoundary), HU-FE-024 (QuizPlayer), HU-FE-025 (Editor.js Wrapper)
- **Bloquea a:** Ninguna
