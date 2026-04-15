# HU-BE-007: Middleware de Autenticacion y Roles

## Descripcion
Como equipo de desarrollo, quiero contar con middleware reutilizables de autenticacion, autorizacion por roles y validacion de schemas, para proteger los endpoints de la API de forma consistente y reducir la duplicacion de logica de seguridad.

Este conjunto de middleware constituye la capa de seguridad transversal del backend de LearnPath. El `authMiddleware` extrae el token Bearer del header Authorization de cada peticion, lo verifica con `jwt.verify()` y adjunta los datos del usuario decodificados al objeto `req` (como `req.user`) para que los controladores posteriores puedan acceder al usuario autenticado. El `roleMiddleware` recibe un array de roles permitidos y verifica que el rol del usuario autenticado este incluido, retornando 403 si no tiene permisos. El `validateMiddleware` recibe un schema Zod y valida el `req.body` contra el, retornando 400 con errores detallados si la validacion falla. Finalmente, el middleware de errores global captura todas las excepciones no manejadas y las convierte a un formato JSON consistente con `{ error, message, statusCode }`, evitando que errores internos se filtren al cliente. Estos middleware se componen en las rutas para crear pipelines de seguridad declarativos.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El `authMiddleware` extrae el token del header `Authorization: Bearer <token>`, lo verifica con `jwt.verify()` y adjunta `req.user` con `{ userId, email, role }` para los handlers posteriores.
- [ ] **AC-2:** Si el header Authorization esta ausente o no tiene formato Bearer, el `authMiddleware` retorna status 401 con `{ error: 'Unauthorized', message: 'Token de acceso requerido' }`.
- [ ] **AC-3:** El `roleMiddleware(roles)` verifica que `req.user.role` este incluido en el array de roles permitidos; si no, retorna status 403 con `{ error: 'Forbidden', message: 'No tiene permisos para acceder a este recurso' }`.
- [ ] **AC-4:** El `validateMiddleware(schema)` valida `req.body` contra el schema Zod proporcionado y retorna status 400 con errores detallados por campo si la validacion falla.
- [ ] **AC-5:** El middleware de errores global captura excepciones no manejadas y retorna un JSON consistente `{ error, message, statusCode }` sin filtrar detalles internos (stack traces) en produccion.
- [ ] **AC-6:** Los middleware se pueden componer en las rutas de forma declarativa: `router.post('/courses', authMiddleware, roleMiddleware(['ADMIN']), validateMiddleware(courseSchema), controller)`.

### Tecnicos
- [ ] **AC-T1:** El `authMiddleware` extiende la interfaz `Request` de Express con una propiedad `user` tipada para que los controladores tengan autocompletado TypeScript.
- [ ] **AC-T2:** El `validateMiddleware` es generico y acepta cualquier schema Zod, formatendo los errores de Zod (`ZodError.flatten()`) en un formato amigable para el frontend.
- [ ] **AC-T3:** El middleware de errores distingue entre errores operacionales (clases de error personalizadas como `UnauthorizedError`, `ForbiddenError`, `NotFoundError`) y errores de programacion (errores inesperados), logueando los segundos con mayor severidad.
- [ ] **AC-T4:** Todos los middleware estan en archivos separados dentro de `src/middleware/` y se exportan desde un barrel file.

### QA
- [ ] **QA-1:** Al enviar una peticion a un endpoint protegido sin header Authorization, se recibe 401; al enviar con un token expirado, tambien 401; al enviar con un token valido pero rol incorrecto, 403.
- [ ] **QA-2:** Al enviar un body invalido a un endpoint con `validateMiddleware`, la respuesta 400 incluye errores especificos por campo (por ejemplo: `{ fieldErrors: { email: ['Email invalido'] } }`).
- [ ] **QA-3:** Al provocar un error interno (por ejemplo, desconexion de base de datos), el middleware de errores retorna 500 con un mensaje generico en produccion, sin exponer detalles internos.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-049 | Extender la interfaz Request de Express con propiedad `user` tipada | 0.25h | Alta |
| T-BE-050 | Implementar `authMiddleware` con extraccion y verificacion de JWT | 0.5h | Alta |
| T-BE-051 | Implementar `roleMiddleware` con verificacion de roles permitidos | 0.25h | Alta |
| T-BE-052 | Implementar `validateMiddleware` generico con Zod y formato de errores | 0.5h | Alta |
| T-BE-053 | Crear clases de error personalizadas (UnauthorizedError, ForbiddenError, NotFoundError, ConflictError) | 0.25h | Alta |
| T-BE-054 | Implementar middleware de errores global con manejo diferenciado dev/prod | 0.5h | Alta |
| T-BE-055 | Crear barrel file de exportacion y escribir tests unitarios | 0.5h | Media |
| T-BE-056 | Integrar middleware en las rutas de autenticacion existentes para verificar funcionamiento | 0.25h | Media |

## Notas Tecnicas
- Extension de la interfaz Request de Express:
  ```typescript
  // src/types/express.d.ts
  declare namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: 'ADMIN' | 'USER';
      };
    }
  }
  ```
- Implementacion del authMiddleware:
  ```typescript
  export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token de acceso requerido');
    }
    const token = authHeader.split(' ')[1];
    try {
      const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
      req.user = { userId: payload.userId, email: payload.email, role: payload.role };
      next();
    } catch (error) {
      throw new UnauthorizedError('Token de acceso invalido o expirado');
    }
  }
  ```
- Implementacion del validateMiddleware:
  ```typescript
  export function validateMiddleware(schema: z.ZodSchema) {
    return (req: Request, res: Response, next: NextFunction) => {
      const result = schema.safeParse(req.body);
      if (!result.success) {
        const formatted = result.error.flatten();
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Los datos enviados no son validos',
          fieldErrors: formatted.fieldErrors,
        });
      }
      req.body = result.data; // usar datos parseados (transformados)
      next();
    };
  }
  ```
- En Express 5, los middleware async que lanzan excepciones son capturados automaticamente por el error handler global, sin necesidad de try-catch o wrappers adicionales.
- Las clases de error personalizadas deben extender una clase base `AppError` que incluya `statusCode`, `error` y `message` para que el middleware de errores las maneje de forma uniforme.
- En produccion (`NODE_ENV === 'production'`), el middleware de errores no debe incluir `stack` ni detalles internos en la respuesta. En desarrollo, incluir toda la informacion para facilitar el debugging.

## Dependencias
- **Depende de:** HU-BE-005 (Login y Generacion de JWT — necesita tokens para verificar)
- **Bloquea a:** Todos los endpoints protegidos del backend (HU-BE-008 en adelante)
