import axios from "axios";
import {
  Clock3,
  CreditCard,
  Database,
  DollarSign,
  FileText,
  RefreshCw,
  TrendingUp,
  Users
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  getReportDashboardMetricsRequest,
  type ReportDashboardMetrics,
  type ReportTypeMetric
} from "../api/reportsApi";
import { useAuth } from "../auth/AuthContext";
import { FormError } from "../components/FormError";

const reportTypeLabels: Record<string, string> = {
  creditos: "Creditos",
  ventas: "Ventas",
  arrendamientos: "Arrendamientos"
};

const reportTypeIcons = {
  creditos: CreditCard,
  ventas: DollarSign,
  arrendamientos: FileText
};

const getReportTypeClass = (reportType: string) =>
  `report-type-${reportType.toLowerCase()}`;

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "No se pudieron cargar las metricas.";
  }

  return "No se pudieron cargar las metricas.";
};

const formatNumber = (value: number) =>
  new Intl.NumberFormat("es-MX").format(value);

const formatDateTime = (value: string | null) => {
  if (!value) {
    return "Sin cargas";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium"
  }).format(new Date(`${value}T00:00:00`));

const getReportTypeMetric = (
  metrics: ReportDashboardMetrics | null,
  reportType: string
): ReportTypeMetric => {
  const metric = metrics?.by_report_type.find(
    (item) => item.report_type === reportType
  );

  return (
    metric ?? {
      report_type: reportType,
      total_uploads: 0,
      total_rows_inserted: 0,
      total_xml_exports: 0,
      last_upload_at: null
    }
  );
};

