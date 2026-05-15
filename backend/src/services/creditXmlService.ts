import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { database } from "../config/database.js";
import type { CreditXmlExportSummary } from "../models/report.js";
import { HttpError } from "../utils/httpError.js";
import { creditReportColumns, type CreditReportColumn } from "./creditReportMapping.js";
import { salesReportColumns } from "./salesReportMapping.js";

type CreditUploadRecord = {
  id: string;
  file_name: string;
  company_id: string;
  company_name: string;
  mes_afectacion: number;
  anio_afectacion: number;
  tipo_actividad: string;
};

type CreditReportRow = Record<string, Date | number | string | null>;

type CreditXmlExportRecord = {
  id: string;
  file_name: string;
  file_path: string;
  created_at: Date;
  rows_exported: number;
};

type CreditXmlDownloadRecord = {
  id: string;
  file_name: string;
  xml_content: string;
};

type CreditXmlAccessScope = {
  userId: string;
  role: string;
};

type XmlReportConfig = {
  columns: CreditReportColumn[];
  notFoundMessage: string;
  operationKind: "credit" | "sales";
  registryTable: "informe_credito_registros" | "informe_venta_registros";
  reportType: "creditos" | "ventas";
  schemaFileName: "mpc.xsd" | "veh.xsd";
  namespace: string;
  xmlExportTable: "credit_xml_exports" | "sales_xml_exports";
  xmlFilePrefix: "MPC" | "VEH";
  xmlRelativeDirectory: "upload/xmlcredito" | "upload/xmlventa";
};

const creditXmlConfig: XmlReportConfig = {
  columns: creditReportColumns,
  notFoundMessage: "Carga de creditos no encontrada",
  operationKind: "credit",
  registryTable: "informe_credito_registros",
  reportType: "creditos",
  schemaFileName: "mpc.xsd",
  namespace: "http://www.uif.shcp.gob.mx/recepcion/mpc",
  xmlExportTable: "credit_xml_exports",
  xmlFilePrefix: "MPC",
  xmlRelativeDirectory: "upload/xmlcredito"
};

const salesXmlConfig: XmlReportConfig = {
  columns: salesReportColumns,
  notFoundMessage: "Carga de ventas no encontrada",
  operationKind: "sales",
  registryTable: "informe_venta_registros",
  reportType: "ventas",
  schemaFileName: "veh.xsd",
  namespace: "http://www.uif.shcp.gob.mx/recepcion/veh",
  xmlExportTable: "sales_xml_exports",
  xmlFilePrefix: "VEH",
  xmlRelativeDirectory: "upload/xmlventa"
};

const buildSelectReportColumns = (config: XmlReportConfig) =>
  config.columns.map(({ column }) => `icr.${column}`).join(",\n      ");

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

