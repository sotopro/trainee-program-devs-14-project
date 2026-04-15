# HU-BE-014: Fork de Learning Path

## Descripcion
Como usuario, quiero hacer un fork de un learning path existente para poder personalizar mi ruta de aprendizaje agregando contenido generado por IA sin afectar el path original ni a otros usuarios.

El fork de un learning path es la funcionalidad central que permite el crecimiento organico del contenido. Al hacer fork, se crea un nuevo learning path que es una copia del path padre con todas sus lecciones en el mismo orden. El nuevo path tiene `parentPathId` apuntando al path original, formando un arbol de ramificaciones. Despues del fork, el enrollment del usuario se actualiza para apuntar al nuevo path, y el usuario puede agregar nuevas lecciones generadas por IA a su path personalizado.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Jazir Olivera |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint POST /api/paths/:parentPathId/fork crea un nuevo learning path con `parentPathId` apuntando al path original.
- [ ] **AC-2:** El fork contiene una copia de todas las lecciones del path padre con el mismo orden en la tabla LearningPathLesson.
- [ ] **AC-3:** Despues del fork, el enrollment del usuario se actualiza automaticamente para apuntar al nuevo learning path.
- [ ] **AC-4:** El endpoint GET /api/paths/:id/tree devuelve el arbol completo de forks (padre, hijos, nietos) partiendo desde cualquier nodo.
- [ ] **AC-5:** El usuario puede agregar nuevas lecciones generadas por IA a su path forkeado (integracion con HU-BE-023).
- [ ] **AC-6:** Un usuario solo puede hacer fork de un path que pertenezca a un curso en el que esta inscrito.

### Tecnicos
- [ ] **AC-T1:** La copia de las lecciones del path padre y la actualizacion del enrollment se realizan dentro de una transaccion de Prisma.
- [ ] **AC-T2:** El arbol de forks se construye mediante consultas recursivas o carga de todos los paths del curso y construccion en memoria.
- [ ] **AC-T3:** Se valida que el usuario tiene un enrollment activo en el curso del path antes de permitir el fork.
- [ ] **AC-T4:** El nuevo path se nombra automaticamente como "[Nombre del path padre] - Fork de [Nombre del usuario]".

### QA
- [ ] **QA-1:** Verificar que el fork crea una copia exacta de las lecciones del path padre y que las lecciones originales no se ven afectadas.
- [ ] **QA-2:** Verificar que el enrollment del usuario se actualiza al nuevo path y que el progreso previo se mantiene para las lecciones que ya estaban completadas.
- [ ] **QA-3:** Verificar que el arbol de forks se construye correctamente con multiples niveles (padre -> hijo -> nieto).

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-014-1 | Implementar logica de fork: copia de LearningPathLesson y creacion del nuevo path | 1.5h | Alta |
| T-BE-014-2 | Implementar actualizacion automatica del enrollment del usuario al nuevo path | 0.5h | Alta |
| T-BE-014-3 | Implementar endpoint GET /api/paths/:id/tree para arbol de forks | 1h | Alta |
| T-BE-014-4 | Implementar validaciones (enrollment activo, pertenencia al curso) | 0.5h | Alta |
| T-BE-014-5 | Implementar controladores y rutas con middleware de autenticacion | 0.5h | Media |
| T-BE-014-6 | Implementar logica para agregar lecciones nuevas al path forkeado | 1h | Media |

## Notas Tecnicas

### Especificacion de Endpoints

**POST /api/paths/:parentPathId/fork** (Autenticado, inscrito en el curso)
- No requiere body (el nombre se genera automaticamente).
- Respuesta (201 Created):
```json
{
  "id": "uuid-new-path",
  "name": "Main Branch - Fork de Juan Perez",
  "isDefault": false,
  "parentPathId": "uuid-parent-path",
  "courseId": "uuid",
  "lessonCount": 10,
  "enrollment": {
    "id": "uuid-enrollment",
    "learningPathId": "uuid-new-path"
  }
}
```

**GET /api/paths/:id/tree** (Autenticado)
- Respuesta:
```json
{
  "id": "uuid-main",
  "name": "Main Branch",
  "isDefault": true,
  "parentPathId": null,
  "lessonCount": 10,
  "children": [
    {
      "id": "uuid-fork-1",
      "name": "Main Branch - Fork de Juan",
      "parentPathId": "uuid-main",
      "lessonCount": 12,
      "children": [
        {
          "id": "uuid-fork-1-1",
          "name": "Main Branch - Fork de Juan - Fork de Maria",
          "parentPathId": "uuid-fork-1",
          "lessonCount": 14,
          "children": []
        }
      ]
    },
    {
      "id": "uuid-fork-2",
      "name": "Main Branch - Fork de Pedro",
      "parentPathId": "uuid-main",
      "lessonCount": 11,
      "children": []
    }
  ]
}
```

### Flujo del Fork
1. Verificar que el usuario tiene enrollment activo en el curso del path.
2. Crear nuevo LearningPath con `parentPathId` y nombre generado.
3. Copiar todos los registros de LearningPathLesson del path padre al nuevo path.
4. Actualizar el enrollment del usuario para apuntar al nuevo path.
5. Migrar el progreso existente (LessonProgress) al contexto del nuevo path.

### Consideraciones
- El fork NO duplica las lecciones en si, solo crea nuevas entradas en LearningPathLesson que apuntan a las mismas lecciones.
- Las lecciones nuevas generadas por IA (HU-BE-023) si son registros nuevos en la tabla Lesson y se agregan al LearningPathLesson del fork.
- Para el arbol, se recomienda cargar todos los paths del curso y construir la jerarquia en el servidor para evitar consultas recursivas complejas.
- El progreso del usuario en lecciones ya completadas debe preservarse al cambiar de path.

## Dependencias
- **Depende de:** HU-BE-013 (CRUD de Learning Paths), HU-BE-023 (Expansion de Learning Paths)
- **Bloquea a:** HU-BE-023 (Expansion de Learning Paths - dependencia circular, desarrollar en paralelo con contratos definidos)