export function HomePage() {
  const { session } = useAuth();
  const isAdmin = session?.user.role === "admin";
  const [metrics, setMetrics] = useState<ReportDashboardMetrics | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const reportTypes = useMemo(
    () =>
      ["creditos", "ventas", "arrendamientos"].map((reportType) =>
        getReportTypeMetric(metrics, reportType)
      ),
    [metrics]
  );

  const loadMetrics = async () => {
    setError("");
    setIsLoading(true);

    try {
      const nextMetrics = await getReportDashboardMetricsRequest();
      setMetrics(nextMetrics);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMetrics();
  }, []);

  return (
    <div className="home-dashboard-page">
      <section className="home-hero-panel">
        <div className="home-hero-copy">
          <p className="eyebrow">Portal PLD Grupo Autocom</p>
          <h2>Prevencion de lavado de dinero y control operativo</h2>
          <p>
            Sesion iniciada como <strong>{session?.user.email}</strong>.{" "}
            {isAdmin
              ? "Consulta el comportamiento reciente por tipo de informe, usuario y fecha."
              : "Consulta tus propias cargas, mediciones y actividad reciente."}
          </p>
          <div className="home-hero-tag-list" aria-label="Capacidades principales">
            <span>Informes corporativos</span>
            <span>Validacion por archivo</span>
            <span>XML SAT</span>
          </div>
        </div>

        <div className="home-hero-aside">
          <div className="home-hero-status">
            <div>
              <span>Vista</span>
              <strong>{isAdmin ? "Administracion integral" : "Operacion personal"}</strong>
            </div>
            <div>
              <span>Ultima carga</span>
              <strong>{formatDateTime(metrics?.summary.last_upload_at ?? null)}</strong>
            </div>
          </div>

          <button
            className="ghost-button compact-button"
            disabled={isLoading}
            onClick={() => void loadMetrics()}
            type="button"
          >
            <RefreshCw aria-hidden="true" size={17} strokeWidth={2} />
            <span>{isLoading ? "Actualizando..." : "Actualizar"}</span>
          </button>
        </div>
      </section>

      <FormError message={error} />

      <section className="home-metric-grid">
        <article className="home-metric-card">
          <Database aria-hidden="true" size={24} strokeWidth={2} />
          <span>Cargas totales</span>
          <strong>{formatNumber(metrics?.summary.total_uploads ?? 0)}</strong>
          <small>Archivos procesados</small>
        </article>
        <article className="home-metric-card">
          <TrendingUp aria-hidden="true" size={24} strokeWidth={2} />
          <span>Registros insertados</span>
          <strong>{formatNumber(metrics?.summary.total_rows_inserted ?? 0)}</strong>
          <small>Filas acumuladas</small>
        </article>
        <article className="home-metric-card">
          <FileText aria-hidden="true" size={24} strokeWidth={2} />
          <span>XML generados</span>
          <strong>{formatNumber(metrics?.summary.total_xml_exports ?? 0)}</strong>
          <small>Exportaciones guardadas</small>
        </article>
        <article className="home-metric-card home-metric-card-wide">
          <Clock3 aria-hidden="true" size={24} strokeWidth={2} />
          <span>Ultima carga</span>
          <strong>{formatDateTime(metrics?.summary.last_upload_at ?? null)}</strong>
          <small>Fecha mas reciente registrada</small>
        </article>
      </section>

      <section className="report-type-grid">
        {reportTypes.map((item) => {
          const Icon =
            reportTypeIcons[item.report_type as keyof typeof reportTypeIcons] ??
            FileText;

          return (
            <article
              className={`report-type-card ${getReportTypeClass(item.report_type)}`}
              key={item.report_type}
            >
              <div className="report-type-card-heading">
                <Icon aria-hidden="true" size={22} strokeWidth={2} />
                <div>
                  <span>{reportTypeLabels[item.report_type] ?? item.report_type}</span>
                  <strong>{formatNumber(item.total_uploads)}</strong>
                </div>
              </div>
              <dl>
                <div>
                  <dt>Registros</dt>
                  <dd>{formatNumber(item.total_rows_inserted)}</dd>
                </div>
                <div>
                  <dt>XML</dt>
                  <dd>{formatNumber(item.total_xml_exports)}</dd>
                </div>
                <div>
                  <dt>Ultima carga</dt>
                  <dd>{formatDateTime(item.last_upload_at)}</dd>
                </div>
              </dl>
            </article>
          );
        })}
      </section>

      <section className="home-dashboard-panels">
        <article className="home-list-panel">
          <div className="section-heading section-heading-row">
            <div>
              <p className="eyebrow">Usuarios</p>
              <h2>Mayor volumen de cargas</h2>
            </div>
            <Users aria-hidden="true" size={24} strokeWidth={2} />
          </div>

          {isLoading ? (
            <p>Cargando usuarios...</p>
          ) : metrics?.top_users.length ? (
            <div className="home-ranked-list">
              {metrics.top_users.map((user, index) => (
                <div className="home-ranked-row" key={user.user_id}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{user.email}</strong>
                    <small>{formatDateTime(user.last_upload_at)}</small>
                  </div>
                  <em>{formatNumber(user.total_uploads)} cargas</em>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay cargas registradas todavia.</p>
          )}
        </article>

        <article className="home-list-panel">
          <div className="section-heading">
            <p className="eyebrow">Fechas</p>
            <h2>Actividad reciente</h2>
          </div>

          {isLoading ? (
            <p>Cargando actividad...</p>
          ) : metrics?.uploads_by_date.length ? (
            <div className="activity-list">
              {metrics.uploads_by_date.map((item) => (
                <div className="activity-row" key={item.upload_date}>
                  <strong>{formatDate(item.upload_date)}</strong>
                  <span>{formatNumber(item.total_uploads)} cargas</span>
                  <small>{formatNumber(item.total_rows_inserted)} registros</small>
                </div>
              ))}
            </div>
          ) : (
            <p>No hay actividad reciente.</p>
          )}
        </article>
      </section>

      <section className="home-list-panel">
        <div className="section-heading">
          <p className="eyebrow">Ultimas cargas</p>
          <h2>Archivos procesados recientemente</h2>
        </div>

        {isLoading ? (
          <p>Cargando ultimas cargas...</p>
        ) : metrics?.latest_uploads.length ? (
          <div className="table-wrap">
            <table className="users-table home-uploads-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Archivo</th>
                  <th>Empresa</th>
                  <th>Usuario</th>
                  <th>Filas</th>
                  <th>XML</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {metrics.latest_uploads.map((upload) => (
                  <tr
                    className={`report-row ${getReportTypeClass(upload.report_type)}`}
                    key={upload.id}
                  >
                    <td>
                      <span
                        className={`role-pill report-pill ${getReportTypeClass(
                          upload.report_type
                        )}`}
                      >
                        {upload.report_type}
                      </span>
                    </td>
                    <td>{upload.file_name}</td>
                    <td>{upload.company_name}</td>
                    <td>{upload.uploaded_by_email}</td>
                    <td>{formatNumber(upload.rows_inserted)}</td>
                    <td>
                      {upload.xml_export_id ? (
                        <span className="xml-ready-label">Generado</span>
                      ) : (
                        <span className="muted-table-text">Sin XML</span>
                      )}
                    </td>
                    <td>{formatDateTime(upload.uploaded_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No hay cargas registradas todavia.</p>
        )}
      </section>
    </div>
  );
}
