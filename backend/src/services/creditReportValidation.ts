import { creditReportColumns } from "./creditReportMapping.js";

export type CreditReportValidationError = {
  rowNumber: number;
  field: string;
  column: string;
  message: string;
  value: unknown;
};

type ValidationKind = "text" | "date" | "amount";

type ValidationRule = {
  pattern: RegExp;
  minLength: number;
  maxLength: number;
  description: string;
  kind?: ValidationKind;
};

type RowContext = {
  row: unknown[];
  rowNumber: number;
  headerIndex: Map<string, number>;
  errors: CreditReportValidationError[];
};

const textLetters = "A-Z\\u00d1\\u00c1\\u00c9\\u00cd\\u00d3\\u00da\\u00dc";
const rfcLetters = "A-Z\\u00d1&";

const createRule = (
  pattern: string,
  minLength: number,
  maxLength: number,
  description: string,
  kind: ValidationKind = "text"
): ValidationRule => ({
  description,
  kind,
  maxLength,
  minLength,
  pattern: new RegExp(`^${pattern}$`, "i")
});

const rules = {
  mesReportado: createRule("\\d{4}[01]\\d", 6, 6, "formato AAAAMM"),
  claveSo: createRule(`[${rfcLetters}]{3,4}\\d{6}[A-Z0-9]{3}`, 12, 13, "RFC de sujeto obligado"),
  alfanumerico3: createRule("[A-Z0-9]{3}", 3, 3, "3 caracteres alfanumericos"),
  referenciaAviso: createRule(`[${textLetters}0-9]{1,14}`, 1, 14, "1 a 14 caracteres alfanumericos"),
  folioModificacion: createRule("\\d{4}-\\d{1,9}", 6, 14, "formato AAAA-folio"),
  descripcion3000: createRule(`[${textLetters}\\d \\-\\.,':/$]{1,3000}`, 1, 3000, "descripcion de 1 a 3000 caracteres"),
  descripcion254: createRule(`[${textLetters}\\d #\\-\\.&,_@']{1,254}`, 1, 254, "descripcion de 1 a 254 caracteres"),
  descripcion40: createRule(`[${textLetters}\\d \\-_\\.&,'#@]{1,40}`, 1, 40, "descripcion de 1 a 40 caracteres"),
  prioridad: createRule("[12]", 1, 1, "valor 1 o 2"),
  tipoAlerta: createRule("\\d{3,4}", 3, 4, "3 o 4 digitos"),
  nombre: createRule(`[${textLetters} ]{1,200}`, 1, 200, "nombre de 1 a 200 letras"),
  fecha: createRule("\\d{8}", 8, 8, "fecha AAAAMMDD", "date"),
  rfcFisica: createRule(`[${rfcLetters}]{4}\\d{6}[A-Z0-9]{3}`, 13, 13, "RFC fisico de 13 caracteres"),
  rfcMoral: createRule(`[${rfcLetters}]{3}\\d{6}[A-Z0-9]{3}`, 12, 13, "RFC moral de 12 caracteres"),
  rfcGenerico: createRule(`[${rfcLetters}]{3,4}\\d{6}[A-Z0-9]{3}`, 12, 13, "RFC de 12 o 13 caracteres"),
  curp: createRule("[A-Z]{4}\\d{6}[MH][A-Z]{5,6}[0-9]{1,2}", 18, 18, "CURP de 18 caracteres"),
  pais: createRule("[A-Z]{2}", 2, 2, "clave de pais de 2 letras"),
  actividadEconomica: createRule("\\d{7}", 7, 7, "actividad economica de 7 digitos"),
  digito1a2: createRule("\\d{1,2}", 1, 2, "1 o 2 digitos"),
  digito1a3: createRule("\\d{1,3}", 1, 3, "1 a 3 digitos"),
  digito3a4: createRule("\\d{3,4}", 3, 4, "3 o 4 digitos"),
  digito7: createRule("\\d{7}", 7, 7, "7 digitos"),
  direccion100: createRule(`[${textLetters}\\d \\.,:/]{1,100}`, 1, 100, "direccion de 1 a 100 caracteres"),
  direccion56: createRule(`[${textLetters}\\d \\.,:/]{1,56}`, 1, 56, "direccion de 1 a 56 caracteres"),
  direccion40: createRule(`[${textLetters}\\d \\.,:/]{1,40}`, 1, 40, "direccion de 1 a 40 caracteres"),
  colonia: createRule(`[${textLetters}\\d \\-\\.,:/()]{1,50}`, 1, 50, "colonia de 1 a 50 caracteres"),
  cp: createRule("\\d{5}", 5, 5, "codigo postal de 5 digitos"),
  cpExtranjero: createRule(`[${textLetters}0-9]{4,12}`, 4, 12, "codigo postal extranjero de 4 a 12 caracteres"),
  telefono: createRule("\\d{10,12}", 10, 12, "telefono de 10 a 12 digitos"),
  correo: createRule("((?:(?:(?:[A-Z0-9][.\\-+_]?)*)[A-Z0-9])+)+@((?:(?:(?:[A-Z0-9][.\\-_]?){0,62})[A-Z0-9])+)+\\.([A-Z0-9]{2,6})", 5, 60, "correo electronico"),
  monto: createRule("\\d{1,14}\\.\\d{2}", 4, 17, "monto con 2 decimales", "amount"),
  folio20: createRule("[A-Z\\d\\-_]{1,20}", 1, 20, "folio de 1 a 20 caracteres")
};

