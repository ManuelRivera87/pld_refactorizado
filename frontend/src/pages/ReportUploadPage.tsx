import axios from "axios";
import {
  Download,
  FileSpreadsheet,
  FileText,
  RotateCcw,
  Upload
} from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { listCompaniesRequest, type CompanyItem } from "../api/companiesApi";
import {
  downloadCreditXmlRequest,
  downloadSalesXmlRequest,
  generateCreditXmlRequest,
  generateSalesXmlRequest,
  uploadCreditReportRequest,
  uploadSalesReportRequest,
  type CreditReportUploadSummary,
  type CreditXmlExportSummary,
  type CreditReportValidationError
} from "../api/reportsApi";
import { FormError } from "../components/FormError";
import { downloadBlob } from "../utils/downloadFile";

type ReportKind = "ventas" | "creditos" | "arrendamientos";

type ReportUploadPageProps = {
  kind: ReportKind;
};

const reportLabels: Record<ReportKind, { title: string; description: string }> = {
  ventas: {
    title: "Carga de informe de ventas",
    description: "Selecciona la empresa y carga el archivo XLS de ventas."
  },
  creditos: {
    title: "Carga de informe de creditos",
    description: "Selecciona la empresa y carga el archivo XLS de creditos."
  },
  arrendamientos: {
    title: "Carga de informe de arrendamientos",
    description: "Selecciona la empresa y carga el archivo XLS de arrendamientos."
  }
};

const affectationYears = ["2022", "2023", "2024", "2025"];

const affectationMonths = [
  { value: "1", label: "Enero" },
  { value: "2", label: "Febrero" },
  { value: "3", label: "Marzo" },
  { value: "4", label: "Abril" },
  { value: "5", label: "Mayo" },
  { value: "6", label: "Junio" },
  { value: "7", label: "Julio" },
  { value: "8", label: "Agosto" },
  { value: "9", label: "Septiembre" },
  { value: "10", label: "Octubre" },
  { value: "11", label: "Noviembre" },
  { value: "12", label: "Diciembre" }
];

const getMonthLabel = (month: number) =>
  affectationMonths.find((item) => item.value === String(month))?.label ??
  String(month);

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "No se pudo procesar la solicitud.";
  }

  return "No se pudo procesar la solicitud.";
};

const getValidationErrors = (error: unknown) => {
  if (
    axios.isAxiosError<{
      details?: { validationErrors?: CreditReportValidationError[] };
    }>(error)
  ) {
    return error.response?.data.details?.validationErrors ?? [];
  }

  return [];
};

const formatValidationValue = (value: unknown) => {
  if (value === null || value === undefined || value === "") {
    return "Vacio";
  }

  return String(value);
};

const getReportKindClass = (kind: ReportKind) => `report-type-${kind}`;

