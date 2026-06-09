import axios from "axios";
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileSearch,
  FileText,
  RefreshCw,
  RotateCcw,
  Search
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  downloadCreditXmlRequest,
  downloadLeaseXmlRequest,
  downloadSalesXmlRequest,
  listReportUploadsRequest,
  type ReportUploadItem
} from "../api/reportsApi";
import { FormError } from "../components/FormError";
import { downloadBlob } from "../utils/downloadFile";

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "No se pudieron cargar los registros.";
  }

  return "No se pudieron cargar los registros.";
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));

const monthNames: Record<number, string> = {
  1: "Enero",
  2: "Febrero",
  3: "Marzo",
  4: "Abril",
  5: "Mayo",
  6: "Junio",
  7: "Julio",
  8: "Agosto",
  9: "Septiembre",
  10: "Octubre",
  11: "Noviembre",
  12: "Diciembre"
};

const formatAffectationPeriod = (
  month: number | null,
  year: number | null
) => {
  if (!month || !year) {
    return "Sin periodo";
  }

  return `${monthNames[month] ?? month} ${year}`;
};

const getReportTypeClass = (reportType: string) =>
  `report-type-${reportType.toLowerCase()}`;

export function ReportUploadsPage() {
  const [uploads, setUploads] = useState<ReportUploadItem[]>([]);
  const [error, setError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingXmlId, setDownloadingXmlId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [reportTypeFilter, setReportTypeFilter] = useState("todos");
  const [companyFilter, setCompanyFilter] = useState("todas");
  const [userFilter, setUserFilter] = useState("todos");
  const [monthFilter, setMonthFilter] = useState("todos");
  const [yearFilter, setYearFilter] = useState("todos");
  const [xmlFilter, setXmlFilter] = useState("todos");
  const [isFiltersOpen, setIsFiltersOpen] = useState(true);

  const loadUploads = async () => {
    setError("");
    setDownloadError("");
    setIsLoading(true);

    try {
      const nextUploads = await listReportUploadsRequest();
      setUploads(nextUploads);
    } catch (nextError) {
      setError(getErrorMessage(nextError));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadXml = async (upload: ReportUploadItem) => {
    if (!upload.xml_export_id) {
      return;
    }

    setDownloadError("");
    setDownloadingXmlId(upload.xml_export_id);

    try {
      const blob =
        upload.report_type === "ventas"
          ? await downloadSalesXmlRequest(upload.xml_export_id)
          : upload.report_type === "arrendamientos"
            ? await downloadLeaseXmlRequest(upload.xml_export_id)
          : await downloadCreditXmlRequest(upload.xml_export_id);
      downloadBlob(
        blob,
        upload.xml_file_name ??
          (upload.report_type === "arrendamientos" ? "arrendamiento.xml" : "credito.xml")
      );
    } catch (nextError) {
      setDownloadError(getErrorMessage(nextError));
    } finally {
      setDownloadingXmlId(null);
    }
  };

  useEffect(() => {
    void loadUploads();
  }, []);

  const companyOptions = useMemo(
    () =>
      Array.from(new Set(uploads.map((upload) => upload.company_name)))
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right, "es-MX")),
    [uploads]
  );

  const userOptions = useMemo(
    () =>
      Array.from(new Set(uploads.map((upload) => upload.uploaded_by_email)))
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right, "es-MX")),
    [uploads]
  );

  const yearOptions = useMemo(
    () =>
      Array.from(
        new Set(
          uploads
            .map((upload) => upload.anio_afectacion)
            .filter((year): year is number => year !== null)
        )
      ).sort((left, right) => right - left),
    [uploads]
  );

  const filteredUploads = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return uploads.filter((upload) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          upload.file_name,
          upload.company_name,
          upload.uploaded_by_email,
          upload.report_type,
          upload.tipo_actividad,
          upload.xml_file_name ?? ""
        ].some((value) => value.toLowerCase().includes(normalizedSearch));
      const matchesReportType =
        reportTypeFilter === "todos" || upload.report_type === reportTypeFilter;
      const matchesCompany =
        companyFilter === "todas" || upload.company_name === companyFilter;
      const matchesUser = userFilter === "todos" || upload.uploaded_by_email === userFilter;
      const matchesMonth =
        monthFilter === "todos" || String(upload.mes_afectacion ?? "") === monthFilter;
      const matchesYear =
        yearFilter === "todos" || String(upload.anio_afectacion ?? "") === yearFilter;
      const matchesXml =
        xmlFilter === "todos" ||
        (xmlFilter === "con-xml" ? Boolean(upload.xml_export_id) : !upload.xml_export_id);

      return (
        matchesSearch &&
        matchesReportType &&
        matchesCompany &&
        matchesUser &&
        matchesMonth &&
        matchesYear &&
        matchesXml
      );
    });
  }, [
    companyFilter,
    monthFilter,
    reportTypeFilter,
    searchTerm,
    uploads,
    userFilter,
    xmlFilter,
    yearFilter
  ]);

  const filteredTotals = useMemo(
    () => ({
      rowsInserted: filteredUploads.reduce((total, upload) => total + upload.rows_inserted, 0),
      uploadsCount: filteredUploads.length,
      xmlCount: filteredUploads.filter((upload) => upload.xml_export_id).length
    }),
    [filteredUploads]
  );

  const resetFilters = () => {
    setSearchTerm("");
    setReportTypeFilter("todos");
    setCompanyFilter("todas");
    setUserFilter("todos");
    setMonthFilter("todos");
    setYearFilter("todos");
    setXmlFilter("todos");
  };

  return (
    <section className="users-table-panel full-panel">
      <div className="section-heading section-heading-row">
        <div>
          <p className="eyebrow">Informes</p>
          <h2>Cargas realizadas</h2>
          <p>Consulta los archivos cargados, usuario responsable y empresa destino.</p>
        </div>
        <button
          className="ghost-button compact-button"
          disabled={isLoading}
          type="button"
          onClick={() => void loadUploads()}
        >
          <RefreshCw aria-hidden="true" size={17} strokeWidth={2} />
          <span>Actualizar</span>
        </button>
      </div>

      <FormError message={error} />
      <FormError message={downloadError} />

      <section className="uploads-filters-panel">
        <div className="section-heading section-heading-row uploads-filters-header">
          <div>
            <div className="filters-heading-line">
              <FileSearch aria-hidden="true" size={18} strokeWidth={2} />
              <strong>Busqueda y filtros</strong>
            </div>
            <p>
              Filtra por archivo, usuario, empresa, tipo de informe, periodo o
              disponibilidad de XML.
            </p>
          </div>
          <button
            aria-expanded={isFiltersOpen}
            className="ghost-button compact-button"
            type="button"
            onClick={() => setIsFiltersOpen((current) => !current)}
          >
            {isFiltersOpen ? (
              <ChevronUp aria-hidden="true" size={16} strokeWidth={2} />
            ) : (
              <ChevronDown aria-hidden="true" size={16} strokeWidth={2} />
            )}
            <span>{isFiltersOpen ? "Ocultar filtros" : "Mostrar filtros"}</span>
          </button>
        </div>

        <div
          className={
            isFiltersOpen
              ? "uploads-filters-body uploads-filters-body-open"
              : "uploads-filters-body"
          }
        >
          <div className="uploads-filters-grid">
            <label className="filter-search-field">
              <span>Buscar</span>
              <div className="filter-search-input">
                <Search aria-hidden="true" size={17} strokeWidth={2} />
                <input
                  placeholder="Archivo, empresa, usuario, actividad o XML"
                  type="text"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                />
              </div>
            </label>

            <label>
              <span>Tipo de informe</span>
              <select
                value={reportTypeFilter}
                onChange={(event) => setReportTypeFilter(event.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="ventas">Ventas</option>
                <option value="creditos">Creditos</option>
                <option value="arrendamientos">Arrendamientos</option>
              </select>
            </label>

            <label>
              <span>Empresa</span>
              <select
                value={companyFilter}
                onChange={(event) => setCompanyFilter(event.target.value)}
              >
                <option value="todas">Todas</option>
                {companyOptions.map((company) => (
                  <option key={company} value={company}>
                    {company}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Usuario</span>
              <select value={userFilter} onChange={(event) => setUserFilter(event.target.value)}>
                <option value="todos">Todos</option>
                {userOptions.map((user) => (
                  <option key={user} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Mes</span>
              <select value={monthFilter} onChange={(event) => setMonthFilter(event.target.value)}>
                <option value="todos">Todos</option>
                {Object.entries(monthNames).map(([monthValue, monthLabel]) => (
                  <option key={monthValue} value={monthValue}>
                    {monthLabel}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Anio</span>
              <select value={yearFilter} onChange={(event) => setYearFilter(event.target.value)}>
                <option value="todos">Todos</option>
                {yearOptions.map((year) => (
                  <option key={year} value={String(year)}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>XML</span>
              <select value={xmlFilter} onChange={(event) => setXmlFilter(event.target.value)}>
                <option value="todos">Todos</option>
                <option value="con-xml">Con XML</option>
                <option value="sin-xml">Sin XML</option>
              </select>
            </label>
          </div>

          <div className="uploads-filters-footer">
            <div className="uploads-filter-stats">
              <div>
                <span>Cargas visibles</span>
                <strong>{filteredTotals.uploadsCount}</strong>
              </div>
              <div>
                <span>Filas visibles</span>
                <strong>{filteredTotals.rowsInserted}</strong>
              </div>
              <div>
                <span>XML visibles</span>
                <strong>{filteredTotals.xmlCount}</strong>
              </div>
            </div>

            <button className="ghost-button compact-button" type="button" onClick={resetFilters}>
              <RotateCcw aria-hidden="true" size={16} strokeWidth={2} />
              <span>Limpiar filtros</span>
            </button>
          </div>
        </div>
      </section>

      {isLoading ? (
        <p>Cargando registros...</p>
      ) : uploads.length === 0 ? (
        <p>No hay cargas registradas todavia.</p>
      ) : filteredUploads.length === 0 ? (
        <p>No se encontraron cargas con los filtros seleccionados.</p>
      ) : (
        <div className="table-wrap">
          <table className="users-table uploads-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Archivo</th>
                <th>Empresa</th>
                <th>Periodo</th>
                <th>Actividad</th>
                <th>Usuario</th>
                <th>Filas</th>
                <th>Campos</th>
                <th>XML</th>
                <th>Fecha de carga</th>
              </tr>
            </thead>
            <tbody>
              {filteredUploads.map((upload) => (
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
                  <td>
                    {formatAffectationPeriod(
                      upload.mes_afectacion,
                      upload.anio_afectacion
                    )}
                  </td>
                  <td>{upload.tipo_actividad}</td>
                  <td>{upload.uploaded_by_email}</td>
                  <td>{upload.rows_inserted}</td>
                  <td>{upload.fields_inserted}</td>
                  <td>
                    {upload.xml_export_id ? (
                      <div className="xml-file-cell">
                        <span>
                          <FileText aria-hidden="true" size={16} strokeWidth={2} />
                          {upload.xml_file_name}
                        </span>
                        <small>
                          {upload.xml_rows_exported ?? 0} registros
                          {upload.xml_created_at
                            ? `, generado ${formatDate(upload.xml_created_at)}`
                            : ""}
                        </small>
                        <button
                          className="ghost-button compact-button"
                          disabled={downloadingXmlId === upload.xml_export_id}
                          onClick={() => void handleDownloadXml(upload)}
                          type="button"
                        >
                          <Download aria-hidden="true" size={16} strokeWidth={2} />
                          <span>
                            {downloadingXmlId === upload.xml_export_id
                              ? "Guardando..."
                              : "Guardar"}
                          </span>
                        </button>
                      </div>
                    ) : (
                      <span className="muted-table-text">Sin XML</span>
                    )}
                  </td>
                  <td>{formatDate(upload.uploaded_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
