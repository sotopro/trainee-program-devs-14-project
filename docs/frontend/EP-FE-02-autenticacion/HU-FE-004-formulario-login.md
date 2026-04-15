# HU-FE-004: Formulario de Login

## Descripcion
Como usuario registrado, quiero iniciar sesion con mi email y contrasena para acceder a la plataforma LearnPath y sus funcionalidades segun mi rol.

El formulario de login es el punto de entrada principal para todos los usuarios de LearnPath. Debe ofrecer una experiencia fluida y segura, utilizando componentes de shadcn/ui para mantener consistencia visual con el resto de la aplicacion. La validacion del formulario se maneja con React Hook Form para el estado del formulario y Zod para el esquema de validacion, asegurando feedback inmediato al usuario antes de enviar la solicitud al servidor. Al enviar el formulario, se realiza un POST a `/api/auth/login` con las credenciales. Si la autenticacion es exitosa, el JWT recibido se almacena en el auth store de Zustand y en localStorage para persistencia. Finalmente, el usuario es redirigido segun su rol: los administradores van al dashboard de administracion y los usuarios regulares van al catalogo de cursos. El formulario debe manejar elegantemente los errores del servidor como credenciales invalidas, cuenta bloqueada o problemas de conexion.

## Asignado a
| Rol | Nombre |
|-----|--------|
| Desarrollador | Carlos Vasquez |
| QA | Daniel Soto |

## Criterios de Aceptacion

### Funcionales
- [ ] **AC-1:** El formulario muestra campos de email y contrasena con componentes `Input` de shadcn/ui y labels descriptivos.
- [ ] **AC-2:** La validacion con Zod verifica que el email tiene formato valido y que la contrasena tiene al menos 8 caracteres; los errores se muestran inline debajo de cada campo.
- [ ] **AC-3:** Al enviar credenciales validas, se realiza un POST a `/api/auth/login` y el usuario es redirigido: admin a `/admin/dashboard`, usuario regular a `/catalog`.
- [ ] **AC-4:** Si las credenciales son invalidas, se muestra un mensaje de error general (sin revelar si el email existe o no) en la parte superior del formulario.
- [ ] **AC-5:** El boton de submit muestra un estado de carga (spinner) mientras se procesa la solicitud y se deshabilita para evitar envios duplicados.
- [ ] **AC-6:** Existe un enlace "Crear cuenta" que navega al formulario de registro (`/register`).

### Tecnicos
- [ ] **AC-T1:** El formulario usa `useForm` de React Hook Form con `zodResolver` para integrar el schema de validacion Zod.
- [ ] **AC-T2:** La llamada API usa una instancia de axios configurada en `shared/lib/axios.ts` con interceptors para manejo de errores.
- [ ] **AC-T3:** El token JWT se almacena mediante la accion `login()` del auth store de Zustand, que actualiza tanto el estado como localStorage.
- [ ] **AC-T4:** El componente es responsive y se muestra centrado en la pantalla con un ancho maximo adecuado para formularios.

### QA
- [ ] **QA-1:** Intentar enviar el formulario vacio muestra mensajes de validacion en ambos campos sin realizar ninguna llamada al servidor.
- [ ] **QA-2:** Despues de un login exitoso como admin, la URL del navegador cambia a `/admin/dashboard` y el usuario ve el panel de administracion.
- [ ] **QA-3:** Despues de un login exitoso como usuario regular, la URL cambia a `/catalog` y el usuario ve el catalogo de cursos.

## Tareas

| ID | Tarea | Estimacion | Prioridad |
|----|-------|-----------|-----------|
| T-FE-024 | Crear schema Zod para validacion del formulario de login | 0.25h | Alta |
| T-FE-025 | Crear componente `LoginForm` con React Hook Form + shadcn/ui | 1h | Alta |
| T-FE-026 | Implementar servicio `authService.login()` con llamada POST al endpoint | 0.5h | Alta |
| T-FE-027 | Integrar con auth store de Zustand para almacenar tokens y datos del usuario | 0.5h | Alta |
| T-FE-028 | Implementar redireccion basada en rol despues del login exitoso | 0.5h | Alta |
| T-FE-029 | Crear pagina `LoginPage` con layout centrado y enlace a registro | 0.5h | Media |
| T-FE-030 | Implementar manejo de errores del servidor y estados de carga | 0.5h | Alta |
| T-FE-031 | Escribir tests unitarios para el componente LoginForm | 0.25h | Media |

## Notas Tecnicas
- Schema Zod del formulario:
  ```typescript
  const loginSchema = z.object({
    email: z.string().email('Email invalido'),
    password: z.string().min(8, 'La contrasena debe tener al menos 8 caracteres'),
  });
  ```
- Usar `useMutation` de TanStack Query para la llamada de login, aprovechando `onSuccess` y `onError` callbacks.
- La respuesta del endpoint `/api/auth/login` devuelve: `{ accessToken, refreshToken, user: { id, name, email, role } }`.
- Para la redireccion, usar `useNavigate()` de React Router despues del login exitoso.
- Nunca almacenar la contrasena en el estado del cliente; solo los tokens y datos del usuario.
- El componente debe ser desacoplado: `LoginForm` maneja solo el formulario, `LoginPage` maneja el layout y la logica de redireccion.

## Dependencias
- **Depende de:** HU-FE-001, HU-FE-003, HU-BE-005 (endpoint de login del backend)
- **Bloquea a:** HU-FE-007 (Rutas Protegidas)
