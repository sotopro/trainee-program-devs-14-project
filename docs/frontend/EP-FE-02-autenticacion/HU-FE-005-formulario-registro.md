# HU-FE-005: Formulario de Registro

## Descripcion
Como visitante de la plataforma, quiero registrarme con mi nombre, email y contrasena para crear una cuenta en LearnPath y comenzar a acceder a los cursos disponibles.

El formulario de registro es el mecanismo principal de adquisicion de usuarios en LearnPath. Debe recopilar la informacion minima necesaria para crear una cuenta: nombre completo, email, contrasena y confirmacion de contrasena. La validacion con Zod debe ser rigurosa, verificando formato de email, fortaleza de contrasena (minimo 8 caracteres, al menos una mayuscula, una minuscula y un numero) y que ambas contrasenas coincidan. Al enviar el formulario exitosamente, se realiza un POST a `/api/auth/register` y, si el registro es exitoso, el usuario inicia sesion automaticamente sin necesidad de pasar por el formulario de login. Esto mejora significativamente la experiencia del usuario al eliminar un paso de friccion. El formulario debe manejar errores como email duplicado y proporcionar feedback claro en cada caso.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El formulario muestra campos para nombre completo, email, contrasena y confirmacion de contrasena, todos con componentes `Input` de shadcn/ui.
- [ ] **AC-2:** La validacion Zod verifica: email con formato valido, contrasena con minimo 8 caracteres incluyendo mayuscula, minuscula y numero, y que contrasena y confirmacion coincidan.
- [ ] **AC-3:** Al registrarse exitosamente, el usuario inicia sesion automaticamente y es redirigido al catalogo de cursos (`/catalog`).
- [ ] **AC-4:** Si el email ya esta registrado, se muestra un mensaje de error claro indicando que el email ya esta en uso.
- [ ] **AC-5:** El boton de submit muestra estado de carga y se deshabilita durante el procesamiento de la solicitud.
- [ ] **AC-6:** Existe un enlace "Ya tengo cuenta" que navega al formulario de login (`/login`).

### Tecnicos
- [ ] **AC-T1:** El formulario usa `useForm` de React Hook Form con `zodResolver` y el schema de validacion de registro.
- [ ] **AC-T2:** La llamada API usa `useMutation` de TanStack Query para POST a `/api/auth/register`, encadenando el login automatico en `onSuccess`.
- [ ] **AC-T3:** El campo de contrasena incluye un toggle para mostrar/ocultar la contrasena ingresada.
- [ ] **AC-T4:** El componente `RegisterForm` esta desacoplado de la pagina; recibe callbacks como props para manejar el exito del registro.

### QA
- [ ] **QA-1:** Enviar el formulario con una contrasena debil (ej: "123") muestra errores de validacion especificos sin llamar al servidor.
- [ ] **QA-2:** Despues de un registro exitoso, el usuario esta autenticado y puede navegar a paginas protegidas sin pasar por el login.
- [ ] **QA-3:** Intentar registrarse con un email ya existente muestra un mensaje de error apropiado y no limpia los campos del formulario.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-032 | Crear schema Zod para validacion del formulario de registro con reglas de fortaleza de contrasena | 0.25h | Alta |
| T-FE-033 | Crear componente `RegisterForm` con React Hook Form + shadcn/ui | 1h | Alta |
| T-FE-034 | Implementar servicio `authService.register()` con llamada POST al endpoint | 0.25h | Alta |
| T-FE-035 | Implementar auto-login despues del registro exitoso usando el auth store | 0.5h | Alta |
| T-FE-036 | Crear pagina `RegisterPage` con layout centrado y enlace a login | 0.5h | Media |
| T-FE-037 | Implementar toggle de visibilidad de contrasena | 0.25h | Baja |
| T-FE-038 | Escribir tests unitarios para el componente RegisterForm | 0.25h | Media |

## Notas Tecnicas
- Schema Zod del formulario:
  ```typescript
  const registerSchema = z.object({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    email: z.string().email('Email invalido'),
    password: z.string()
      .min(8, 'La contrasena debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'Debe contener al menos una mayuscula')
      .regex(/[a-z]/, 'Debe contener al menos una minuscula')
      .regex(/[0-9]/, 'Debe contener al menos un numero'),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmPassword'],
  });
  ```
- El flujo de auto-login despues del registro debe:
  1. Llamar a `POST /api/auth/register` con los datos del formulario.
  2. Si es exitoso, la respuesta incluye tokens y datos del usuario (mismo formato que login).
  3. Llamar a `authStore.login(response.data)` para almacenar los tokens.
  4. Redirigir a `/catalog`.
- Para el toggle de visibilidad, usar un estado local y cambiar el `type` del input entre `password` y `text`.
- Los errores del servidor (409 Conflict para email duplicado) se manejan en el callback `onError` de `useMutation`.

## Dependencias
- **Depende de:** HU-FE-001, HU-FE-003, HU-BE-004 (endpoint de registro del backend)
- **Bloquea a:** Ninguna directamente
