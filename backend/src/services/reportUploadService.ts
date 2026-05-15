import { database } from "../config/database.js";
import type {
  ReportDashboardMetrics,
  ReportDashboardSummary,
  ReportUploadListItem,
  ReportTypeMetric,
  TopUploadUser,
  UploadsByDateMetric,
  UserUploadDashboard
} from "../models/report.js";

type ReportAccessScope = {
  userId: string;
  role: string;
};

const isAdminScope = (scope: ReportAccessScope) => scope.role === "admin";

const reportUploadListSelect = `
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
`;

const reportUploadListJoins = `
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
`;

export const listReportUploads = async (
  scope: ReportAccessScope
): Promise<ReportUploadListItem[]> => {
  const result = await database.query<ReportUploadListItem>(
    `SELECT
      ${reportUploadListSelect}
    ${reportUploadListJoins}
    WHERE ($1::boolean OR ru.uploaded_by_user_id = $2)
    ORDER BY ru.uploaded_at DESC`,
    [isAdminScope(scope), scope.userId]
  );

  return result.rows;
};

export const getReportDashboardMetrics =
  async (scope: ReportAccessScope): Promise<ReportDashboardMetrics> => {
    const params = [isAdminScope(scope), scope.userId];
    const [
      summaryResult,
      byReportTypeResult,
      topUsersResult,
      latestUploadsResult,
      uploadsByDateResult
    ] = await Promise.all([
      database.query<ReportDashboardSummary>(
        `SELECT
          COUNT(*)::int AS total_uploads,
          COALESCE(SUM(rows_inserted), 0)::int AS total_rows_inserted,
          (
            SELECT COUNT(*)::int
            FROM credit_xml_exports cxe
            INNER JOIN report_uploads ru_xml ON ru_xml.id = cxe.report_upload_id
            WHERE ($1::boolean OR ru_xml.uploaded_by_user_id = $2)
          ) AS total_xml_exports,
          MAX(uploaded_at) AS last_upload_at
        FROM report_uploads
        WHERE ($1::boolean OR uploaded_by_user_id = $2)`,
        params
      ),
      database.query<ReportTypeMetric>(
        `WITH report_types(report_type, sort_order) AS (
          VALUES
            ('creditos', 1),
            ('ventas', 2),
            ('arrendamientos', 3)
        )
        SELECT
          rt.report_type,
          COUNT(ru.id)::int AS total_uploads,
          COALESCE(SUM(ru.rows_inserted), 0)::int AS total_rows_inserted,
          (
            SELECT COUNT(*)::int
            FROM credit_xml_exports cxe
            INNER JOIN report_uploads ru_xml ON ru_xml.id = cxe.report_upload_id
            WHERE ru_xml.report_type = rt.report_type
              AND ($1::boolean OR ru_xml.uploaded_by_user_id = $2)
          ) AS total_xml_exports,
          MAX(ru.uploaded_at) AS last_upload_at
        FROM report_types rt
        LEFT JOIN report_uploads ru
          ON ru.report_type = rt.report_type
          AND ($1::boolean OR ru.uploaded_by_user_id = $2)
        GROUP BY rt.report_type, rt.sort_order
        ORDER BY rt.sort_order`,
        params
      ),
      database.query<TopUploadUser>(
        `SELECT
          u.id AS user_id,
          u.email,
          COUNT(ru.id)::int AS total_uploads,
          COALESCE(SUM(ru.rows_inserted), 0)::int AS total_rows_inserted,
          MAX(ru.uploaded_at) AS last_upload_at
        FROM report_uploads ru
        INNER JOIN users u ON u.id = ru.uploaded_by_user_id
        WHERE ($1::boolean OR ru.uploaded_by_user_id = $2)
        GROUP BY u.id, u.email
        ORDER BY total_uploads DESC, total_rows_inserted DESC, last_upload_at DESC
        LIMIT 5`,
        params
      ),
      database.query<ReportUploadListItem>(
        `SELECT
          ${reportUploadListSelect}
        ${reportUploadListJoins}
        WHERE ($1::boolean OR ru.uploaded_by_user_id = $2)
        ORDER BY ru.uploaded_at DESC
        LIMIT 8`,
        params
      ),
      database.query<UploadsByDateMetric>(
        `SELECT
          TO_CHAR(uploaded_at::date, 'YYYY-MM-DD') AS upload_date,
          COUNT(*)::int AS total_uploads,
          COALESCE(SUM(rows_inserted), 0)::int AS total_rows_inserted
        FROM report_uploads
        WHERE ($1::boolean OR uploaded_by_user_id = $2)
        GROUP BY uploaded_at::date
        ORDER BY uploaded_at::date DESC
        LIMIT 10`,
        params
      )
    ]);

    return {
      summary: summaryResult.rows[0] ?? {
        total_uploads: 0,
        total_rows_inserted: 0,
        total_xml_exports: 0,
        last_upload_at: null
      },
      by_report_type: byReportTypeResult.rows,
      top_users: topUsersResult.rows,
      latest_uploads: latestUploadsResult.rows,
      uploads_by_date: uploadsByDateResult.rows
    };
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
