export function AuthLoading() {
  return (
    <main className="auth-guard-loading" aria-live="polite" aria-busy="true">
      <span className="login-form__spinner auth-guard-loading__spinner" aria-hidden="true" />
      Verificando sesion...
    </main>
  );
}
