import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-layout">
      <section className="auth-hero" aria-label="Portal corporativo PLD Grupo Autocom">
        <div className="auth-hero-grid">
          <div className="auth-hero-content">
            <span>Grupo Autocom</span>
            <strong>Portal de prevencion de lavado de dinero</strong>
            <p>
              Plataforma corporativa para la gestion de informes, validaciones y
              generacion XML de actividades vulnerables.
            </p>
          </div>

          <div className="auth-hero-visual">
            <div className="auth-hero-band">
              <small>PLD Autocom</small>
              <strong>Control, trazabilidad y cumplimiento</strong>
            </div>

            <div className="auth-hero-metrics">
              <div>
                <span>Operacion</span>
                <strong>Ventas, creditos y arrendamientos</strong>
              </div>
              <div>
                <span>Revision</span>
                <strong>Validacion por carga</strong>
              </div>
              <div>
                <span>Salida</span>
                <strong>XML con estructura SAT</strong>
              </div>
            </div>

            <div className="auth-hero-ribbon">
              <span>Uso interno</span>
              <span>Grupo Autocom</span>
              <span>Cumplimiento PLD</span>
            </div>
          </div>
        </div>
      </section>
      <section className="auth-panel" aria-label="Acceso PLD">
        {children}
      </section>
    </main>
  );
}