const normalizeXmlText = (value: unknown) => {
  const protectedText = String(value ?? "")
    .trim()
    .replaceAll("Ñ", "__ENIE_UPPER__")
    .replaceAll("ñ", "__ENIE_LOWER__");

  return protectedText
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replaceAll("__ENIE_UPPER__", "Ñ")
    .replaceAll("__ENIE_LOWER__", "ñ")
    .replace(/[(),]/g, "")
    .toUpperCase();
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

const hasAny = (row: CreditReportRow, columns: string[]) =>
  columns.some((column) => !isBlank(row[column]));

const appendRepresentanteApoderado = (xml: XmlBuilder, row: CreditReportRow) => {
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

const appendApoderadoDelegado = (xml: XmlBuilder, row: CreditReportRow) => {
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

const appendPersonaAviso = (xml: XmlBuilder, row: CreditReportRow) => {
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

const appendDomicilioAviso = (xml: XmlBuilder, row: CreditReportRow) => {
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

const appendTelefonoAviso = (xml: XmlBuilder, row: CreditReportRow) => {
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

const appendBeneficiario = (xml: XmlBuilder, row: CreditReportRow) => {
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
    appendTag(xml, "pais", row.pais_moral_beneficiario);
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

const appendDatosBienMutuo = (xml: XmlBuilder, row: CreditReportRow) => {
  const inmuebleColumns = [
    "tipo_inmueble",
    "valor_avaluo_catastral",
    "codigo_postal_ubicacion",
    "folio_real"
  ];
  const hasInmueble = hasAny(row, inmuebleColumns);
  const hasOtro = !isBlank(row.descripcion_garantia);

  if (!hasInmueble && !hasOtro) {
    return;
  }

  xml.open("datos_bien_mutuo");

  if (hasInmueble) {
    xml.open("datos_inmueble");
    appendTag(xml, "tipo_inmueble", row.tipo_inmueble, "integer");
    appendTag(xml, "valor_referencia", row.valor_avaluo_catastral, "amount");
    appendTag(xml, "codigo_postal", row.codigo_postal_ubicacion);
    appendTag(xml, "folio_real", row.folio_real);
    xml.close("datos_inmueble");
  }

  if (hasOtro) {
    xml.open("datos_otro");
    appendTag(xml, "descripcion_garantia", row.descripcion_garantia);
    xml.close("datos_otro");
  }

  xml.close("datos_bien_mutuo");
};

const appendPersonaGarante = (xml: XmlBuilder, row: CreditReportRow) => {
  const tipoPersona = toNumber(row.tipo_persona);

  if (!tipoPersona) {
    return;
  }

  xml.open("tipo_persona");

  if (tipoPersona === 1) {
    xml.open("persona_fisica");
    appendTag(xml, "nombre", row.nombre);
    appendTag(xml, "apellido_paterno", row.apellido_paterno);
    appendTag(xml, "apellido_materno", row.apellido_materno);
    appendTag(xml, "fecha_nacimiento", row.fecha_nacimiento, "date");
    appendTag(xml, "rfc", row.rfc_garante);
    appendTag(xml, "curp", row.curp_garante);
    xml.close("persona_fisica");
  }

  if (tipoPersona === 2) {
    xml.open("persona_moral");
    appendTag(xml, "denominacion_razon", row.denominacion_razon_moral_garante);
    appendTag(xml, "fecha_constitucion", row.fecha_constitucion_moral_garante, "date");
    appendTag(xml, "rfc", row.rfc_moral_garante);
    xml.close("persona_moral");
  }

  if (tipoPersona === 3) {
    xml.open("fideicomiso");
    appendTag(xml, "denominacion_razon", row.denominacion_razon_fide_garante);
    appendTag(xml, "rfc", row.rfc_fide_garante);
    appendTag(
      xml,
      "identificador_fideicomiso",
      row.identificador_fideicomiso_fide_garante
    );
    xml.close("fideicomiso");
  }

  xml.close("tipo_persona");
};

const appendDatosGarantia = (xml: XmlBuilder, row: CreditReportRow) => {
  const columns = [
    "tipo_garantia",
    "tipo_inmueble",
    "valor_avaluo_catastral",
    "codigo_postal_ubicacion",
    "folio_real",
    "descripcion_garantia",
    "tipo_persona"
  ];

  if (!hasAny(row, columns)) {
    return;
  }

  xml.open("datos_garantia");
  appendTag(xml, "tipo_garantia", row.tipo_garantia, "integer");
  appendDatosBienMutuo(xml, row);
  appendPersonaGarante(xml, row);
  xml.close("datos_garantia");
};

const appendDatosLiquidacion = (xml: XmlBuilder, row: CreditReportRow) => {
  const columns = ["fecha_pago", "instrumento_monetario", "moneda", "monto_operacion"];

  if (!hasAny(row, columns)) {
    return;
  }

  xml.open("datos_liquidacion");
  appendTag(xml, "fecha_disposicion", row.fecha_pago, "date");
  appendTag(xml, "instrumento_monetario", row.instrumento_monetario, "integer");
  appendTag(xml, "moneda", row.moneda, "integer");
  appendTag(xml, "monto_operacion", row.monto_operacion, "amount");
  xml.close("datos_liquidacion");
};

const appendCreditDetalleOperaciones = (xml: XmlBuilder, row: CreditReportRow) => {
  xml.open("detalle_operaciones");
  xml.open("datos_operacion");
  appendTag(xml, "fecha_operacion", row.fecha, "date");
  appendTag(xml, "codigo_postal", row.codigo_postal_agencia);
  appendTag(xml, "nombre_sucursal", row.nombre_sucursal);
  appendTag(xml, "tipo_operacion", row.tipo_operacion, "integer");
  appendDatosGarantia(xml, row);
  appendDatosLiquidacion(xml, row);
  xml.close("datos_operacion");
  xml.close("detalle_operaciones");
};

const appendSalesDatosVehiculo = (xml: XmlBuilder, row: CreditReportRow) => {
  const columns = ["marca_fabricante", "modelo", "anio_vehiculo", "vin", "repuve", "placas"];

  if (!hasAny(row, columns)) {
    return;
  }

  xml.open("tipo_vehiculo");
  xml.open("datos_vehiculo_terrestre");
  appendTag(xml, "marca_fabricante", row.marca_fabricante);
  appendTag(xml, "modelo", row.modelo);
  appendTag(xml, "anio", row.anio_vehiculo, "integer");
  appendTag(xml, "vin", row.vin);
  appendTag(xml, "repuve", row.repuve);
  appendTag(xml, "placas", row.placas);
  xml.close("datos_vehiculo_terrestre");
  xml.close("tipo_vehiculo");
};

const appendSalesDatosLiquidacion = (xml: XmlBuilder, row: CreditReportRow) => {
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

  xml.open("datos_liquidacion");
  appendTag(xml, "fecha_pago", row.fecha_pago, "date");
  appendTag(xml, "forma_pago", row.forma_pago, "integer");
  appendTag(xml, "instrumento_monetario", row.instrumento_monetario, "integer");
  appendTag(xml, "moneda", row.moneda, "integer");
  appendTag(xml, "monto_operacion", row.monto_operacion, "amount");
  xml.close("datos_liquidacion");
};

const appendSalesDetalleOperaciones = (xml: XmlBuilder, row: CreditReportRow) => {
  xml.open("detalle_operaciones");
  xml.open("datos_operacion");
  appendTag(xml, "fecha_operacion", row.fecha, "date");
  appendTag(xml, "codigo_postal", row.codigo_postal_agencia);
  appendTag(xml, "tipo_operacion", row.tipo_operacion, "integer");
  appendSalesDatosVehiculo(xml, row);
  appendSalesDatosLiquidacion(xml, row);
  xml.close("datos_operacion");
  xml.close("detalle_operaciones");
};

const appendDetalleOperaciones = (
  xml: XmlBuilder,
  row: CreditReportRow,
  config: XmlReportConfig
) => {
  if (config.operationKind === "sales") {
    appendSalesDetalleOperaciones(xml, row);
    return;
  }

  appendCreditDetalleOperaciones(xml, row);
};

const buildReferenceAviso = (row: CreditReportRow) => {
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

const appendAviso = (xml: XmlBuilder, row: CreditReportRow, config: XmlReportConfig) => {
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
  appendDetalleOperaciones(xml, row, config);
  xml.close("aviso");
};

const buildCreditXml = (
  upload: CreditUploadRecord,
  rows: CreditReportRow[],
  config: XmlReportConfig
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

  rows.forEach((row) => appendAviso(xml, row, config));

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

const buildXlsHeadersPayload = (config: XmlReportConfig) => ({
  headers: config.columns.map(({ header }) => header),
  mapping: config.columns.map(({ column, header, type }) => ({
    header,
    column,
    type
  })),
  generatedFields: ["uploaded_by_user_id", "company_id", "uploaded_at"]
});

const generateXml = async (
  config: XmlReportConfig,
  uploadId: string,
  generatedByUserId: string,
  generatedByUserRole: string
): Promise<CreditXmlExportSummary> => {
  const canAccessAllUploads = generatedByUserRole === "admin";
  const uploadResult = await database.query<CreditUploadRecord>(
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
    [uploadId, config.reportType, canAccessAllUploads, generatedByUserId]
  );

  const upload = uploadResult.rows[0];

  if (!upload) {
    throw new HttpError(404, config.notFoundMessage);
  }

  const rowsResult = await database.query<CreditReportRow>(
    `SELECT
      ${buildSelectReportColumns(config)}
    FROM ${config.registryTable} icr
    WHERE icr.report_upload_id = $1
    ORDER BY icr.referencia_aviso NULLS LAST, icr.fecha NULLS LAST, icr.id`,
    [uploadId]
  );

  if (rowsResult.rowCount === 0) {
    throw new HttpError(400, "La carga no tiene registros para generar XML");
  }

  const createdAt = new Date();
  const xmlContent = buildCreditXml(upload, rowsResult.rows, config);
  const fileName = `${config.xmlFilePrefix}_${upload.anio_afectacion}${pad(
    upload.mes_afectacion
  )}_${formatFileTimestamp(createdAt)}_${sanitizeFileSegment(upload.company_name)}.xml`;
  const relativePath = `${config.xmlRelativeDirectory}/${fileName}`;
  const xmlDirectory = path.join(process.cwd(), ...config.xmlRelativeDirectory.split("/"));
  const absolutePath = path.join(xmlDirectory, fileName);

  await mkdir(xmlDirectory, { recursive: true });
  await writeFile(absolutePath, xmlContent, "utf8");

  const insertResult = await database.query<CreditXmlExportRecord>(
    `INSERT INTO ${config.xmlExportTable} (
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
      JSON.stringify(buildXlsHeadersPayload(config)),
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
    tipoActividad: config.xmlFilePrefix,
    rowsExported: exportRecord.rows_exported,
    xlsHeaders: config.columns.map(({ header }) => header)
  };
};

export const generateCreditXml = (
  uploadId: string,
  generatedByUserId: string,
  generatedByUserRole: string
) => generateXml(creditXmlConfig, uploadId, generatedByUserId, generatedByUserRole);

export const generateSalesXml = (
  uploadId: string,
  generatedByUserId: string,
  generatedByUserRole: string
) => generateXml(salesXmlConfig, uploadId, generatedByUserId, generatedByUserRole);

const getXmlExportForDownload = async (
  config: XmlReportConfig,
  xmlExportId: string,
  scope: CreditXmlAccessScope
) => {
  const result = await database.query<CreditXmlDownloadRecord>(
    `SELECT cxe.id, cxe.file_name, cxe.xml_content
    FROM ${config.xmlExportTable} cxe
    INNER JOIN report_uploads ru ON ru.id = cxe.report_upload_id
    WHERE cxe.id = $1
      AND ($2::boolean OR ru.uploaded_by_user_id = $3)`,
    [xmlExportId, scope.role === "admin", scope.userId]
  );
  const xmlExport = result.rows[0];

  if (!xmlExport) {
    throw new HttpError(
      404,
      config.reportType === "ventas"
        ? "XML de ventas no encontrado"
        : "XML de creditos no encontrado"
    );
  }

  return {
    id: xmlExport.id,
    fileName: xmlExport.file_name,
    xmlContent: xmlExport.xml_content
  };
};

export const getCreditXmlExportForDownload = (
  xmlExportId: string,
  scope: CreditXmlAccessScope
) => getXmlExportForDownload(creditXmlConfig, xmlExportId, scope);

export const getSalesXmlExportForDownload = (
  xmlExportId: string,
  scope: CreditXmlAccessScope
) => getXmlExportForDownload(salesXmlConfig, xmlExportId, scope);
