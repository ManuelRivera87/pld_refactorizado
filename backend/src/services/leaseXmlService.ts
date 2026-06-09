import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { database } from "../config/database.js";
import type { CreditXmlExportSummary } from "../models/report.js";
import { HttpError } from "../utils/httpError.js";
import type { CreditReportColumn } from "./creditReportMapping.js";
import { leaseReportColumns } from "./leaseReportMapping.js";

type LeaseUploadRecord = {
  id: string;
  file_name: string;
  company_id: string;
  company_name: string;
  mes_afectacion: number;
  anio_afectacion: number;
  tipo_actividad: string;
};

type LeaseReportRow = Record<string, Date | number | string | null>;

type LeaseXmlExportRecord = {
  id: string;
  file_name: string;
  file_path: string;
  created_at: Date;
  rows_exported: number;
};

type LeaseXmlDownloadRecord = {
  id: string;
  file_name: string;
  xml_content: string;
};

type LeaseXmlAccessScope = {
  userId: string;
  role: string;
};

type LeaseXmlConfig = {
  columns: CreditReportColumn[];
  notFoundMessage: string;
  registryTable: "informe_arrendamiento_registros";
  reportType: "arrendamientos";
  schemaFileName: "ari.xsd";
  namespace: "http://www.uif.shcp.gob.mx/recepcion/ari";
  xmlExportTable: "arrend_xml_exports";
  xmlFilePrefix: "ARI";
  xmlRelativeDirectory: "upload/xmlarrendamiento";
};

const leaseXmlConfig: LeaseXmlConfig = {
  columns: leaseReportColumns,
  notFoundMessage: "Carga de arrendamientos no encontrada",
  registryTable: "informe_arrendamiento_registros",
  reportType: "arrendamientos",
  schemaFileName: "ari.xsd",
  namespace: "http://www.uif.shcp.gob.mx/recepcion/ari",
  xmlExportTable: "arrend_xml_exports",
  xmlFilePrefix: "ARI",
  xmlRelativeDirectory: "upload/xmlarrendamiento"
};

const buildSelectReportColumns = (config: LeaseXmlConfig) =>
  config.columns.map(({ column }) => `iar.${column}`).join(",\n      ");

const isBlank = (value: unknown) =>
  value === null || value === undefined || (typeof value === "string" && !value.trim());

const toNumber = (value: unknown) => {
  if (isBlank(value)) {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? Math.trunc(numberValue) : null;
};

const pad = (value: number) => String(value).padStart(2, "0");

const normalizeXmlText = (value: unknown) => {
  const protectedText = String(value ?? "")
    .trim()
    .replaceAll("Ã‘", "__ENIE_UPPER__")
    .replaceAll("Ã±", "__ENIE_LOWER__");

  return protectedText
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("__ENIE_UPPER__", "Ã‘")
    .replaceAll("__ENIE_LOWER__", "Ã±")
    .replace(/[(),]/g, "")
    .toUpperCase();
};

const formatDate = (value: unknown) => {
  if (value instanceof Date) {
    return `${value.getUTCFullYear()}${pad(value.getUTCMonth() + 1)}${pad(
      value.getUTCDate()
    )}`;
  }

  const text = String(value ?? "").trim();

  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10).replaceAll("-", "");
  }

  if (/^\d{8}$/.test(text)) {
    return text;
  }

  return normalizeXmlText(text);
};

const formatAmount = (value: unknown) => {
  const numberValue = Number(String(value ?? "").replaceAll(",", ""));

  if (!Number.isFinite(numberValue)) {
    return normalizeXmlText(value);
  }

  return numberValue.toFixed(2);
};

const formatInteger = (value: unknown) => {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return normalizeXmlText(value);
  }

  return String(Math.trunc(numberValue));
};

const escapeXml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

type XmlValueFormat = "text" | "date" | "amount" | "integer";

const formatXmlValue = (value: unknown, format: XmlValueFormat) => {
  if (format === "date") {
    return formatDate(value);
  }

  if (format === "amount") {
    return formatAmount(value);
  }

  if (format === "integer") {
    return formatInteger(value);
  }

  return normalizeXmlText(value);
};

