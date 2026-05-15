import { database } from "../config/database.js";
import type {
  ReportUploadListItem,
  UserUploadDashboard
} from "../models/report.js";

export const listReportUploads = async (): Promise<ReportUploadListItem[]> => {
  const result = await database.query<ReportUploadListItem>(
    `SELECT
      ru.id,
      ru.report_type,
      ru.file_name,
      ru.company_id,
      c.name AS company_name,
      ru.uploaded_by_user_id,
      u.email AS uploaded_by_email,
      ru.uploaded_at,
      ru.mes_afectacion,
      ru.anio_afectacion,
      ru.tipo_actividad,
      ru.rows_inserted,
      ru.fields_inserted,
      xml.id AS xml_export_id,
      xml.file_name AS xml_file_name,
      xml.file_path AS xml_file_path,
      xml.created_at AS xml_created_at,
      xml.rows_exported AS xml_rows_exported
    FROM report_uploads ru
    INNER JOIN companies c ON c.id = ru.company_id
    INNER JOIN users u ON u.id = ru.uploaded_by_user_id
    LEFT JOIN LATERAL (
      SELECT id, file_name, file_path, created_at, rows_exported
      FROM credit_xml_exports
      WHERE report_upload_id = ru.id
      ORDER BY created_at DESC
      LIMIT 1
    ) xml ON true
    ORDER BY ru.uploaded_at DESC`
  );

  return result.rows;
};

export const getUserUploadDashboard = async (
  userId: string
): Promise<UserUploadDashboard> => {
  const result = await database.query<UserUploadDashboard>(
    `WITH summary AS (
      SELECT
        COUNT(*)::int AS total_uploads,
        COALESCE(SUM(rows_inserted), 0)::int AS total_rows_inserted
      FROM report_uploads
      WHERE uploaded_by_user_id = $1
    ),
    last_upload AS (
      SELECT
        ru.uploaded_at AS last_upload_at,
        ru.report_type AS last_report_type,
        ru.file_name AS last_file_name,
        c.name AS last_company_name,
        ru.rows_inserted AS last_rows_inserted
      FROM report_uploads ru
      INNER JOIN companies c ON c.id = ru.company_id
      WHERE ru.uploaded_by_user_id = $1
      ORDER BY ru.uploaded_at DESC
      LIMIT 1
    )
    SELECT
      summary.total_uploads,
      summary.total_rows_inserted,
      last_upload.last_upload_at,
      last_upload.last_report_type,
      last_upload.last_file_name,
      last_upload.last_company_name,
      last_upload.last_rows_inserted
    FROM summary
    LEFT JOIN last_upload ON true`,
    [userId]
  );

  return result.rows[0];
};
