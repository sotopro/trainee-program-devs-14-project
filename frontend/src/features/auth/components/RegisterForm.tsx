import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ApiError } from '@/shared/lib';
import { registerSchema, type RegisterFormValues } from '../schemas/registerSchema';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { LoginResponse } from '../types/auth.types';

type RegisterFormProps = {
  onRegisterSuccess: (response: LoginResponse) => void;
};

const DEFAULT_REGISTER_ERROR = 'No pudimos crear tu cuenta. Intenta nuevamente.';

export function RegisterForm({ onRegisterSuccess }: RegisterFormProps) {
  const storeLogin = useAuthStore((state) => state.login);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (response) => {
      storeLogin(response);
      onRegisterSuccess(response);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        setFormError('Ese email ya esta en uso. Prueba iniciando sesión o usa otro email.');
        return;
      }

      if (error instanceof ApiError && error.status !== undefined && error.status >= 500) {
        setFormError('El servidor tuvo un problema. Intenta nuevamente en unos minutos.');
        return;
      }

      if (error instanceof ApiError && error.status === undefined) {
        setFormError(error.message);
        return;
      }

      setFormError(DEFAULT_REGISTER_ERROR);
    },
  });

  const onSubmit = ({ name, email, password }: RegisterFormValues) => {
    setFormError(null);
    registerMutation.mutate({ name, email, password });
  };

  const isSubmitting = registerMutation.isPending;
  const passwordInputType = showPassword ? 'text' : 'password';

  return (
    <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {formError ? (
        <div className="login-form__alert" role="alert">
          {formError}
        </div>
      ) : null}

      <div className="login-form__field">
        <label htmlFor="name">Nombre completo</label>
        <Input
          id="name"
          type="text"
          placeholder="Tu nombre"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? 'name-error' : undefined}
          disabled={isSubmitting}
          {...register('name')}
        />
        {errors.name ? (
          <p className="login-form__error" id="name-error" role="alert">
            {errors.name.message}
          </p>
        ) : null}
      </div>

      <div className="login-form__field">
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          type="email"
          placeholder="tu@email.com"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? 'email-error' : undefined}
          disabled={isSubmitting}
          {...register('email')}
        />
        {errors.email ? (
          <p className="login-form__error" id="email-error" role="alert">
            {errors.email.message}
          </p>
        ) : null}
      </div>

      <div className="login-form__field">
        <label htmlFor="password">Contrasena</label>
        <div className="login-form__password-control">
          <Input
            id="password"
            type={passwordInputType}
            placeholder="********"
            aria-invalid={Boolean(errors.password)}
            aria-describedby={errors.password ? 'password-error' : undefined}
            disabled={isSubmitting}
            {...register('password')}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="login-form__password-toggle"
            onClick={() => setShowPassword((current) => !current)}
            disabled={isSubmitting}
            aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
          >
            {showPassword ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>
        {errors.password ? (
          <p className="login-form__error" id="password-error" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <div className="login-form__field">
        <label htmlFor="confirmPassword">Confirmar contrasena</label>
        <Input
          id="confirmPassword"
          type={passwordInputType}
          placeholder="********"
          aria-invalid={Boolean(errors.confirmPassword)}
          aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
          disabled={isSubmitting}
          {...register('confirmPassword')}
        />
        {errors.confirmPassword ? (
          <p className="login-form__error" id="confirm-password-error" role="alert">
            {errors.confirmPassword.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="w-full">
        {isSubmitting ? (
          <span className="login-form__loading">
            <span className="login-form__spinner" aria-hidden="true" />
            Creando cuenta...
          </span>
        ) : (
          'Crear cuenta'
        )}
      </Button>

      <p className="login-form__register">
        Ya tengo cuenta <Link to="/login">Iniciar sesion</Link>
      </p>
    </form>
  );
}