class XmlBuilder {
  private readonly lines: string[] = ['<?xml version="1.0" encoding="UTF-8"?>'];
  private level = 0;

  open(name: string, attributes?: Record<string, string>) {
    const attrs = attributes
      ? ` ${Object.entries(attributes)
          .map(([key, value]) => `${key}="${escapeXml(value)}"`)
          .join(" ")}`
      : "";

    this.lines.push(`${this.indent()}<${name}${attrs}>`);
    this.level += 1;
  }

  close(name: string) {
    this.level -= 1;
    this.lines.push(`${this.indent()}</${name}>`);
  }

  tag(name: string, value: string) {
    this.lines.push(`${this.indent()}<${name}>${escapeXml(value)}</${name}>`);
  }

  toString() {
    return `${this.lines.join("\n")}\n`;
  }

  private indent() {
    return "  ".repeat(this.level);
  }
}

const appendTag = (
  xml: XmlBuilder,
  name: string,
  value: unknown,
  format: XmlValueFormat = "text"
) => {
  if (isBlank(value)) {
    return;
  }

  xml.tag(name, formatXmlValue(value, format));
};

const hasAny = (row: LeaseReportRow, columns: string[]) =>
  columns.some((column) => !isBlank(row[column]));

const appendRepresentanteApoderado = (xml: XmlBuilder, row: LeaseReportRow) => {
  const columns = [
    "nombre_representante_apoderado",
    "ape_paterno_representantee_aapoderado",
    "ape_materno_representante_apoderado",
    "fecha_nacimiento_representante_aapoderado",
    "rfc_representante_apoderado",
    "curp_representante_aapoderado"
  ];

  if (!hasAny(row, columns)) {
    return;
  }

  xml.open("representante_apoderado");
  appendTag(xml, "nombre", row.nombre_representante_apoderado);
  appendTag(xml, "apellido_paterno", row.ape_paterno_representantee_aapoderado);
  appendTag(xml, "apellido_materno", row.ape_materno_representante_apoderado);
  appendTag(xml, "fecha_nacimiento", row.fecha_nacimiento_representante_aapoderado, "date");
  appendTag(xml, "rfc", row.rfc_representante_apoderado);
  appendTag(xml, "curp", row.curp_representante_aapoderado);
  xml.close("representante_apoderado");
};

const appendApoderadoDelegado = (xml: XmlBuilder, row: LeaseReportRow) => {
  const columns = [
    "nombre_apoderado_delegado",
    "ape_paterno_apoderado_delegado",
    "ape_materno_apoderado_delegado",
    "fecha_nacimiento_apoderado_delegado",
    "rfc_aapoderado_delegado",
    "curp_apoderado_delegado"
  ];

  if (!hasAny(row, columns)) {
    return;
  }

  xml.open("apoderado_delegado");
  appendTag(xml, "nombre", row.nombre_apoderado_delegado);
  appendTag(xml, "apellido_paterno", row.ape_paterno_apoderado_delegado);
  appendTag(xml, "apellido_materno", row.ape_materno_apoderado_delegado);
  appendTag(xml, "fecha_nacimiento", row.fecha_nacimiento_apoderado_delegado, "date");
  appendTag(xml, "rfc", row.rfc_aapoderado_delegado);
  appendTag(xml, "curp", row.curp_apoderado_delegado);
  xml.close("apoderado_delegado");
};

