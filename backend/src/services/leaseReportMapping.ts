import type { CreditReportColumn } from "./creditReportMapping.js";

export const leaseReportColumns: CreditReportColumn[] = [
  { header: "MesReporte", column: "mes_reporte", type: "integer" },
  { header: "ClaveSujetoObligado", column: "clave_sujeto_obligado", type: "text" },
  { header: "ClaveActividad", column: "clave_actividad", type: "text" },
  { header: "ReferenciaAviso", column: "referencia_aviso", type: "text" },
  { header: "FolioModificatorio", column: "folio_modificatorio", type: "text" },
  { header: "DescripcionMod", column: "descripcion_mod", type: "text" },
  { header: "Prioridad", column: "prioridad", type: "integer" },
  { header: "TipoAlerta", column: "tipo_alerta", type: "integer" },
  { header: "DescripcionAlerta", column: "descripcion_alerta", type: "text" },
  { header: "TipoPersonaObjetoAviso", column: "tipo_persona_objeto_aviso", type: "integer" },
  { header: "NombreObjetoAviso", column: "nombre_objeto_aviso", type: "text" },
  { header: "ApePaternoObjetoAviso", column: "ape_paterno_objeto_aviso", type: "text" },
  { header: "ApeMaternoObjetoAviso", column: "ape_materno_objeto_aviso", type: "text" },
  {
    header: "FechaNacimientoObjetoAviso",
    column: "fecha_nacimiento_objeto_aviso",
    type: "date"
  },
  { header: "RFCObjetoAviso", column: "rfc_objeto_aviso", type: "text" },
  { header: "CURPObjetoAviso", column: "curp_objeto_aviso", type: "text" },
  {
    header: "PaisNacionalidadObjetoAviso",
    column: "pais_nacionalidad_objeto_aviso",
    type: "text"
  },
  {
    header: "ActividadEconomicaObjetoAviso",
    column: "actividad_economica_objeto_aviso",
    type: "text"
  },
  { header: "DenominacionRazonMoral", column: "denominacion_razon_moral", type: "text" },
  { header: "FechaConstitucionMoral", column: "fecha_constitucion_moral", type: "date" },
  { header: "RFCMoral", column: "rfc_moral", type: "text" },
  { header: "PaisMoral", column: "pais_moral", type: "text" },
  { header: "GiroMercantilMoral", column: "giro_mercantil_moral", type: "text" },
  {
    header: "NombreRepresentanteApoderado",
    column: "nombre_representante_apoderado",
    type: "text"
  },
  {
    header: "ApePaternoRepresentanteeAapoderado",
    column: "ape_paterno_representantee_aapoderado",
    type: "text"
  },
  {
    header: "ApeMaternoRepresentanteApoderado",
    column: "ape_materno_representante_apoderado",
    type: "text"
  },
  {
    header: "FechaNacimientoRepresentanteAapoderado",
    column: "fecha_nacimiento_representante_aapoderado",
    type: "date"
  },
  { header: "RFCRepresentanteApoderado", column: "rfc_representante_apoderado", type: "text" },
  {
    header: "CURPRepresentanteAapoderado",
    column: "curp_representante_aapoderado",
    type: "text"
  },
  {
    header: "DenominacionRazonFideicomiso",
    column: "denominacion_razon_fideicomiso",
    type: "text"
  },
  { header: "RFCFideicomiso", column: "rfc_fideicomiso", type: "text" },
  {
    header: "IdentificadorFideicomiso",
    column: "identificador_fideicomiso",
    type: "text"
  },
  { header: "NombreApoderadoDelegado", column: "nombre_apoderado_delegado", type: "text" },
  {
    header: "ApePaternoApoderadoDelegado",
    column: "ape_paterno_apoderado_delegado",
    type: "text"
  },
  {
    header: "ApeMaternoApoderadoDelegado",
    column: "ape_materno_apoderado_delegado",
    type: "text"
  },
  {
    header: "FechaNacimientoApoderadoDelegado",
    column: "fecha_nacimiento_apoderado_delegado",
    type: "date"
  },
  { header: "RFCAapoderadoDelegado", column: "rfc_aapoderado_delegado", type: "text" },
  { header: "CURPApoderadoDelegado", column: "curp_apoderado_delegado", type: "text" },
  { header: "TipoDomicilioAviso", column: "tipo_domicilio_aviso", type: "integer" },
  { header: "ColoniaAvisoNacional", column: "colonia_aviso_nacional", type: "text" },
  { header: "CalleAvisoNacional", column: "calle_aviso_nacional", type: "text" },
  { header: "NumeroExtAvisoNacional", column: "numero_ext_aviso_nacional", type: "text" },
  { header: "NumeroIntAvisoNacional", column: "numero_int_aviso_nacional", type: "text" },
  {
    header: "CodigoPostalAvisoNacional",
    column: "codigo_postal_aviso_nacional",
    type: "text"
  },
  { header: "PaisAvisoExtranjero", column: "pais_aviso_extranjero", type: "text" },
  {
    header: "EstadoprovinciaAvisoExtranjero",
    column: "estadoprovincia_aviso_extranjero",
    type: "text"
  },
  {
    header: "CiudadPoblacionAvisoExtranjero",
    column: "ciudad_poblacion_aviso_extranjero",
    type: "text"
  },
  { header: "ColoniaAvisoExtranjero", column: "colonia_aviso_extranjero", type: "text" },
  { header: "CalleAvisoExtranjero", column: "calle_aviso_extranjero", type: "text" },
  {
    header: "NumeroExtAvisoExtranjero",
    column: "numero_ext_aviso_extranjero",
    type: "text"
  },
  {
    header: "NumeroIntAvisoExtranjero",
    column: "numero_int_aviso_extranjero",
    type: "text"
  },
  {
    header: "CodigoPostalAvisoExtranjero",
    column: "codigo_postal_aviso_extranjero",
    type: "text"
  },
  { header: "TelefonoClavePaisAviso", column: "telefono_clave_pais_aviso", type: "text" },
  { header: "NumeroTelefonoAviso", column: "numero_telefono_aviso", type: "text" },
  { header: "CorreoElectronicoAviso", column: "correo_electronico_aviso", type: "text" },
  { header: "TipoPersonaBeneficiario", column: "tipo_persona_beneficiario", type: "integer" },
  { header: "NombreBeneficiario", column: "nombre_beneficiario", type: "text" },
  { header: "ApePaternoBeneficiario", column: "ape_paterno_beneficiario", type: "text" },
  { header: "ApeMaternoBeneficiario", column: "ape_materno_beneficiario", type: "text" },
  {
    header: "FechaNacimientoBeneficiario",
    column: "fecha_nacimiento_beneficiario",
    type: "date"
  },
  { header: "RFCBeneficiario", column: "rfc_beneficiario", type: "text" },
  { header: "CURPBeneficiario", column: "curp_beneficiario", type: "text" },
  {
    header: "PaisNacionalidadBeneficiario",
    column: "pais_nacionalidad_beneficiario",
    type: "text"
  },
  {
    header: "DenominacionRazonMoralBeneficiario",
    column: "denominacion_razon_moral_beneficiario",
    type: "text"
  },
  {
    header: "FechaConstitucionMoralBeneficiario",
    column: "fecha_constitucion_moral_beneficiario",
    type: "date"
  },
  { header: "RFCMoralBeneficiario", column: "rfc_moral_beneficiario", type: "text" },
  { header: "PaisMoralBeneficiario", column: "pais_moral_beneficiario", type: "text" },
  {
    header: "GiromercantilMoralBeneficiario",
    column: "giromercantil_moral_beneficiario",
    type: "text"
  },
  {
    header: "DenominacionRazonFideicomisoBeneficiario",
    column: "denominacion_razon_fideicomiso_beneficiario",
    type: "text"
  },
  {
    header: "RFCFideicomisoBeneficiario",
    column: "rfc_fideicomiso_beneficiario",
    type: "text"
  },
  {
    header: "IdFideicomisoBeneficiario",
    column: "id_fideicomiso_beneficiario",
    type: "text"
  },
  { header: "fecha_operacion", column: "fecha_operacion", type: "date" },
  { header: "tipo_operacion", column: "tipo_operacion", type: "integer" },
  { header: "fecha_inicio", column: "fecha_inicio", type: "date" },
  { header: "fecha_termino", column: "fecha_termino", type: "date" },
  { header: "tipo_inmueble", column: "tipo_inmueble", type: "integer" },
  {
    header: "valor_avaluo_catastral",
    column: "valor_avaluo_catastral",
    type: "numeric"
  },
  { header: "colonia_inmueble", column: "colonia_inmueble", type: "text" },
  { header: "calle_inmueble", column: "calle_inmueble", type: "text" },
  {
    header: "numero_exterior_inmueble",
    column: "numero_exterior_inmueble",
    type: "text"
  },
  {
    header: "numero_interior_inmueble",
    column: "numero_interior_inmueble",
    type: "text"
  },
  {
    header: "codigo_postal_imueble",
    column: "codigo_postal_inmueble",
    type: "text"
  },
  { header: "folio_real", column: "folio_real", type: "text" },
  { header: "fecha_pago", column: "fecha_pago", type: "date" },
  { header: "formaPago", column: "forma_pago", type: "integer" },
  {
    header: "instrumento_monetario",
    column: "instrumento_monetario",
    type: "integer"
  },
  { header: "moneda", column: "moneda", type: "integer" },
  { header: "monto_operacion", column: "monto_operacion", type: "numeric" }
];
