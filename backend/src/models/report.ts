export type CreditReportUploadSummary = {
  uploadId: string;
  reportType: "creditos" | "ventas" | "arrendamientos";
  fileName: string;
  companyId: string;
  companyName: string;
  uploadedByUserId: string;
  uploadedAt: string;
  mesAfectacion: number;
  anioAfectacion: number;
  tipoActividad: "MPC" | "VEH" | "ARI";
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
  tipoActividad: "MPC" | "VEH" | "ARI";
  rowsExported: number;
  xlsHeaders: string[];
};

export type ReportUploadListItem = {
  id: string;
  report_type: string;
  file_name: string;
  company_id: string;
  company_name: string;
  uploaded_by_user_id: string;
  uploaded_by_email: string;
  uploaded_at: Date;
  mes_afectacion: number | null;
  anio_afectacion: number | null;
  tipo_actividad: string;
  rows_inserted: number;
  fields_inserted: number;
  xml_export_id: string | null;
  xml_file_name: string | null;
  xml_file_path: string | null;
  xml_created_at: Date | null;
  xml_rows_exported: number | null;
};

export type ReportTypeMetric = {
  report_type: string;
  total_uploads: number;
  total_rows_inserted: number;
  total_xml_exports: number;
  last_upload_at: Date | null;
};

export type TopUploadUser = {
  user_id: string;
  email: string;
  total_uploads: number;
  total_rows_inserted: number;
  last_upload_at: Date | null;
};

export type UploadsByDateMetric = {
  upload_date: string;
  total_uploads: number;
  total_rows_inserted: number;
};

export type ReportDashboardSummary = {
  total_uploads: number;
  total_rows_inserted: number;
  total_xml_exports: number;
  last_upload_at: Date | null;
};

export type ReportDashboardMetrics = {
  summary: ReportDashboardSummary;
  by_report_type: ReportTypeMetric[];
  top_users: TopUploadUser[];
  latest_uploads: ReportUploadListItem[];
  uploads_by_date: UploadsByDateMetric[];
};

export type UserUploadDashboard = {
  total_uploads: number;
  total_rows_inserted: number;
  last_upload_at: Date | null;
  last_report_type: string | null;
  last_file_name: string | null;
  last_company_name: string | null;
  last_rows_inserted: number | null;
};