const appendDomicilioAviso = (xml: XmlBuilder, row: LeaseReportRow) => {
  const tipoDomicilio = toNumber(row.tipo_domicilio_aviso);

  if (!tipoDomicilio) {
    return;
  }

  xml.open("tipo_domicilio");

  if (tipoDomicilio === 1) {
    xml.open("nacional");
    appendTag(xml, "colonia", row.colonia_aviso_nacional);
    appendTag(xml, "calle", row.calle_aviso_nacional);
    appendTag(xml, "numero_exterior", row.numero_ext_aviso_nacional);
    appendTag(xml, "numero_interior", row.numero_int_aviso_nacional);
    appendTag(xml, "codigo_postal", row.codigo_postal_aviso_nacional);
    xml.close("nacional");
  }

  if (tipoDomicilio === 2) {
    xml.open("extranjero");
    appendTag(xml, "pais", row.pais_aviso_extranjero);
    appendTag(xml, "estado_provincia", row.estadoprovincia_aviso_extranjero);
    appendTag(xml, "ciudad_poblacion", row.ciudad_poblacion_aviso_extranjero);
    appendTag(xml, "colonia", row.colonia_aviso_extranjero);
    appendTag(xml, "calle", row.calle_aviso_extranjero);
    appendTag(xml, "numero_exterior", row.numero_ext_aviso_extranjero);
    appendTag(xml, "numero_interior", row.numero_int_aviso_extranjero);
    appendTag(xml, "codigo_postal", row.codigo_postal_aviso_extranjero);
    xml.close("extranjero");
  }

  xml.close("tipo_domicilio");
};

const appendTelefonoAviso = (xml: XmlBuilder, row: LeaseReportRow) => {
  const columns = [
    "telefono_clave_pais_aviso",
    "numero_telefono_aviso",
    "correo_electronico_aviso"
  ];

  if (!hasAny(row, columns)) {
    return;
  }

  xml.open("telefono");
  appendTag(xml, "clave_pais", row.telefono_clave_pais_aviso);
  appendTag(xml, "numero_telefono", row.numero_telefono_aviso);
  appendTag(xml, "correo_electronico", row.correo_electronico_aviso);
  xml.close("telefono");
};

const appendPersonaAviso = (xml: XmlBuilder, row: LeaseReportRow) => {
  const tipoPersona = toNumber(row.tipo_persona_objeto_aviso);

  if (!tipoPersona) {
    return;
  }

  xml.open("persona_aviso");
  xml.open("tipo_persona");

  if (tipoPersona === 1) {
    xml.open("persona_fisica");
    appendTag(xml, "nombre", row.nombre_objeto_aviso);
    appendTag(xml, "apellido_paterno", row.ape_paterno_objeto_aviso);
    appendTag(xml, "apellido_materno", row.ape_materno_objeto_aviso);
    appendTag(xml, "fecha_nacimiento", row.fecha_nacimiento_objeto_aviso, "date");
    appendTag(xml, "rfc", row.rfc_objeto_aviso);
    appendTag(xml, "curp", row.curp_objeto_aviso);
    appendTag(xml, "pais_nacionalidad", row.pais_nacionalidad_objeto_aviso);
    appendTag(xml, "actividad_economica", row.actividad_economica_objeto_aviso, "integer");
    xml.close("persona_fisica");
  }

  if (tipoPersona === 2) {
    xml.open("persona_moral");
    appendTag(xml, "denominacion_razon", row.denominacion_razon_moral);
    appendTag(xml, "fecha_constitucion", row.fecha_constitucion_moral, "date");
    appendTag(xml, "rfc", row.rfc_moral);
    appendTag(xml, "pais_nacionalidad", row.pais_moral);
    appendTag(xml, "giro_mercantil", row.giro_mercantil_moral, "integer");
    appendRepresentanteApoderado(xml, row);
    xml.close("persona_moral");
  }

  if (tipoPersona === 3) {
    xml.open("fideicomiso");
    appendTag(xml, "denominacion_razon", row.denominacion_razon_fideicomiso);
    appendTag(xml, "rfc", row.rfc_fideicomiso);
    appendTag(xml, "identificador_fideicomiso", row.identificador_fideicomiso);
    appendApoderadoDelegado(xml, row);
    xml.close("fideicomiso");
  }

  xml.close("tipo_persona");
  appendDomicilioAviso(xml, row);
  appendTelefonoAviso(xml, row);
  xml.close("persona_aviso");
};

