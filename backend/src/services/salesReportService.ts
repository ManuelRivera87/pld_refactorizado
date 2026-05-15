import XLSX from "xlsx";
import { database } from "../config/database.js";
import type { CreditReportUploadSummary } from "../models/report.js";
import { HttpError } from "../utils/httpError.js";
import { getCompanyById } from "./companyService.js";
import type { CreditReportColumn } from "./creditReportMapping.js";
import { salesReportColumns } from "./salesReportMapping.js";
import { validateSalesReportRows } from "./salesReportValidation.js";

type UploadSalesReportInput = {
  file: Express.Multer.File;
  companyId: string;
  uploadedByUserId: string;
  mesAfectacion: string;
  anioAfectacion: string;
};

const tipoActividad = "VEH" as const;
const affectationFields = [
  { header: "MesAfectacion", column: "mes_afectacion" },
  { header: "AnioAfectacion", column: "anio_afectacion" },
  { header: "TipoActividad", column: "tipo_actividad" }
];
const metadataColumns = [
  "report_upload_id",
  "uploaded_by_user_id",
  "company_id",
  "uploaded_at",
  "mes_afectacion",
  "anio_afectacion",
  "tipo_actividad"
];
const insertColumns = [
  ...metadataColumns,
  ...salesReportColumns.map((column) => column.column)
];

const isBlank = (value: unknown) =>
  value === null || value === undefined || (typeof value === "string" && !value.trim());

const excelSerialDateToIso = (value: number) => {
  const date = new Date(Date.UTC(1899, 11, 30));
  date.setUTCDate(date.getUTCDate() + value);

  return date.toISOString().slice(0, 10);
};

const toDateValue = (value: unknown) => {
  if (isBlank(value)) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "number") {
    const asText = String(Math.trunc(value));

    if (/^\d{8}$/.test(asText)) {
      return `${asText.slice(0, 4)}-${asText.slice(4, 6)}-${asText.slice(6, 8)}`;
    }

    return excelSerialDateToIso(value);
  }

  const text = String(value).trim();

  if (/^\d{8}$/.test(text)) {
    return `${text.slice(0, 4)}-${text.slice(4, 6)}-${text.slice(6, 8)}`;
  }

  return text;
};

const toIntegerValue = (value: unknown) => {
  if (isBlank(value)) {
    return null;
  }

  const numeric = Number(value);

  return Number.isFinite(numeric) ? Math.trunc(numeric) : null;
};

const toNumericValue = (value: unknown) => {
  if (isBlank(value)) {
    return null;
  }

  const numeric = Number(String(value).replaceAll(",", ""));

  return Number.isFinite(numeric) ? numeric : null;
};

const toTextValue = (value: unknown) => {
  if (isBlank(value)) {
    return null;
  }

  return String(value).trim();
};

const normalizeCellValue = (value: unknown, column: CreditReportColumn) => {
  if (column.column === "clave_actividad") {
    return tipoActividad;
  }

  if (column.type === "date") {
    return toDateValue(value);
  }

  if (column.type === "integer") {
    return toIntegerValue(value);
  }

  if (column.type === "numeric") {
    return toNumericValue(value);
  }

  return toTextValue(value);
};

const readRows = (buffer: Buffer) => {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: true
  });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new HttpError(400, "The XLS file does not contain sheets");
  }

  const sheet = workbook.Sheets[firstSheetName];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    defval: null,
    blankrows: false,
    raw: true
  });

  if (rows.length < 2) {
    throw new HttpError(400, "The XLS file does not contain report rows");
  }

  return rows;
};

const buildHeaderIndex = (headerRow: unknown[]) => {
  const headerIndex = new Map<string, number>();

  headerRow.forEach((header, index) => {
    if (!isBlank(header)) {
      headerIndex.set(String(header).trim(), index);
    }
  });

  const missingHeaders = salesReportColumns
    .filter((column) => !headerIndex.has(column.header))
    .map((column) => column.header);

  if (missingHeaders.length > 0) {
    throw new HttpError(
      400,
      `The XLS file is missing required headers: ${missingHeaders.join(", ")}`
    );
  }

  return headerIndex;
};

const parseMesAfectacion = (value: string) => {
  const month = Number(value);

  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new HttpError(400, "Mes de afectacion invalido");
  }

  return month;
};

const parseAnioAfectacion = (value: string) => {
  const year = Number(value);

  if (!Number.isInteger(year) || year < 2022 || year > 2025) {
    throw new HttpError(400, "Anio de afectacion invalido");
  }

  return year;
};

export const uploadSalesReport = async ({
  anioAfectacion,
  companyId,
  file,
  mesAfectacion,
  uploadedByUserId
}: UploadSalesReportInput): Promise<CreditReportUploadSummary> => {
  if (!file) {
    throw new HttpError(400, "XLS file is required");
  }

  if (!companyId) {
    throw new HttpError(400, "Company is required");
  }

  const parsedMesAfectacion = parseMesAfectacion(mesAfectacion);
  const parsedAnioAfectacion = parseAnioAfectacion(anioAfectacion);
  const company = await getCompanyById(companyId);
  const rows = readRows(file.buffer);
  const headerIndex = buildHeaderIndex(rows[0]);
  const dataRows = rows.slice(1).filter((row) => row.some((value) => !isBlank(value)));
  const validationErrors = validateSalesReportRows(dataRows, headerIndex);

  if (validationErrors.length > 0) {
    throw new HttpError(
      400,
      `El archivo contiene ${validationErrors.length} errores de validacion`,
      { validationErrors }
    );
  }

  const uploadedAt = new Date();
  const placeholders = insertColumns.map((_, index) => `$${index + 1}`).join(", ");
  const query = `
    INSERT INTO informe_venta_registros (${insertColumns.join(", ")})
    VALUES (${placeholders})
  `;
  const client = await database.connect();

  try {
    await client.query("BEGIN");
    const uploadResult = await client.query<{ id: string }>(
      `INSERT INTO report_uploads (
        report_type,
        file_name,
        company_id,
        uploaded_by_user_id,
        uploaded_at,
        mes_afectacion,
        anio_afectacion,
        tipo_actividad,
        rows_inserted,
        fields_inserted
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id`,
      [
        "ventas",
        file.originalname,
        companyId,
        uploadedByUserId,
        uploadedAt,
        parsedMesAfectacion,
        parsedAnioAfectacion,
        tipoActividad,
        dataRows.length,
        salesReportColumns.length + affectationFields.length
      ]
    );
    const uploadId = uploadResult.rows[0].id;

    for (const row of dataRows) {
      const values = [
        uploadId,
        uploadedByUserId,
        companyId,
        uploadedAt,
        parsedMesAfectacion,
        parsedAnioAfectacion,
        tipoActividad,
        ...salesReportColumns.map((column) =>
          normalizeCellValue(row[headerIndex.get(column.header)!], column)
        )
      ];

      await client.query(query, values);
    }

    await client.query("COMMIT");

    return {
      uploadId,
      reportType: "ventas",
      fileName: file.originalname,
      companyId,
      companyName: company.name,
      uploadedByUserId,
      uploadedAt: uploadedAt.toISOString(),
      mesAfectacion: parsedMesAfectacion,
      anioAfectacion: parsedAnioAfectacion,
      tipoActividad,
      rowsInserted: dataRows.length,
      fieldsInserted: salesReportColumns.length + affectationFields.length,
      insertedFields: [
        ...affectationFields,
        ...salesReportColumns.map(({ column, header }) => ({
          column,
          header
        }))
      ]
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
