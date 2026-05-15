import axios from "axios";
import { Download, FileText, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import {
  downloadCreditXmlRequest,
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

export function ReportUploadsPage() {
  const [uploads, setUploads] = useState<ReportUploadItem[]>([]);
  const [error, setError] = useState("");
  const [downloadError, setDownloadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [downloadingXmlId, setDownloadingXmlId] = useState<string | null>(null);

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
          : await downloadCreditXmlRequest(upload.xml_export_id);
      downloadBlob(blob, upload.xml_file_name ?? "credito.xml");
    } catch (nextError) {
      setDownloadError(getErrorMessage(nextError));
    } finally {
      setDownloadingXmlId(null);
    }
  };

  useEffect(() => {
    void loadUploads();
  }, []);

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

      {isLoading ? (
        <p>Cargando registros...</p>
      ) : uploads.length === 0 ? (
        <p>No hay cargas registradas todavia.</p>
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
              {uploads.map((upload) => (
                <tr key={upload.id}>
                  <td>
                    <span className="role-pill">{upload.report_type}</span>
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