const appendBeneficiario = (xml: XmlBuilder, row: LeaseReportRow) => {
  const tipoPersona = toNumber(row.tipo_persona_beneficiario);

  if (!tipoPersona) {
    return;
  }

  xml.open("dueno_beneficiario");
  xml.open("tipo_persona");

  if (tipoPersona === 1) {
    xml.open("persona_fisica");
    appendTag(xml, "nombre", row.nombre_beneficiario);
    appendTag(xml, "apellido_paterno", row.ape_paterno_beneficiario);
    appendTag(xml, "apellido_materno", row.ape_materno_beneficiario);
    appendTag(xml, "fecha_nacimiento", row.fecha_nacimiento_beneficiario, "date");
    appendTag(xml, "rfc", row.rfc_beneficiario);
    appendTag(xml, "curp", row.curp_beneficiario);
    appendTag(xml, "pais_nacionalidad", row.pais_nacionalidad_beneficiario);
    xml.close("persona_fisica");
  }

  if (tipoPersona === 2) {
    xml.open("persona_moral");
    appendTag(xml, "denominacion_razon", row.denominacion_razon_moral_beneficiario);
    appendTag(xml, "fecha_constitucion", row.fecha_constitucion_moral_beneficiario, "date");
    appendTag(xml, "rfc", row.rfc_moral_beneficiario);
    appendTag(xml, "pais_nacionalidad", row.pais_moral_beneficiario);
    xml.close("persona_moral");
  }

  if (tipoPersona === 3) {
    xml.open("fideicomiso");
    appendTag(xml, "denominacion_razon", row.denominacion_razon_fideicomiso_beneficiario);
    appendTag(xml, "rfc", row.rfc_fideicomiso_beneficiario);
    appendTag(xml, "identificador_fideicomiso", row.id_fideicomiso_beneficiario);
    xml.close("fideicomiso");
  }

  xml.close("tipo_persona");
  xml.close("dueno_beneficiario");
};

const appendLeaseCaracteristicas = (xml: XmlBuilder, row: LeaseReportRow) => {
  const columns = [
    "fecha_inicio",
    "fecha_termino",
    "tipo_inmueble",
    "valor_avaluo_catastral",
    "colonia_inmueble",
    "calle_inmueble",
    "numero_exterior_inmueble",
    "numero_interior_inmueble",
    "codigo_postal_inmueble",
    "folio_real"
  ];

  if (!hasAny(row, columns)) {
    return;
  }

  xml.open("caracteristicas");
  appendTag(xml, "fecha_inicio", row.fecha_inicio, "date");
  appendTag(xml, "fecha_termino", row.fecha_termino, "date");
  appendTag(xml, "tipo_inmueble", row.tipo_inmueble, "integer");
  appendTag(xml, "valor_referencia", row.valor_avaluo_catastral, "amount");
  appendTag(xml, "colonia", row.colonia_inmueble);
  appendTag(xml, "calle", row.calle_inmueble);
  appendTag(xml, "numero_exterior", row.numero_exterior_inmueble);
  appendTag(xml, "numero_interior", row.numero_interior_inmueble);
  appendTag(xml, "codigo_postal", row.codigo_postal_inmueble);
  appendTag(xml, "folio_real", row.folio_real);
  xml.close("caracteristicas");
};

const appendLeaseDatosLiquidacion = (xml: XmlBuilder, row: LeaseReportRow) => {
  const columns = [
    "fecha_pago",
    "forma_pago",
    "instrumento_monetario",
    "moneda",
    "monto_operacion"
  ];

  if (!hasAny(row, columns)) {
    return;
  }

  const formaPago = toNumber(row.forma_pago);

  xml.open("datos_liquidacion");
  appendTag(xml, "fecha_pago", row.fecha_pago, "date");
  appendTag(xml, "forma_pago", row.forma_pago, "integer");
  if (formaPago !== 3) {
    appendTag(xml, "instrumento_monetario", row.instrumento_monetario, "integer");
  }
  appendTag(xml, "moneda", row.moneda, "integer");
  appendTag(xml, "monto_operacion", row.monto_operacion, "amount");
  xml.close("datos_liquidacion");
};

