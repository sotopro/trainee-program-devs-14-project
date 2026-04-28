import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ApiError } from '@/shared/lib';
import { loginSchema, type LoginFormValues } from '../schemas/loginSchema';
import { authService } from '../services/authService';
import { useAuthActions } from '../store/authStore';
import type { LoginResponse } from '../types/auth.types';

type LoginFormProps = {
  onLoginSuccess: (response: LoginResponse) => void;
};

const DEFAULT_LOGIN_ERROR = 'No pudimos iniciar sesion. Revisa tus credenciales e intenta nuevamente.';

export function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const { login } = useAuthActions();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      login(response);
      onLoginSuccess(response);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status !== undefined && error.status >= 500) {
        setFormError('El servidor tuvo un problema. Intenta nuevamente en unos minutos.');
        return;
      }

      if (error instanceof ApiError && error.status === undefined) {
        setFormError(error.message);
        return;
      }

      setFormError(DEFAULT_LOGIN_ERROR);
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    setFormError(null);
    loginMutation.mutate(values);
  };

  const isSubmitting = loginMutation.isPending;

  return (
    <form className="login-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      {formError ? (
        <div className="login-form__alert" role="alert">
          {formError}
        </div>
      ) : null}

      <div className="login-form__field">
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
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
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="********"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? 'password-error' : undefined}
          disabled={isSubmitting}
          {...register('password')}
        />
        {errors.password ? (
          <p className="login-form__error" id="password-error" role="alert">
            {errors.password.message}
          </p>
        ) : null}
      </div>

      <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting} className="w-full">
        {isSubmitting ? (
          <span className="login-form__loading">
            <span className="login-form__spinner" aria-hidden="true" />
            Iniciando sesion...
          </span>
        ) : (
          'Iniciar sesion'
        )}
      </Button>

      <p className="login-form__register">
        Todavia no tenes cuenta? <Link to="/register">Crear cuenta</Link>
      </p>
    </form>
  );
}
