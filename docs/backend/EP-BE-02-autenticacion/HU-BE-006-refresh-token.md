# HU-BE-006: Refresh Token Flow

## Descripcion
Como usuario autenticado, quiero poder renovar mi sesion de forma transparente usando un refresh token, para no tener que volver a iniciar sesion cada 15 minutos cuando mi access token expire.

El flujo de refresh token permite a los usuarios mantener su sesion activa sin reautenticarse constantemente. Cuando el access token de un usuario expira (cada 15 minutos), el frontend envia una solicitud POST a `/api/auth/refresh` con el refresh token almacenado. El backend verifica que el refresh token sea valido (firma correcta y no expirado), y si lo es, genera un nuevo par de tokens (access + refresh). Se implementa rotacion de tokens: cada vez que se usa un refresh token, este se invalida y se emite uno nuevo. Esto significa que un refresh token solo puede usarse una sola vez; si alguien intenta reutilizar un refresh token ya consumido, se invalidan todos los tokens del usuario (indicando una posible brecha de seguridad). Los refresh tokens se almacenan en la base de datos para poder rastrear cuales estan activos y permitir la invalidacion. El endpoint retorna 401 si el refresh token es invalido, ha expirado o ya fue consumido.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El endpoint POST `/api/auth/refresh` acepta un body con `{ refreshToken }` y retorna `{ accessToken, refreshToken }` con status 200 al renovar exitosamente.
- [ ] **AC-2:** Al usar un refresh token valido, se genera un nuevo par de tokens (access + refresh) y el refresh token anterior queda invalidado (rotacion de tokens).
- [ ] **AC-3:** Si se intenta usar un refresh token ya consumido (reutilizado), el endpoint retorna status 401 y se invalidan todos los refresh tokens activos del usuario afectado.
- [ ] **AC-4:** Si el refresh token ha expirado (mas de 7 dias), el endpoint retorna status 401 con mensaje `{ error: 'Unauthorized', message: 'Token de refresco expirado' }`.
- [ ] **AC-5:** Si el refresh token tiene una firma invalida o esta malformado, el endpoint retorna status 401 con mensaje generico.

### Tecnicos
- [ ] **AC-T1:** Los refresh tokens se almacenan en la base de datos en una tabla o campo dedicado, asociados al usuario y con un flag de estado (`used: boolean` o `revokedAt: Date`).
- [ ] **AC-T2:** La verificacion del refresh token usa `jwt.verify()` con `JWT_REFRESH_SECRET` (diferente al secret del access token) para mayor seguridad.
- [ ] **AC-T3:** La logica de rotacion e invalidacion se ejecuta dentro de una transaccion de Prisma para garantizar atomicidad (invalidar viejo + crear nuevo en la misma operacion).
- [ ] **AC-T4:** La deteccion de reutilizacion de tokens (posible brecha) registra un log de advertencia con el userId afectado para monitoreo de seguridad.

### QA
- [ ] **QA-1:** Al hacer refresh con un token valido, el nuevo access token tiene una expiracion de 15 minutos a partir del momento de emision (no desde el token original).
- [ ] **QA-2:** Al intentar usar el mismo refresh token dos veces consecutivas, la segunda llamada retorna 401 y las sesiones activas del usuario se invalidan.
- [ ] **QA-3:** Al hacer refresh exitoso y usar el nuevo access token en un endpoint protegido, la autenticacion funciona correctamente.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-042 | Agregar modelo o campos para almacenar refresh tokens en el schema de Prisma | 0.25h | Alta |
| T-BE-043 | Implementar `authService.refreshTokens()` con verificacion y rotacion | 1h | Alta |
| T-BE-044 | Crear controlador `authController.refresh()` que maneja request/response | 0.25h | Alta |
| T-BE-045 | Definir ruta POST `/api/auth/refresh` con validacion del body | 0.25h | Alta |
| T-BE-046 | Implementar logica de deteccion de reutilizacion de tokens y revocacion masiva | 0.5h | Alta |
| T-BE-047 | Escribir tests unitarios para el flujo de refresh con diferentes escenarios | 0.5h | Media |
| T-BE-048 | Probar el flujo completo: login -> usar access token -> refresh -> usar nuevo token | 0.25h | Media |

## Notas Tecnicas
- Modelo sugerido para refresh tokens en Prisma:
  ```prisma
  model RefreshToken {
    id        String   @id @default(cuid())
    token     String   @unique
    userId    String
    user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    used      Boolean  @default(false)
    revokedAt DateTime?
    expiresAt DateTime
    createdAt DateTime @default(now())
  }
  ```
- Logica de rotacion de tokens:
  ```typescript
  async function refreshTokens(refreshToken: string) {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
    });
    
    if (!storedToken || storedToken.used || storedToken.revokedAt) {
      // Posible reutilizacion: revocar todos los tokens del usuario
      await prisma.refreshToken.updateMany({
        where: { userId: storedToken?.userId },
        data: { revokedAt: new Date() },
      });
      throw new UnauthorizedError('Token de refresco invalido');
    }
    
    // Marcar como usado y crear nuevos tokens en una transaccion
    return prisma.$transaction(async (tx) => {
      await tx.refreshToken.update({
        where: { id: storedToken.id },
        data: { used: true },
      });
      const user = await tx.user.findUnique({ where: { id: payload.userId } });
      const newAccessToken = generateAccessToken(user);
      const newRefreshToken = generateRefreshToken(user);
      await tx.refreshToken.create({
        data: { token: newRefreshToken, userId: user.id, expiresAt: ... },
      });
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    });
  }
  ```
- Considerar un job periodico (o cleanup al login) para eliminar refresh tokens expirados de la base de datos y evitar crecimiento indefinido de la tabla.
- El hash del refresh token podria almacenarse en lugar del token en texto plano para mayor seguridad, aunque para el MVP el almacenamiento directo es aceptable.

## Dependencias
- **Depende de:** HU-BE-005 (Login y Generacion de JWT)
- **Bloquea a:** HU-FE-006 (Auth Store con Refresh en Frontend)