const appendLeaseDetalleOperaciones = (xml: XmlBuilder, row: LeaseReportRow) => {
  xml.open("detalle_operaciones");
  xml.open("datos_operacion");
  appendTag(xml, "fecha_operacion", row.fecha_operacion, "date");
  appendTag(xml, "tipo_operacion", row.tipo_operacion, "integer");
  appendLeaseCaracteristicas(xml, row);
  appendLeaseDatosLiquidacion(xml, row);
  xml.close("datos_operacion");
  xml.close("detalle_operaciones");
};

const buildReferenceAviso = (row: LeaseReportRow) => {
  if (isBlank(row.referencia_aviso)) {
    return null;
  }

  const reference = normalizeXmlText(row.referencia_aviso);
  const reportMonth = normalizeXmlText(row.mes_reporte);
  const combinedReference = `${reportMonth}${reference}`;

  if (reportMonth && !reference.startsWith(reportMonth) && combinedReference.length <= 14) {
    return combinedReference;
  }

  return reference;
};

const appendAviso = (xml: XmlBuilder, row: LeaseReportRow) => {
  xml.open("aviso");
  appendTag(xml, "referencia_aviso", buildReferenceAviso(row));

  if (hasAny(row, ["folio_modificatorio", "descripcion_mod"])) {
    xml.open("modificatorio");
    appendTag(xml, "folio_modificacion", row.folio_modificatorio);
    appendTag(xml, "descripcion_modificacion", row.descripcion_mod);
    xml.close("modificatorio");
  }

  appendTag(xml, "prioridad", row.prioridad, "integer");

  if (hasAny(row, ["tipo_alerta", "descripcion_alerta"])) {
    xml.open("alerta");
    appendTag(xml, "tipo_alerta", row.tipo_alerta, "integer");
    appendTag(xml, "descripcion_alerta", row.descripcion_alerta);
    xml.close("alerta");
  }

  appendPersonaAviso(xml, row);
  appendBeneficiario(xml, row);
  appendLeaseDetalleOperaciones(xml, row);
  xml.close("aviso");
};

const buildLeaseXml = (
  upload: LeaseUploadRecord,
  rows: LeaseReportRow[],
  config: LeaseXmlConfig
) => {
  const firstRow = rows[0];
  const reportMonth =
    firstRow?.mes_reporte ?? `${upload.anio_afectacion}${pad(upload.mes_afectacion)}`;
  const xml = new XmlBuilder();

  xml.open("archivo", {
    "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
    "xsi:schemaLocation": `${config.namespace} ${config.schemaFileName}`,
    xmlns: config.namespace
  });
  xml.open("informe");
  appendTag(xml, "mes_reportado", reportMonth);
  xml.open("sujeto_obligado");
  appendTag(xml, "clave_sujeto_obligado", firstRow?.clave_sujeto_obligado);
  appendTag(xml, "clave_actividad", config.xmlFilePrefix);
  xml.close("sujeto_obligado");

  rows.forEach((row) => appendAviso(xml, row));

  xml.close("informe");
  xml.close("archivo");

  return xml.toString();
};

