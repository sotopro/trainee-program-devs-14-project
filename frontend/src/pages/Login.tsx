import { useNavigate, useSearchParams } from 'react-router-dom';
import { LoginForm, type LoginResponse } from '@/features/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('session') === 'expired';

  const handleLoginSuccess = ({ user }: LoginResponse) => {
    const redirect = searchParams.get('redirect');
    const safeRedirect = redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : null;

    navigate(safeRedirect ?? (user.role === 'ADMIN' ? '/admin/dashboard' : '/catalog'), {
      replace: true,
    });
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="login-title">
        <div className="auth-card__header">
          <p className="auth-card__eyebrow">LearnPath</p>
          <h1 id="login-title">Iniciar sesion</h1>
          <p>Entra con tus credenciales para continuar tu ruta de aprendizaje.</p>
        </div>
        {sessionExpired ? (
          <div className="login-form__alert" role="alert">
            Tu sesion expiro. Inicia sesion nuevamente para continuar.
          </div>
        ) : null}
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </section>
    </main>
  );
}
