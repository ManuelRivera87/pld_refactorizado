import { http } from "./http";

export type CreditReportUploadSummary = {
  uploadId: string;
  reportType: "creditos";
  fileName: string;
  companyId: string;
  companyName: string;
  uploadedByUserId: string;
  uploadedAt: string;
  mesAfectacion: number;
  anioAfectacion: number;
  tipoActividad: "MPC";
  rowsInserted: number;
  fieldsInserted: number;
  insertedFields: Array<{
    header: string;
    column: string;
  }>;
};

export type CreditXmlExportSummary = {
  id: string;
  uploadId: string;
  companyId: string;
  companyName: string;
  generatedByUserId: string;
  fileName: string;
  filePath: string;
  createdAt: string;
  mesAfectacion: number;
  anioAfectacion: number;
  tipoActividad: "MPC";
  rowsExported: number;
  xlsHeaders: string[];
};

export type ReportUploadItem = {
  id: string;
  report_type: string;
  file_name: string;
  company_id: string;
  company_name: string;
  uploaded_by_user_id: string;
  uploaded_by_email: string;
  uploaded_at: string;
  mes_afectacion: number | null;
  anio_afectacion: number | null;
  tipo_actividad: string;
  rows_inserted: number;
  fields_inserted: number;
  xml_export_id: string | null;
  xml_file_name: string | null;
  xml_file_path: string | null;
  xml_created_at: string | null;
  xml_rows_exported: number | null;
};

export type MyUploadDashboard = {
  total_uploads: number;
  total_rows_inserted: number;
  last_upload_at: string | null;
  last_report_type: string | null;
  last_file_name: string | null;
  last_company_name: string | null;
  last_rows_inserted: number | null;
};

export type CreditReportValidationError = {
  rowNumber: number;
  field: string;
  column: string;
  message: string;
  value: unknown;
};

export const uploadCreditReportRequest = async (payload: {
  companyId: string;
  mesAfectacion: string;
  anioAfectacion: string;
  file: File;
}) => {
  const formData = new FormData();
  formData.append("companyId", payload.companyId);
  formData.append("mesAfectacion", payload.mesAfectacion);
  formData.append("anioAfectacion", payload.anioAfectacion);
  formData.append("file", payload.file);

  const { data } = await http.post<{ summary: CreditReportUploadSummary }>(
    "/informes/creditos/cargar",
    formData
  );

  return data.summary;
};

export const generateCreditXmlRequest = async (uploadId: string) => {
  const { data } = await http.post<{ summary: CreditXmlExportSummary }>(
    `/informes/creditos/${uploadId}/xml`
  );

  return data.summary;
};

export const downloadCreditXmlRequest = async (xmlExportId: string) => {
  const response = await http.get<Blob>(
    `/informes/creditos/xml/${xmlExportId}/download`,
    {
      responseType: "blob"
    }
  );

  return response.data;
};

export const listReportUploadsRequest = async () => {
  const { data } = await http.get<{ uploads: ReportUploadItem[] }>(
    "/informes/cargas"
  );

  return data.uploads;
};

export const getMyUploadDashboardRequest = async () => {
  const { data } = await http.get<{ dashboard: MyUploadDashboard }>(
    "/informes/mis-cargas/resumen"
  );

  return data.dashboard;
};
