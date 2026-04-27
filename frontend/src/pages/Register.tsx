import { useNavigate } from 'react-router-dom';
import { RegisterForm } from '@/features/auth';

export function RegisterPage() {
  const navigate = useNavigate();

  const handleRegisterSuccess = () => {
    navigate('/catalog', { replace: true });
  };

  return (
    <main className="auth-page">
      <section className="auth-card" aria-labelledby="register-title">
        <div className="auth-card__header">
          <p className="auth-card__eyebrow">LearnPath</p>
          <h1 id="register-title">Crear cuenta</h1>
          <p>Registrate para empezar a construir tu ruta de aprendizaje.</p>
        </div>
        <RegisterForm onRegisterSuccess={handleRegisterSuccess} />
      </section>
    </main>
  );
}
