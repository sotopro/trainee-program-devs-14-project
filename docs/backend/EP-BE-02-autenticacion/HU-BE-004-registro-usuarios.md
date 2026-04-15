# HU-BE-004: Registro de Usuarios

## Descripcion
Como visitante de la plataforma, quiero registrarme con mi nombre, email y contrasena para crear una cuenta en LearnPath y acceder a los cursos disponibles.

El endpoint de registro es la puerta de entrada para nuevos usuarios a la plataforma LearnPath. Recibe una solicitud POST a `/api/auth/register` con los datos del usuario (nombre, email y contrasena) en el body. Antes de procesar el registro, los datos se validan con un schema Zod que verifica el formato del email, la longitud y complejidad minima de la contrasena, y que el nombre no este vacio. Si la validacion pasa, se verifica que el email no este ya registrado en la base de datos; si lo esta, se retorna un error 409 (Conflict). Si el email es nuevo, la contrasena se hashea con bcryptjs usando un salt de 12 rondas, y se crea el registro del usuario en la base de datos con el rol USER por defecto. Finalmente, se generan un accessToken (JWT con expiracion de 15 minutos) y un refreshToken (JWT con expiracion de 7 dias), y se retorna el objeto del usuario (sin la contrasena) junto con ambos tokens. Este endpoint no requiere autenticacion previa.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint POST `/api/auth/register` acepta un body con `{ name, email, password }` y retorna `{ user, accessToken, refreshToken }` con status 201 al registrar exitosamente.
- [ ] **AC-2:** El campo `email` se valida con formato de email valido y se normaliza a minusculas antes de almacenar.
- [ ] **AC-3:** El campo `password` requiere al menos 8 caracteres; la contrasena se almacena hasheada con bcryptjs (nunca en texto plano).
- [ ] **AC-4:** Si el email ya esta registrado, el endpoint retorna status 409 con un mensaje de error descriptivo: `{ error: 'Conflict', message: 'El email ya esta registrado' }`.
- [ ] **AC-5:** El objeto `user` retornado incluye `id`, `name`, `email` y `role`, pero nunca incluye el campo `password`.
- [ ] **AC-6:** El usuario creado tiene el rol `USER` por defecto, independientemente de lo que se envie en el body.

### Tecnicos
- [ ] **AC-T1:** La validacion del body usa un schema Zod definido en `src/modules/auth/schemas/registerSchema.ts` y se aplica mediante el middleware `validateMiddleware`.
- [ ] **AC-T2:** El hash de la contrasena usa `bcryptjs.hash()` con un salt de 12 rondas, configurado como constante en el modulo de configuracion.
- [ ] **AC-T3:** La generacion de tokens usa funciones reutilizables `generateAccessToken(user)` y `generateRefreshToken(user)` definidas en `src/modules/auth/utils/jwt.ts`.
- [ ] **AC-T4:** La logica de negocio esta encapsulada en `authService.register()`, separada del controlador que maneja la request/response HTTP.

### QA
- [ ] **QA-1:** Al enviar un body con email invalido o contrasena menor a 8 caracteres, el endpoint retorna status 400 con mensajes de validacion especificos por campo.
- [ ] **QA-2:** Al registrar un usuario exitosamente y luego intentar registrar otro con el mismo email, el segundo intento retorna 409.
- [ ] **QA-3:** Al decodificar el accessToken retornado, el payload contiene `userId`, `email` y `role` con los valores correctos del usuario registrado.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-027 | Crear schema Zod `registerSchema` para validacion del body | 0.25h | Alta |
| T-BE-028 | Implementar funciones de generacion de JWT (`generateAccessToken`, `generateRefreshToken`) | 0.5h | Alta |
| T-BE-029 | Implementar `authService.register()` con logica de hash y creacion de usuario | 0.75h | Alta |
| T-BE-030 | Crear controlador `authController.register()` que maneja request/response | 0.25h | Alta |
| T-BE-031 | Definir ruta POST `/api/auth/register` con middleware de validacion | 0.25h | Alta |
| T-BE-032 | Implementar manejo de error 409 por email duplicado | 0.25h | Alta |
| T-BE-033 | Escribir tests unitarios para el servicio de registro | 0.5h | Media |
| T-BE-034 | Probar endpoint manualmente con diferentes escenarios | 0.25h | Media |

## Notas Tecnicas
- Schema Zod para validacion del registro:
  ```typescript
  const registerSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
    email: z.string().email('Email invalido').transform(val => val.toLowerCase()),
    password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
  });
  ```
- Funcion de generacion de tokens:
  ```typescript
  export function generateAccessToken(user: { id: string; email: string; role: Role }) {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '15m' }
    );
  }
  ```
- Usar `prisma.user.create()` con `select` para excluir el campo password de la respuesta:
  ```typescript
  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  ```
- El error 409 se maneja verificando con `prisma.user.findUnique({ where: { email } })` antes de crear.
- Nunca revelar en el mensaje de error si un email especifico ya existe; usar un mensaje generico como "El email ya esta registrado".

## Dependencias
- **Depende de:** HU-BE-001 (Scaffold del proyecto), HU-BE-002 (Schema de Prisma)
- **Bloquea a:** HU-BE-005 (Login y Generacion de JWT)
