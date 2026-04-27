import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export function UnauthorizedPage() {
  return (
    <main className="auth-page">
      <section className="auth-card auth-card--centered" aria-labelledby="unauthorized-title">
        <p className="auth-card__eyebrow">403</p>
        <h1 id="unauthorized-title">No autorizado</h1>
        <p>No tenes permisos para acceder a esta seccion.</p>
        <Button asChild className="auth-card__action">
          <Link to="/">Volver al inicio</Link>
        </Button>
      </section>
    </main>
  );
}
