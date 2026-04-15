# EP-BE-02: Autenticacion Backend

## Descripcion

Esta epica implementa el sistema completo de autenticacion y autorizacion del backend de LearnPath. Cubre el registro de nuevos usuarios, el inicio de sesion con generacion de tokens JWT, el sistema de refresh tokens para sesiones de larga duracion y los middlewares de proteccion de rutas basados en roles.

El sistema de autenticacion sigue las mejores practicas de seguridad: las passwords se hashean con bcrypt antes de almacenarse, los tokens JWT tienen un tiempo de vida corto (15 minutos) para minimizar el riesgo en caso de compromiso, y los refresh tokens tienen una vida mas larga (7 dias) almacenados de forma segura. Se implementa un mecanismo de blacklist de tokens para soportar logout efectivo.

Los middlewares de autenticacion y autorizacion protegen todas las rutas del API que requieren autenticacion. El middleware `authenticate` verifica la validez del JWT en cada request, mientras que el middleware `authorize(roles)` verifica que el usuario tenga el rol necesario para acceder a un recurso especifico. Estos middlewares se aplican de forma declarativa en las definiciones de rutas de Express.

## Responsable(s)

| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| QA | Daniel Soto |

## Temas React Asociados

No aplica (epica de backend).

## Historias de Usuario

| ID | Titulo | Prioridad | Semana |
|----|--------|-----------|--------|
| HU-BE-004 | Endpoint de registro de usuarios (`POST /api/auth/register`) | Alta | S1 |
| HU-BE-005 | Endpoint de login con JWT (`POST /api/auth/login`) | Alta | S1 |
| HU-BE-006 | Sistema de refresh tokens (`POST /api/auth/refresh`) | Alta | S1 |
| HU-BE-007 | Middlewares de autenticacion y autorizacion por roles | Alta | S1 |

### Detalle de Historias

#### HU-BE-004: Endpoint de registro de usuarios (`POST /api/auth/register`)

**Como** nuevo usuario, **quiero** poder crear una cuenta en la plataforma proporcionando mis datos basicos, **para** acceder al contenido educativo de LearnPath.

**Criterios de Aceptacion:**
- Endpoint `POST /api/auth/register` que acepta: `name`, `email`, `password`.
- Validacion del body con Zod: email valido, password minimo 8 caracteres (mayuscula + numero), name no vacio.
- Verificacion de que el email no este ya registrado (409 Conflict si existe).
- Password hasheada con bcrypt (salt rounds: 12) antes de almacenar.
- El rol por defecto es `USER`. Solo un admin existente puede crear otros admins.
- Retorna el usuario creado (sin password) y un par de tokens (access + refresh).
- Respuestas de error tipadas y consistentes: `{ error: string, message: string, statusCode: number }`.
- Logs de registro de nuevos usuarios.

#### HU-BE-005: Endpoint de login con JWT (`POST /api/auth/login`)

**Como** usuario registrado, **quiero** poder iniciar sesion con mi email y password para recibir un token de acceso, **para** poder interactuar con los recursos protegidos de la plataforma.

**Criterios de Aceptacion:**
- Endpoint `POST /api/auth/login` que acepta: `email`, `password`.
- Validacion del body con Zod.
- Busqueda del usuario por email (404 si no existe).
- Comparacion de password con bcrypt (401 si no coincide).
- Generacion de access token JWT con payload: `{ userId, email, role }` y expiracion de 15 minutos.
- Generacion de refresh token con expiracion de 7 dias.
- Almacenamiento del refresh token en la base de datos (modelo `RefreshToken` o campo en `User`).
- Retorna: `{ user: { id, name, email, role }, accessToken, refreshToken }`.
- Log de intentos de login (exitosos y fallidos).

#### HU-BE-006: Sistema de refresh tokens (`POST /api/auth/refresh`)

**Como** usuario con sesion activa, **quiero** que mi token de acceso se renueve automaticamente antes de expirar usando el refresh token, **para** no tener que iniciar sesion repetidamente durante mi uso de la plataforma.

**Criterios de Aceptacion:**
- Endpoint `POST /api/auth/refresh` que acepta: `refreshToken`.
- Verificacion de que el refresh token sea valido y no haya expirado.
- Verificacion de que el refresh token exista en la base de datos (no revocado).
- Generacion de un nuevo par de tokens (access + refresh).
- El refresh token anterior se invalida (rotacion de tokens).
- Si el refresh token es invalido o expirado, retorna 401 y el usuario debe hacer login nuevamente.
- Endpoint `POST /api/auth/logout` que invalida el refresh token actual.
- Log de operaciones de refresh y logout.

#### HU-BE-007: Middlewares de autenticacion y autorizacion por roles

**Como** desarrollador del equipo, **quiero** middlewares reutilizables para proteger endpoints que requieren autenticacion y autorizacion especifica por rol, **para** asegurar que solo usuarios autenticados y autorizados accedan a los recursos.

**Criterios de Aceptacion:**
- Middleware `authenticate`: extrae el JWT del header `Authorization: Bearer <token>`, verifica la firma y expiracion, y adjunta `req.user` con los datos del payload.
- Middleware `authorize(...roles)`: verifica que `req.user.role` este en la lista de roles permitidos.
- Si no hay token: retorna 401 `{ error: "Unauthorized", message: "Token no proporcionado" }`.
- Si el token es invalido/expirado: retorna 401 `{ error: "Unauthorized", message: "Token invalido o expirado" }`.
- Si el rol no esta autorizado: retorna 403 `{ error: "Forbidden", message: "No tienes permisos para acceder a este recurso" }`.
- Los middlewares son reutilizables y se pueden combinar en las definiciones de rutas.
- Tipos TypeScript para extender `Request` con `user`.

## Dependencias

- **Depende de:** EP-BE-01 (Setup e Infraestructura Backend - servidor, Prisma, esquema de DB).
- **Bloquea a:** EP-BE-03 (Cursos), EP-BE-04 (Learning Paths), EP-BE-05 (Quizzes), EP-BE-06 (IA) - todos necesitan middlewares de auth.

## Definition of Done

- [ ] Endpoint de registro funcional con validacion y hashing de passwords.
- [ ] Endpoint de login funcional con generacion de JWT y refresh token.
- [ ] Endpoint de refresh funcional con rotacion de tokens.
- [ ] Endpoint de logout funcional con invalidacion de refresh token.
- [ ] Middleware `authenticate` verificando JWT en cada request protegido.
- [ ] Middleware `authorize` verificando roles de usuario.
- [ ] Respuestas de error consistentes y tipadas.
- [ ] Validaciones con Zod en todos los endpoints.
- [ ] Passwords nunca expuestas en respuestas ni logs.
- [ ] Tokens con tiempos de expiracion apropiados (15min access, 7d refresh).
- [ ] Tipos TypeScript completos para request, response y middleware.
- [ ] Logs de operaciones de autenticacion.
