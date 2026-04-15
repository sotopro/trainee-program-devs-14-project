# HU-BE-024: Tests de Autenticacion Backend

## Descripcion
Como equipo de desarrollo, queremos tener una suite de tests completa para el modulo de autenticacion para poder garantizar que el registro, login, refresh de tokens y middleware de autorizacion funcionan correctamente ante diferentes escenarios.

La suite de tests cubre tanto pruebas unitarias de utilidades (JWT, hashing, schemas Zod) como pruebas de integracion de los endpoints de autenticacion. Se utiliza Vitest como framework de testing y supertest para las pruebas de integracion HTTP. Los tests deben cubrir escenarios exitosos y de error para asegurar que el sistema es robusto.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** Los tests unitarios verifican las utilidades JWT: generacion de token, verificacion de token valido, rechazo de token expirado y rechazo de token con firma invalida.
- [ ] **AC-2:** Los tests unitarios verifican el hashing de contrasenas: hash correcto, comparacion exitosa y comparacion fallida.
- [ ] **AC-3:** Los tests de integracion verifican POST /register: registro exitoso con datos validos y rechazo con email duplicado.
- [ ] **AC-4:** Los tests de integracion verifican POST /login: login exitoso, rechazo con contrasena incorrecta y rechazo con usuario inexistente.
- [ ] **AC-5:** Los tests de integracion verifican POST /refresh: refresh exitoso con token valido y rechazo con token expirado.
- [ ] **AC-6:** Los tests de integracion verifican el middleware de auth: acceso con token valido, rechazo sin token, rechazo con token expirado y rechazo con rol incorrecto.

### Tecnicos
- [ ] **AC-T1:** Los tests se ejecutan con Vitest y usan supertest para las peticiones HTTP de integracion.
- [ ] **AC-T2:** Los tests de integracion usan una base de datos de prueba aislada que se limpia entre cada test suite.
- [ ] **AC-T3:** Los tests unitarios de schemas Zod verifican validacion exitosa y rechazo con datos invalidos (email invalido, password corta, campos faltantes).
- [ ] **AC-T4:** Los tests tienen una cobertura minima del 80% para el modulo de autenticacion.

### QA
- [ ] **QA-1:** Verificar que todos los tests pasan correctamente en un entorno limpio (sin datos previos en la base de datos).
- [ ] **QA-2:** Verificar que los tests cubren todos los codigos de estado HTTP relevantes: 200, 201, 400, 401, 403, 409.
- [ ] **QA-3:** Verificar que los tests de integracion son independientes entre si y no dependen del orden de ejecucion.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-BE-024-1 | Escribir tests unitarios para utilidades JWT (sign, verify) | 0.5h | Alta |
| T-BE-024-2 | Escribir tests unitarios para password hashing | 0.5h | Alta |
| T-BE-024-3 | Escribir tests unitarios para schemas Zod de auth | 0.5h | Alta |
| T-BE-024-4 | Escribir tests de integracion para POST /register | 0.5h | Alta |
| T-BE-024-5 | Escribir tests de integracion para POST /login | 0.5h | Alta |
| T-BE-024-6 | Escribir tests de integracion para POST /refresh | 0.5h | Alta |
| T-BE-024-7 | Escribir tests de integracion para middleware de auth y roles | 1h | Alta |

## Notas Tecnicas

### Estructura de Tests

```
tests/
  unit/
    auth/
      jwt.test.ts
      password.test.ts
      auth-schemas.test.ts
  integration/
    auth/
      register.test.ts
      login.test.ts
      refresh.test.ts
      auth-middleware.test.ts
```

### Ejemplo de Test Unitario - JWT
```typescript
import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from '@/utils/jwt';

describe('JWT Utilities', () => {
  it('debe generar un token valido', () => {
    const token = signToken({ userId: '123', role: 'USER' });
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('debe verificar un token valido', () => {
    const token = signToken({ userId: '123', role: 'USER' });
    const payload = verifyToken(token);
    expect(payload.userId).toBe('123');
    expect(payload.role).toBe('USER');
  });

  it('debe rechazar un token expirado', () => {
    const token = signToken({ userId: '123', role: 'USER' }, '0s');
    expect(() => verifyToken(token)).toThrow();
  });
});
```

### Ejemplo de Test de Integracion - Register
```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { app } from '@/app';
import { cleanDatabase } from '@/tests/helpers';

const request = supertest(app);

describe('POST /api/auth/register', () => {
  beforeAll(async () => await cleanDatabase());
  afterAll(async () => await cleanDatabase());

  it('debe registrar un usuario exitosamente', async () => {
    const res = await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
    });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('accessToken');
    expect(res.body.user.email).toBe('test@example.com');
  });

  it('debe rechazar email duplicado', async () => {
    await request.post('/api/auth/register').send({
      name: 'Test User',
      email: 'duplicate@example.com',
      password: 'Password123!',
    });
    const res = await request.post('/api/auth/register').send({
      name: 'Test User 2',
      email: 'duplicate@example.com',
      password: 'Password123!',
    });
    expect(res.status).toBe(409);
  });
});
```

### Configuracion de Vitest
- Usar `vitest.config.ts` con alias para paths.
- Configurar `globalSetup` para inicializar la base de datos de prueba.
- Usar `beforeEach`/`afterEach` para limpieza de datos entre tests.

### Escenarios de Test del Middleware
| Escenario | Header | Resultado Esperado |
|-----------|--------|-------------------|
| Token valido | `Authorization: Bearer <valid>` | 200 OK |
| Sin header | Sin header Authorization | 401 Unauthorized |
| Token expirado | `Authorization: Bearer <expired>` | 401 Unauthorized |
| Token invalido | `Authorization: Bearer invalid-string` | 401 Unauthorized |
| Rol incorrecto | Token de USER en ruta ADMIN | 403 Forbidden |

## Dependencias
- **Depende de:** HU-BE-002 (Autenticacion JWT), HU-BE-003 (Setup del proyecto)
- **Bloquea a:** Ninguna (epic de testing)
