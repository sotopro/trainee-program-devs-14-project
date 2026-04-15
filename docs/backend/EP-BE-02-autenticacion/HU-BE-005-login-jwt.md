# HU-BE-005: Login y Generacion de JWT

## Descripcion
Como usuario registrado, quiero iniciar sesion con mi email y contrasena para obtener un token de acceso que me permita utilizar las funcionalidades protegidas de la plataforma LearnPath.

El endpoint de login autentica a los usuarios existentes y les proporciona los tokens necesarios para acceder a la API. Recibe una solicitud POST a `/api/auth/login` con email y contrasena en el body. Los datos se validan con un schema Zod para formato correcto. Luego se busca el usuario por email en la base de datos; si no existe, se retorna un error 401 generico (sin revelar si el email existe o no). Si el usuario existe, se compara la contrasena proporcionada con el hash almacenado usando `bcryptjs.compare()`. Si las credenciales son validas, se generan dos tokens: un accessToken con expiracion de 15 minutos y un refreshToken con expiracion de 7 dias. El payload del JWT contiene `userId`, `role` y `email` para que el middleware de autenticacion pueda identificar al usuario y verificar permisos sin consultar la base de datos en cada peticion. Se retorna el objeto del usuario (sin contrasena) junto con ambos tokens.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint POST `/api/auth/login` acepta un body con `{ email, password }` y retorna `{ user, accessToken, refreshToken }` con status 200 al autenticar exitosamente.
- [ ] **AC-2:** Si el email no existe en la base de datos, el endpoint retorna status 401 con un mensaje generico: `{ error: 'Unauthorized', message: 'Credenciales invalidas' }`.
- [ ] **AC-3:** Si la contrasena no coincide con el hash almacenado, el endpoint retorna el mismo error 401 generico (sin diferenciar si fue email o contrasena incorrecta).
- [ ] **AC-4:** El accessToken tiene una expiracion de 15 minutos y el refreshToken de 7 dias.
- [ ] **AC-5:** El payload del JWT contiene `{ userId, role, email }` y puede ser verificado con el `JWT_SECRET` configurado en las variables de entorno.
- [ ] **AC-6:** El objeto `user` retornado incluye `id`, `name`, `email`, `role` y `createdAt`, pero nunca incluye `password`.

### Tecnicos
- [ ] **AC-T1:** La validacion del body usa el schema Zod `loginSchema` aplicado mediante el middleware `validateMiddleware` antes de llegar al controlador.
- [ ] **AC-T2:** La comparacion de contrasenas usa `bcryptjs.compare()` de forma asincrona, nunca comparacion directa de strings.
- [ ] **AC-T3:** Los tokens se generan usando las funciones reutilizables `generateAccessToken()` y `generateRefreshToken()` definidas en HU-BE-004.
- [ ] **AC-T4:** El tiempo de respuesta del endpoint es consistente independientemente de si el email existe o no (para prevenir ataques de timing).

### QA
- [ ] **QA-1:** Al enviar credenciales validas, el accessToken retornado puede ser decodificado y contiene los campos `userId`, `role` y `email` correctos.
- [ ] **QA-2:** Al enviar un email inexistente y una contrasena incorrecta (por separado), ambos escenarios retornan exactamente el mismo mensaje de error 401, haciendo imposible distinguir la causa.
- [ ] **QA-3:** Al enviar un body con formato invalido (email sin @, campos faltantes), el endpoint retorna status 400 con errores de validacion antes de intentar autenticar.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-035 | Crear schema Zod `loginSchema` para validacion del body de login | 0.25h | Alta |
| T-BE-036 | Implementar `authService.login()` con busqueda de usuario y comparacion de contrasena | 0.75h | Alta |
| T-BE-037 | Crear controlador `authController.login()` que maneja request/response | 0.25h | Alta |
| T-BE-038 | Definir ruta POST `/api/auth/login` con middleware de validacion | 0.25h | Alta |
| T-BE-039 | Implementar manejo consistente de errores 401 (sin filtrar informacion) | 0.25h | Alta |
| T-BE-040 | Escribir tests unitarios para el servicio de login | 0.75h | Media |
| T-BE-041 | Probar endpoint manualmente con credenciales validas e invalidas | 0.5h | Media |

## Notas Tecnicas
- Schema Zod para login:
  ```typescript
  const loginSchema = z.object({
    email: z.string().email('Email invalido'),
    password: z.string().min(1, 'La contrasena es requerida'),
  });
  ```
- Logica del servicio de login:
  ```typescript
  async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      throw new UnauthorizedError('Credenciales invalidas');
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedError('Credenciales invalidas');
    }
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, accessToken, refreshToken };
  }
  ```
- Para prevenir ataques de timing, si el usuario no existe, igualmente ejecutar `bcrypt.compare()` contra un hash dummy para que el tiempo de respuesta sea similar:
  ```typescript
  if (!user) {
    await bcrypt.compare(password, '$2b$12$dummyhashfortimingattak');
    throw new UnauthorizedError('Credenciales invalidas');
  }
  ```
- Usar una clase de error personalizada `UnauthorizedError` que el middleware de errores global intercepta y convierte a respuesta HTTP 401.
- La expiracion de tokens debe ser configurable via variables de entorno en produccion, pero con valores por defecto razonables en desarrollo.

## Dependencias
- **Depende de:** HU-BE-004 (Registro de Usuarios — reutiliza funciones de JWT y hash)
- **Bloquea a:** HU-BE-006 (Refresh Token Flow), HU-BE-007 (Middleware de Autenticacion y Roles)
