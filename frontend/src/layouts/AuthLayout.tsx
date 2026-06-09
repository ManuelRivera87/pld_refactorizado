import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-layout">
      <section className="auth-hero" aria-label="Portal corporativo PLD">
        <div className="auth-hero-grid">
          <div className="auth-hero-content">
            <span>Portal interno de cumplimiento</span>
            <strong>Prevencion de lavado de dinero</strong>
            <p>
              Plataforma institucional para la gestion de informes, validaciones y
              trazabilidad operativa de actividades vulnerables.
            </p>
          </div>

          <div className="auth-hero-visual">
            <div className="auth-hero-band">
              <small>Operacion regulatoria</small>
              <strong>Control documental, seguimiento y salida estructurada</strong>
            </div>

            <div className="auth-hero-metrics">
              <div>
                <span>Esquemas</span>
                <strong>Ventas, creditos y arrendamientos</strong>
              </div>
              <div>
                <span>Revision</span>
                <strong>Validacion por archivo y por campo</strong>
              </div>
              <div>
                <span>Trazabilidad</span>
                <strong>Registro de cargas, usuarios y periodos de afectacion</strong>
              </div>
            </div>

            <div className="auth-hero-ribbon">
              <span>Uso interno</span>
              <span>Acceso controlado</span>
              <span>Normativa SAT</span>
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