const columnHeaderByColumn = new Map(
  creditReportColumns.map((column) => [column.column, column.header])
);

const isBlank = (value: unknown) =>
  value === null ||
  value === undefined ||
  (typeof value === "string" && value.trim() === "");

const pad = (value: number) => String(value).padStart(2, "0");

const dateToYyyymmdd = (date: Date) =>
  `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;

const excelSerialDateToYyyymmdd = (value: number) => {
  const date = new Date(Date.UTC(1899, 11, 30));
  date.setUTCDate(date.getUTCDate() + value);

  return `${date.getUTCFullYear()}${pad(date.getUTCMonth() + 1)}${pad(date.getUTCDate())}`;
};

const numberToPlainString = (value: number) =>
  Number.isInteger(value) ? String(value) : String(value).replace(/,/g, "");

const normalizeDateText = (text: string) => {
  if (/^\d{8}$/.test(text)) {
    return text;
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text.replaceAll("-", "");
  }

  const slashDate = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

  if (slashDate) {
    return `${slashDate[3]}${pad(Number(slashDate[2]))}${pad(Number(slashDate[1]))}`;
  }

  return text;
};

const normalizeAmountText = (text: string) => {
  const normalized = text.replaceAll(",", "");

  if (/^\d+$/.test(normalized)) {
    return `${normalized}.00`;
  }

  if (/^\d+\.\d$/.test(normalized)) {
    return `${normalized}0`;
  }

  return normalized;
};

const toValidationText = (value: unknown, kind: ValidationKind = "text") => {
  if (isBlank(value)) {
    return "";
  }

  if (value instanceof Date) {
    return dateToYyyymmdd(value);
  }

  if (typeof value === "number") {
    if (kind === "amount") {
      return value.toFixed(2);
    }

    if (kind === "date" && !/^\d{8}$/.test(String(Math.trunc(value)))) {
      return excelSerialDateToYyyymmdd(value);
    }

    return numberToPlainString(value);
  }

  const text = String(value).trim();

  if (kind === "date") {
    return normalizeDateText(text);
  }

  if (kind === "amount") {
    return normalizeAmountText(text);
  }

  return text;
};

const getValue = (context: RowContext, column: string) => {
  const header = columnHeaderByColumn.get(column);
  const index = header ? context.headerIndex.get(header) : undefined;

  return index === undefined ? null : context.row[index];
};

const addError = (
  context: RowContext,
  column: string,
  message: string,
  value: unknown = getValue(context, column)
) => {
  context.errors.push({
    column,
    field: columnHeaderByColumn.get(column) ?? column,
    message,
    rowNumber: context.rowNumber,
    value
  });
};

const validateRule = (
  context: RowContext,
  column: string,
  rule: ValidationRule,
  required = false
) => {
  const value = getValue(context, column);

  if (isBlank(value)) {
    if (required) {
      addError(context, column, "Dato requerido", value);
    }

    return;
  }

  const text = toValidationText(value, rule.kind);

  if (text.length < rule.minLength) {
    addError(context, column, `Longitud minima ${rule.minLength}`, value);
    return;
  }

  if (text.length > rule.maxLength) {
    addError(context, column, `Longitud maxima ${rule.maxLength}`, value);
    return;
  }

  if (!rule.pattern.test(text)) {
    addError(context, column, `Formato invalido: ${rule.description}`, value);
  }
};

const parseInteger = (context: RowContext, column: string) => {
  const value = getValue(context, column);
  const text = toValidationText(value);

  if (!text) {
    return null;
  }

  const numeric = Number(text);

  return Number.isInteger(numeric) ? numeric : null;
};

const validateEnum = (
  context: RowContext,
  column: string,
  values: number[],
  required = false
) => {
  const value = getValue(context, column);

  if (isBlank(value)) {
    if (required) {
      addError(context, column, "Dato requerido", value);
    }

    return null;
  }

  const parsedValue = parseInteger(context, column);

  if (parsedValue === null || !values.includes(parsedValue)) {
    addError(context, column, `Valor invalido. Permitidos: ${values.join(", ")}`, value);
    return null;
  }

  return parsedValue;
};

const validateRequiredEither = (
  context: RowContext,
  leftColumn: string,
  rightColumn: string,
  message: string
) => {
  const leftValue = getValue(context, leftColumn);
  const rightValue = getValue(context, rightColumn);

  if (isBlank(leftValue) && isBlank(rightValue)) {
    addError(context, leftColumn, message, leftValue);
    addError(context, rightColumn, message, rightValue);
  }
};

export const validateCreditReportRows = (
  dataRows: unknown[][],
  headerIndex: Map<string, number>
) => {
  const errors: CreditReportValidationError[] = [];

  dataRows.forEach((row, rowIndex) => {
    const context: RowContext = {
      errors,
      headerIndex,
      row,
      rowNumber: rowIndex + 2
    };

    validateRule(context, "mes_reporte", rules.mesReportado, true);
    validateRule(context, "clave_sujeto_obligado", rules.claveSo, true);
    validateRule(context, "clave_actividad", rules.alfanumerico3, true);
    validateRule(context, "referencia_aviso", rules.referenciaAviso, true);
    validateRule(context, "folio_modificatorio", rules.folioModificacion);
    validateRule(context, "descripcion_mod", rules.descripcion3000);
    validateRule(context, "prioridad", rules.prioridad, true);
    validateRule(context, "tipo_alerta", rules.tipoAlerta, true);
    validateRule(context, "descripcion_alerta", rules.descripcion3000, true);

    const tipoPersonaAviso = validateEnum(
      context,
      "tipo_persona_objeto_aviso",
      [1, 2, 3],
      true
    );

    if (tipoPersonaAviso === 1) {
      validateRule(context, "nombre_objeto_aviso", rules.nombre, true);
      validateRule(context, "ape_paterno_objeto_aviso", rules.nombre, true);
      validateRule(context, "ape_materno_objeto_aviso", rules.nombre, true);
      validateRule(context, "fecha_nacimiento_objeto_aviso", rules.fecha, true);
      validateRequiredEither(
        context,
        "rfc_objeto_aviso",
        "curp_objeto_aviso",
        "Debe informar RFC o CURP"
      );
      validateRule(context, "rfc_objeto_aviso", rules.rfcFisica);
      validateRule(context, "curp_objeto_aviso", rules.curp);
      validateRule(context, "pais_nacionalidad_objeto_aviso", rules.pais, true);
      validateRule(context, "actividad_economica_objeto_aviso", rules.actividadEconomica, true);
    }

    if (tipoPersonaAviso === 2) {
      validateRule(context, "denominacion_razon_moral", rules.descripcion254, true);
      validateRule(context, "fecha_constitucion_moral", rules.fecha, true);
      validateRule(context, "rfc_moral", rules.rfcMoral, true);
      validateRule(context, "pais_moral", rules.pais, true);
      validateRule(context, "giro_mercantil_moral", rules.digito7, true);
      validateRule(context, "nombre_representante_apoderado", rules.nombre, true);
      validateRule(context, "ape_paterno_representantee_aapoderado", rules.nombre, true);
      validateRule(context, "ape_materno_representante_apoderado", rules.nombre, true);
      validateRule(context, "fecha_nacimiento_representante_aapoderado", rules.fecha, true);
      validateRequiredEither(
        context,
        "rfc_representante_apoderado",
        "curp_representante_aapoderado",
        "Debe informar RFC o CURP del representante"
      );
      validateRule(context, "rfc_representante_apoderado", rules.rfcGenerico);
      validateRule(context, "curp_representante_aapoderado", rules.curp);
    }

    if (tipoPersonaAviso === 3) {
      validateRule(context, "denominacion_razon_fideicomiso", rules.descripcion254, true);
      validateRule(context, "rfc_fideicomiso", rules.rfcMoral, true);
      validateRule(context, "identificador_fideicomiso", rules.descripcion40, true);
      validateRule(context, "nombre_apoderado_delegado", rules.nombre, true);
      validateRule(context, "ape_paterno_apoderado_delegado", rules.nombre, true);
      validateRule(context, "ape_materno_apoderado_delegado", rules.nombre, true);
      validateRule(context, "fecha_nacimiento_apoderado_delegado", rules.fecha, true);
      validateRequiredEither(
        context,
        "rfc_aapoderado_delegado",
        "curp_apoderado_delegado",
        "Debe informar RFC o CURP del apoderado"
      );
      validateRule(context, "rfc_aapoderado_delegado", rules.rfcGenerico);
      validateRule(context, "curp_apoderado_delegado", rules.curp);
    }

    const tipoDomicilio = validateEnum(context, "tipo_domicilio_aviso", [1, 2], true);

    if (tipoDomicilio === 1) {
      validateRule(context, "colonia_aviso_nacional", rules.colonia, true);
      validateRule(context, "calle_aviso_nacional", rules.direccion100, true);
      validateRule(context, "numero_ext_aviso_nacional", rules.direccion56, true);
      validateRule(context, "numero_int_aviso_nacional", rules.direccion40);
      validateRule(context, "codigo_postal_aviso_nacional", rules.cp, true);
    }

    if (tipoDomicilio === 2) {
      validateRule(context, "pais_aviso_extranjero", rules.pais, true);
      validateRule(context, "estadoprovincia_aviso_extranjero", rules.direccion100, true);
      validateRule(context, "ciudad_poblacion_aviso_extranjero", rules.direccion100, true);
      validateRule(context, "colonia_aviso_extranjero", rules.colonia, true);
      validateRule(context, "calle_aviso_extranjero", rules.direccion100, true);
      validateRule(context, "numero_ext_aviso_extranjero", rules.direccion56, true);
      validateRule(context, "numero_int_aviso_extranjero", rules.direccion40);
      validateRule(context, "codigo_postal_aviso_extranjero", rules.cpExtranjero, true);
    }

    validateRule(context, "telefono_clave_pais_aviso", rules.pais, true);
    validateRule(context, "numero_telefono_aviso", rules.telefono, true);
    validateRule(context, "correo_electronico_aviso", rules.correo);

    const tipoPersonaBeneficiario = validateEnum(
      context,
      "tipo_persona_beneficiario",
      [1, 2, 3]
    );

    if (tipoPersonaBeneficiario === 1) {
      validateRule(context, "nombre_beneficiario", rules.nombre, true);
      validateRule(context, "ape_paterno_beneficiario", rules.nombre, true);
      validateRule(context, "ape_materno_beneficiario", rules.nombre, true);
      validateRule(context, "fecha_nacimiento_beneficiario", rules.fecha, true);
      validateRule(context, "rfc_beneficiario", rules.rfcGenerico, true);
      validateRule(context, "curp_beneficiario", rules.curp, true);
      validateRule(context, "pais_nacionalidad_beneficiario", rules.pais, true);
    }

    if (tipoPersonaBeneficiario === 2) {
      validateRule(context, "denominacion_razon_moral_beneficiario", rules.descripcion254, true);
      validateRule(context, "fecha_constitucion_moral_beneficiario", rules.fecha, true);
      validateRule(context, "rfc_moral_beneficiario", rules.rfcMoral, true);
      validateRule(context, "pais_moral_beneficiario", rules.pais, true);
    }

    if (tipoPersonaBeneficiario === 3) {
      validateRule(context, "denominacion_razon_fideicomiso_beneficiario", rules.descripcion254, true);
      validateRule(context, "rfc_fideicomiso_beneficiario", rules.rfcMoral, true);
      validateRule(context, "id_fideicomiso_beneficiario", rules.descripcion40, true);
    }

    validateRule(context, "fecha", rules.fecha, true);
    validateRule(context, "codigo_postal_agencia", rules.cp, true);
    validateRule(context, "nombre_sucursal", rules.descripcion254, true);
    validateRule(context, "tipo_operacion", rules.digito3a4, true);
    validateRule(context, "tipo_garantia", rules.digito1a2);
    validateRule(context, "tipo_inmueble", rules.digito1a2);
    validateRule(context, "valor_avaluo_catastral", rules.monto);
    validateRule(context, "codigo_postal_ubicacion", rules.cp);
    validateRule(context, "folio_real", rules.folio20);
    validateRule(context, "descripcion_garantia", rules.descripcion3000);

    const tipoPersonaGarante = validateEnum(context, "tipo_persona", [1, 2, 3]);

    if (tipoPersonaGarante === 1) {
      validateRule(context, "nombre", rules.nombre, true);
      validateRule(context, "apellido_paterno", rules.nombre, true);
      validateRule(context, "apellido_materno", rules.nombre, true);
      validateRule(context, "fecha_nacimiento", rules.fecha, true);
      validateRule(context, "rfc_garante", rules.rfcGenerico, true);
      validateRule(context, "curp_garante", rules.curp, true);
    }

    if (tipoPersonaGarante === 2) {
      validateRule(context, "denominacion_razon_moral_garante", rules.descripcion254, true);
      validateRule(context, "fecha_constitucion_moral_garante", rules.fecha, true);
      validateRule(context, "rfc_moral_garante", rules.rfcMoral, true);
    }

    if (tipoPersonaGarante === 3) {
      validateRule(context, "denominacion_razon_fide_garante", rules.descripcion254, true);
      validateRule(context, "rfc_fide_garante", rules.rfcMoral, true);
      validateRule(context, "identificador_fideicomiso_fide_garante", rules.descripcion40, true);
    }

    validateRule(context, "fecha_pago", rules.fecha, true);
    validateRule(context, "instrumento_monetario", rules.digito1a2, true);
    validateRule(context, "moneda", rules.digito1a3, true);
    validateRule(context, "monto_operacion", rules.monto, true);
  });

  return errors;
};
