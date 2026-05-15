import axios from "axios";
import { CalendarClock, FileSpreadsheet, RefreshCw, Rows3 } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getMyUploadDashboardRequest,
  type MyUploadDashboard
} from "../api/reportsApi";
import { useAuth } from "../auth/AuthContext";
import { FormError } from "../components/FormError";

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "No se pudo cargar el perfil.";
  }

  return "No se pudo cargar el perfil.";
};

const formatDate = (value: string | null) => {
  if (!value) {
    return "Sin cargas registradas";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

export function ProfilePage() {
  const { session } = useAuth();
  const [dashboard, setDashboard] = useState<MyUploadDashboard | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboard = async () => {
    setError("");
    setIsLoading(true);

    try {
      const nextDashboard = await getMyUploadDashboardRequest();
      setDashboard(nextDashboard);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadDashboard();
  }, []);

  const totalUploads = dashboard?.total_uploads ?? 0;
  const totalRows = dashboard?.total_rows_inserted ?? 0;

  return (
    <div className="profile-page">
      <section className="profile-hero-panel">
        <div>
          <p className="eyebrow">Cuenta</p>
          <h2>Mi perfil</h2>
          <p>Resumen general de actividad para el usuario autenticado.</p>
        </div>

        <div className="profile-user-card">
          <span>Usuario</span>
          <strong>{session?.user.email}</strong>
          <small>{session?.user.role}</small>
        </div>
      </section>

      <FormError message={error} />

      <section className="profile-dashboard-grid">
        <article className="profile-stat-card">
          <FileSpreadsheet aria-hidden="true" size={24} strokeWidth={2} />
          <span>Cargas realizadas</span>
          <strong>{isLoading ? "..." : totalUploads}</strong>
        </article>

        <article className="profile-stat-card">
          <Rows3 aria-hidden="true" size={24} strokeWidth={2} />
          <span>Filas cargadas</span>
          <strong>{isLoading ? "..." : totalRows}</strong>
        </article>

        <article className="profile-stat-card profile-stat-card-wide">
          <CalendarClock aria-hidden="true" size={24} strokeWidth={2} />
          <span>Ultima carga</span>
          <strong>
            {isLoading ? "Cargando..." : formatDate(dashboard?.last_upload_at ?? null)}
          </strong>
        </article>
      </section>

      <section className="profile-detail-panel">
        <div className="section-heading section-heading-row">
          <div>
            <p className="eyebrow">Actividad reciente</p>
            <h2>Detalle de ultima carga</h2>
          </div>
          <button
            className="ghost-button compact-button"
            disabled={isLoading}
            onClick={() => void loadDashboard()}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={17} strokeWidth={2} />
            <span>Actualizar</span>
          </button>
        </div>

        {isLoading ? (
          <p>Cargando actividad...</p>
        ) : dashboard?.last_upload_at ? (
          <dl className="summary-list">
            <div>
              <dt>Tipo</dt>
              <dd>{dashboard.last_report_type}</dd>
            </div>
            <div>
              <dt>Archivo</dt>
              <dd>{dashboard.last_file_name}</dd>
            </div>
            <div>
              <dt>Empresa</dt>
              <dd>{dashboard.last_company_name}</dd>
            </div>
            <div>
              <dt>Filas</dt>
              <dd>{dashboard.last_rows_inserted}</dd>
            </div>
            <div>
              <dt>Fecha</dt>
              <dd>{formatDate(dashboard.last_upload_at)}</dd>
            </div>
          </dl>
        ) : (
          <p>Aun no tienes cargas registradas con este usuario.</p>
        )}
      </section>
    </div>
  );
}
