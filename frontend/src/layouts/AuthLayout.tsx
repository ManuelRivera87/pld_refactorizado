import type { ReactNode } from "react";

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="auth-layout">
      <section className="auth-hero" aria-hidden="true">
        <div className="auth-hero-content">
          <span>PLD</span>
          <strong>Prevencion, control y seguimiento operativo.</strong>
        </div>
      </section>
      <section className="auth-panel" aria-label="Acceso PLD">
        {children}
      </section>
    </main>
  );
}