const formatFileTimestamp = (date: Date) =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(
    date.getHours()
  )}${pad(date.getMinutes())}${pad(date.getSeconds())}`;

const sanitizeFileSegment = (value: string) =>
  normalizeXmlText(value)
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 70);

const buildXlsHeadersPayload = (config: LeaseXmlConfig) => ({
  headers: config.columns.map(({ header }) => header),
  mapping: config.columns.map(({ column, header, type }) => ({
    header,
    column,
    type
  })),
  generatedFields: ["uploaded_by_user_id", "company_id", "uploaded_at"]
});

export const generateLeaseXml = async (
  uploadId: string,
  generatedByUserId: string,
  generatedByUserRole: string
): Promise<CreditXmlExportSummary> => {
  const canAccessAllUploads = generatedByUserRole === "admin";
  const uploadResult = await database.query<LeaseUploadRecord>(
    `SELECT
      ru.id,
      ru.file_name,
      ru.company_id,
      c.name AS company_name,
      ru.mes_afectacion,
      ru.anio_afectacion,
      ru.tipo_actividad
    FROM report_uploads ru
    INNER JOIN companies c ON c.id = ru.company_id
    WHERE ru.id = $1
      AND ru.report_type = $2
      AND ($3::boolean OR ru.uploaded_by_user_id = $4)`,
    [uploadId, leaseXmlConfig.reportType, canAccessAllUploads, generatedByUserId]
  );

  const upload = uploadResult.rows[0];

  if (!upload) {
    throw new HttpError(404, leaseXmlConfig.notFoundMessage);
  }

  const rowsResult = await database.query<LeaseReportRow>(
    `SELECT
      ${buildSelectReportColumns(leaseXmlConfig)}
    FROM ${leaseXmlConfig.registryTable} iar
    WHERE iar.report_upload_id = $1
    ORDER BY iar.referencia_aviso NULLS LAST, iar.fecha_operacion NULLS LAST, iar.id`,
    [uploadId]
  );

  if (rowsResult.rowCount === 0) {
    throw new HttpError(400, "La carga no tiene registros para generar XML");
  }

  const createdAt = new Date();
  const xmlContent = buildLeaseXml(upload, rowsResult.rows, leaseXmlConfig);
  const fileName = `${leaseXmlConfig.xmlFilePrefix}_${upload.anio_afectacion}${pad(
    upload.mes_afectacion
  )}_${formatFileTimestamp(createdAt)}_${sanitizeFileSegment(upload.company_name)}.xml`;
  const relativePath = `${leaseXmlConfig.xmlRelativeDirectory}/${fileName}`;
  const xmlDirectory = path.join(
    process.cwd(),
    ...leaseXmlConfig.xmlRelativeDirectory.split("/")
  );
  const absolutePath = path.join(xmlDirectory, fileName);

  await mkdir(xmlDirectory, { recursive: true });
  await writeFile(absolutePath, xmlContent, "utf8");

  const insertResult = await database.query<LeaseXmlExportRecord>(
    `INSERT INTO ${leaseXmlConfig.xmlExportTable} (
      report_upload_id,
      company_id,
      generated_by_user_id,
      file_name,
      file_path,
      mes_afectacion,
      anio_afectacion,
      tipo_actividad,
      xls_headers,
      rows_exported,
      xml_content,
      created_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10, $11, $12)
    RETURNING id, file_name, file_path, created_at, rows_exported`,
    [
      upload.id,
      upload.company_id,
      generatedByUserId,
      fileName,
      relativePath,
      upload.mes_afectacion,
      upload.anio_afectacion,
      upload.tipo_actividad,
      JSON.stringify(buildXlsHeadersPayload(leaseXmlConfig)),
      rowsResult.rowCount,
      xmlContent,
      createdAt
    ]
  );

  const exportRecord = insertResult.rows[0];

  return {
    id: exportRecord.id,
    uploadId: upload.id,
    companyId: upload.company_id,
    companyName: upload.company_name,
    generatedByUserId,
    fileName: exportRecord.file_name,
    filePath: exportRecord.file_path,
    createdAt: exportRecord.created_at.toISOString(),
    mesAfectacion: upload.mes_afectacion,
    anioAfectacion: upload.anio_afectacion,
    tipoActividad: leaseXmlConfig.xmlFilePrefix,
    rowsExported: exportRecord.rows_exported,
    xlsHeaders: leaseXmlConfig.columns.map(({ header }) => header)
  };
};

export const getLeaseXmlExportForDownload = async (
  xmlExportId: string,
  scope: LeaseXmlAccessScope
) => {
  const result = await database.query<LeaseXmlDownloadRecord>(
    `SELECT axe.id, axe.file_name, axe.xml_content
    FROM ${leaseXmlConfig.xmlExportTable} axe
    INNER JOIN report_uploads ru ON ru.id = axe.report_upload_id
    WHERE axe.id = $1
      AND ($2::boolean OR ru.uploaded_by_user_id = $3)`,
    [xmlExportId, scope.role === "admin", scope.userId]
  );
  const xmlExport = result.rows[0];

  if (!xmlExport) {
    throw new HttpError(404, "XML de arrendamientos no encontrado");
  }

  return {
    id: xmlExport.id,
    fileName: xmlExport.file_name,
    xmlContent: xmlExport.xml_content
  };
};