export function ReportUploadPage({ kind }: ReportUploadPageProps) {
  const [companies, setCompanies] = useState<CompanyItem[]>([]);
  const [companyId, setCompanyId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [mesAfectacion, setMesAfectacion] = useState("");
  const [anioAfectacion, setAnioAfectacion] = useState("");
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    CreditReportValidationError[]
  >([]);
  const [success, setSuccess] = useState("");
  const [uploadSummary, setUploadSummary] =
    useState<CreditReportUploadSummary | null>(null);
  const [xmlSummary, setXmlSummary] = useState<CreditXmlExportSummary | null>(null);
  const [xmlError, setXmlError] = useState("");
  const [xmlDownloadError, setXmlDownloadError] = useState("");
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isGeneratingXml, setIsGeneratingXml] = useState(false);
  const [isDownloadingXml, setIsDownloadingXml] = useState(false);

  const labels = reportLabels[kind];
  const isCreditReport = kind === "creditos";
  const isSalesReport = kind === "ventas";
  const isUploadEnabledReport = isCreditReport || isSalesReport;
  const activityType = isSalesReport ? "VEH" : "MPC";
  const selectedCompany = useMemo(
    () => companies.find((company) => company.id === companyId),
    [companies, companyId]
  );

  useEffect(() => {
    const loadCompanies = async () => {
      setError("");
      setIsLoadingCompanies(true);

      try {
        const nextCompanies = await listCompaniesRequest();
        setCompanies(nextCompanies);
      } catch (nextError) {
        setError(getErrorMessage(nextError));
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    void loadCompanies();
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setValidationErrors([]);
    setSuccess("");
    setUploadSummary(null);
    setXmlSummary(null);
    setXmlError("");
    setXmlDownloadError("");

    if (!companyId || !file) {
      setError("Selecciona una empresa y un archivo XLS.");
      return;
    }

    if (isUploadEnabledReport && (!mesAfectacion || !anioAfectacion)) {
      setError("Selecciona mes y anio de afectacion.");
      return;
    }

    if (!isUploadEnabledReport) {
      setSuccess(
        `Archivo ${file.name} listo para informe de ${kind} de ${selectedCompany?.name}.`
      );
      return;
    }

    setIsUploading(true);

    try {
      const summary = isSalesReport
        ? await uploadSalesReportRequest({
            anioAfectacion,
            companyId,
            file,
            mesAfectacion
          })
        : await uploadCreditReportRequest({
            anioAfectacion,
            companyId,
            file,
            mesAfectacion
          });
      setUploadSummary(summary);
      setXmlSummary(null);
      setSuccess(
        `Informe de ${kind} cargado correctamente para ${summary.companyName}.`
      );
    } catch (nextError) {
      setError(getErrorMessage(nextError));
      setValidationErrors(getValidationErrors(nextError));
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateXml = async () => {
    if (!uploadSummary) {
      return;
    }

    setXmlError("");
    setXmlDownloadError("");
    setXmlSummary(null);
    setIsGeneratingXml(true);

    try {
      const summary = isSalesReport
        ? await generateSalesXmlRequest(uploadSummary.uploadId)
        : await generateCreditXmlRequest(uploadSummary.uploadId);
      setXmlSummary(summary);
    } catch (nextError) {
      setXmlError(getErrorMessage(nextError));
    } finally {
      setIsGeneratingXml(false);
    }
  };

  const handleDownloadXml = async () => {
    if (!xmlSummary) {
      return;
    }

    setXmlDownloadError("");
    setIsDownloadingXml(true);

    try {
      const blob = isSalesReport
        ? await downloadSalesXmlRequest(xmlSummary.id)
        : await downloadCreditXmlRequest(xmlSummary.id);
      downloadBlob(blob, xmlSummary.fileName);
    } catch (nextError) {
      setXmlDownloadError(getErrorMessage(nextError));
    } finally {
      setIsDownloadingXml(false);
    }
  };

  const handleRetryUpload = () => {
    setFile(null);
    setFileInputKey((currentKey) => currentKey + 1);
    setError("");
    setValidationErrors([]);
    setSuccess("");
    setUploadSummary(null);
    setXmlSummary(null);
    setXmlError("");
    setXmlDownloadError("");
  };

  return (
    <div className={`report-upload-page ${getReportKindClass(kind)}`}>
      <section className="report-hero-panel">
        <p className="eyebrow">Informes</p>
        <h2>{labels.title}</h2>
        <p>{labels.description}</p>
        <span className={`report-kind-badge ${getReportKindClass(kind)}`}>
          {kind}
        </span>
      </section>

      <section className="report-form-panel">
        <form className="report-upload-form" onSubmit={handleSubmit}>
          <label>
            <span>Empresa</span>
            <select
              disabled={isLoadingCompanies}
              onChange={(event) => setCompanyId(event.target.value)}
              required
              value={companyId}
            >
              <option value="">
                {isLoadingCompanies ? "Cargando empresas..." : "Selecciona empresa"}
              </option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>

          {isUploadEnabledReport ? (
            <div className="report-period-grid">
              <label>
                <span>Mes afectacion</span>
                <select
                  onChange={(event) => setMesAfectacion(event.target.value)}
                  required
                  value={mesAfectacion}
                >
                  <option value="">Selecciona mes</option>
                  {affectationMonths.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Anio afectacion</span>
                <select
                  onChange={(event) => setAnioAfectacion(event.target.value)}
                  required
                  value={anioAfectacion}
                >
                  <option value="">Selecciona anio</option>
                  {affectationYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <div className="fixed-report-field">
                <span>Tipo de actividad</span>
                <strong>{activityType}</strong>
              </div>
            </div>
          ) : null}

          <label>
            <span>Archivo XLS</span>
            <div className="file-upload-box">
              <FileSpreadsheet aria-hidden="true" size={34} strokeWidth={1.8} />
              <strong>{file ? file.name : "Selecciona archivo .xls o .xlsx"}</strong>
              <p>El archivo se asociara al informe de {kind}.</p>
              <input
                accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                key={fileInputKey}
                onChange={(event) => {
                  setFile(event.target.files?.[0] ?? null);
                  setSuccess("");
                  setValidationErrors([]);
                  setUploadSummary(null);
                  setXmlSummary(null);
                  setXmlError("");
                  setXmlDownloadError("");
                }}
                required
                type="file"
              />
            </div>
          </label>

          <FormError message={error} />

          {validationErrors.length > 0 ? (
            <section className="validation-errors-panel">
              <div className="section-heading section-heading-row">
                <div>
                  <p className="eyebrow">Validacion</p>
                  <h2>Campos por corregir</h2>
                </div>
                <span className="counter-badge">{validationErrors.length}</span>
              </div>

              <div className="table-wrap">
                <table className="users-table validation-errors-table">
                  <thead>
                    <tr>
                      <th>Fila</th>
                      <th>Campo</th>
                      <th>Error</th>
                      <th>Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationErrors.slice(0, 50).map((item, index) => (
                      <tr key={`${item.rowNumber}-${item.column}-${index}`}>
                        <td>{item.rowNumber}</td>
                        <td>{item.field}</td>
                        <td>{item.message}</td>
                        <td>{formatValidationValue(item.value)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {validationErrors.length > 50 ? (
                <p className="validation-errors-note">
                  Se muestran los primeros 50 errores.
                </p>
              ) : null}

              <button
                className="ghost-button compact-button retry-upload-button"
                onClick={handleRetryUpload}
                type="button"
              >
                <RotateCcw aria-hidden="true" size={17} strokeWidth={2} />
                <span>Volver a cargar archivo</span>
              </button>
            </section>
          ) : null}

          {success ? <div className="form-success">{success}</div> : null}

          {uploadSummary ? (
            <section className="upload-summary">
              <div className="section-heading section-heading-row">
                <div>
                  <p className="eyebrow">Insercion exitosa</p>
                  <h2>Resumen de carga</h2>
                </div>
                <span className="counter-badge">{uploadSummary.rowsInserted}</span>
              </div>

              <dl className="summary-list">
                <div>
                  <dt>Archivo</dt>
                  <dd>{uploadSummary.fileName}</dd>
                </div>
                <div>
                  <dt>Empresa</dt>
                  <dd>{uploadSummary.companyName}</dd>
                </div>
                <div>
                  <dt>Filas insertadas</dt>
                  <dd>{uploadSummary.rowsInserted}</dd>
                </div>
                <div>
                  <dt>Campos insertados por fila</dt>
                  <dd>{uploadSummary.fieldsInserted}</dd>
                </div>
                <div>
                  <dt>Fecha de carga</dt>
                  <dd>{new Date(uploadSummary.uploadedAt).toLocaleString("es-MX")}</dd>
                </div>
                <div>
                  <dt>Mes afectacion</dt>
                  <dd>{getMonthLabel(uploadSummary.mesAfectacion)}</dd>
                </div>
                <div>
                  <dt>Anio afectacion</dt>
                  <dd>{uploadSummary.anioAfectacion}</dd>
                </div>
                <div>
                  <dt>Tipo de actividad</dt>
                  <dd>{uploadSummary.tipoActividad}</dd>
                </div>
              </dl>

              <details className="field-details">
                <summary>Ver campos insertados</summary>
                <div className="field-list">
                  {uploadSummary.insertedFields.map((field) => (
                    <span key={field.column}>
                      {field.header} {"->"} {field.column}
                    </span>
                  ))}
                </div>
              </details>

              <div className="xml-export-actions">
                <button
                  className="ghost-button"
                  disabled={isGeneratingXml}
                  onClick={handleGenerateXml}
                  type="button"
                >
                  <FileText aria-hidden="true" size={18} strokeWidth={2} />
                  <span>{isGeneratingXml ? "Generando XML..." : "Generar XML"}</span>
                </button>
                <p>
                  El XML se genera con el formato SAT de {kind} y queda guardado
                  en {isSalesReport ? "upload/xmlventa" : "upload/xmlcredito"}.
                </p>
              </div>

              <FormError message={xmlError} />

              {xmlSummary ? (
                <section className="xml-summary">
                  <div className="section-heading section-heading-row">
                    <div>
                      <p className="eyebrow">XML generado</p>
                      <h2>Archivo listo</h2>
                    </div>
                    <span className="counter-badge">{xmlSummary.rowsExported}</span>
                  </div>

                  <dl className="summary-list">
                    <div>
                      <dt>Archivo XML</dt>
                      <dd>{xmlSummary.fileName}</dd>
                    </div>
                    <div>
                      <dt>Ruta</dt>
                      <dd>{xmlSummary.filePath}</dd>
                    </div>
                    <div>
                      <dt>Registros XML</dt>
                      <dd>{xmlSummary.rowsExported}</dd>
                    </div>
                    <div>
                      <dt>Fecha de creacion</dt>
                      <dd>{new Date(xmlSummary.createdAt).toLocaleString("es-MX")}</dd>
                    </div>
                    <div>
                      <dt>Periodo</dt>
                      <dd>
                        {getMonthLabel(xmlSummary.mesAfectacion)} {xmlSummary.anioAfectacion}
                      </dd>
                    </div>
                    <div>
                      <dt>Empresa</dt>
                      <dd>{xmlSummary.companyName}</dd>
                    </div>
                  </dl>

                  <div className="xml-export-actions compact-actions">
                    <button
                      className="ghost-button"
                      disabled={isDownloadingXml}
                      onClick={handleDownloadXml}
                      type="button"
                    >
                      <Download aria-hidden="true" size={18} strokeWidth={2} />
                      <span>
                        {isDownloadingXml ? "Preparando descarga..." : "Guardar XML"}
                      </span>
                    </button>
                    <p>
                      Usa esta opcion para guardar una copia local desde el navegador.
                    </p>
                  </div>

                  <FormError message={xmlDownloadError} />
                </section>
              ) : null}
            </section>
          ) : null}

          <button className="primary-button" disabled={isUploading} type="submit">
            <Upload aria-hidden="true" size={18} strokeWidth={2} />
            <span>{isUploading ? "Cargando..." : `Cargar informe de ${kind}`}</span>
          </button>
        </form>
      </section>
    </div>
  );
}
