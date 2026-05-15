import { useAuth } from "../auth/AuthContext";

export function HomePage() {
  const { session } = useAuth();

  return (
    <div className="dashboard-grid">
      <section className="welcome-panel">
        <p className="eyebrow">Bienvenido</p>
        <h2>Operacion PLD</h2>
        <p>
          Sesion iniciada como <strong>{session?.user.email}</strong>. Los modulos
          administrativos ya estan listos para integracion.
        </p>
      </section>

      <section className="summary-panel">
        <span className="summary-value">4</span>
        <p>Modulos disponibles en el menu lateral.</p>
      </section>
    </div>
  );
}
