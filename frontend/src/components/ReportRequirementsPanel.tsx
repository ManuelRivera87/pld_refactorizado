import {
  ChevronDown,
  ChevronUp,
  FileText,
  ListChecks,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";

type ReportKind = "ventas" | "creditos" | "arrendamientos";

type RequirementField = {
  name: string;
  note?: string;
};

type RequirementGroup = {
  fields: RequirementField[];
  title: string;
  validations: string[];
};

type RequirementConfig = {
  expectedHeadersCount: number;
  formFields: string[];
  groups: RequirementGroup[];
  processingNotes: string[];
  title: string;
};

const field = (name: string, note?: string): RequirementField => ({
  name,
  note
});

const requirementConfigByKind: Record<ReportKind, RequirementConfig> = {
  creditos: {
    expectedHeadersCount: 97,
    formFields: ["Empresa", "Mes afectacion", "Anio afectacion", "Tipo de actividad fijo MPC"],
    processingNotes: [
      "NombreSucursal se recibe y valida en la carga, pero se omite al generar el XML de creditos para conservar compatibilidad con el esquema legado.",
      "monto_operacion se exporta redondeado a entero con dos decimales, por ejemplo 123456.00.",
      "El XML de creditos se genera y descarga con encoding windows-1252."
    ],
    title: "Campos esperados para creditos",
    groups: [
      {
        title: "Encabezado del aviso",
        fields: [
          field("MesReporte", "6 caracteres, formato AAAAMM"),
          field("ClaveSujetoObligado", "RFC de 12 a 13 caracteres"),
          field("ClaveActividad", "3 caracteres, valor fijo MPC"),
          field("ReferenciaAviso", "1 a 14 caracteres"),
          field("FolioModificatorio", "6 a 14 caracteres, formato AAAA-folio"),
          field("DescripcionMod", "1 a 3000 caracteres"),
          field("Prioridad", "1 digito, valores 1 o 2"),
          field("TipoAlerta", "3 a 4 digitos"),
          field("DescripcionAlerta", "1 a 3000 caracteres")
        ],
        validations: [
          "MesReporte debe venir en formato AAAAMM.",
          "ReferenciaAviso debe respetar longitud operativa del archivo.",
          "Prioridad, TipoAlerta y DescripcionAlerta se validan en cada fila."
        ]
      },
      {
        title: "Persona objeto y domicilio",
        fields: [
          field("TipoPersonaObjetoAviso", "1 digito, valores 1 a 3"),
          field("RFCObjetoAviso", "RFC de 12 a 13 caracteres"),
          field("CURPObjetoAviso", "18 caracteres"),
          field("PaisNacionalidadObjetoAviso", "2 letras"),
          field("TipoDomicilioAviso", "1 digito, valores 1 o 2"),
          field("ColoniaAvisoNacional", "1 a 50 caracteres"),
          field("PaisAvisoExtranjero", "2 letras"),
          field("NumeroTelefonoAviso", "10 a 12 digitos")
        ],
        validations: [
          "Para persona fisica se exige RFC o CURP.",
          "Los campos cambian segun sea persona fisica, moral o fideicomiso.",
          "El domicilio se valida segun sea nacional o extranjero."
        ]
      },
      {
        title: "Beneficiario",
        fields: [
          field("TipoPersonaBeneficiario", "1 digito, valores 1 a 3"),
          field("NombreBeneficiario", "1 a 200 caracteres"),
          field("RFCBeneficiario", "RFC de 12 a 13 caracteres"),
          field("CURPBeneficiario", "18 caracteres"),
          field("DenominacionRazonMoralBeneficiario", "1 a 254 caracteres"),
          field("RFCFideicomisoBeneficiario", "RFC de 12 caracteres")
        ],
        validations: [
          "Si se informa beneficiario, los campos del bloque elegido deben completarse.",
          "Para beneficiario fisico se validan RFC, CURP y fecha.",
          "Para moral o fideicomiso solo aplican los campos del tipo seleccionado."
        ]
      },
      {
        title: "Operacion, garantia y garante",
        fields: [
          field("Fecha", "8 caracteres, formato AAAAMMDD"),
          field("CodigoPostalAgencia", "5 digitos"),
          field("NombreSucursal", "1 a 254 caracteres"),
          field("TipoOperacion", "3 a 4 digitos"),
          field("tipo_garantia", "1 a 2 digitos"),
          field("tipo_inmueble", "1 a 3 digitos"),
          field("valor_avaluo_catastral", "monto con 2 decimales"),
          field("folio_real", "1 a 20 caracteres"),
          field("tipo_persona", "1 digito, valores 1 a 3"),
          field("rfcgarante", "RFC de 12 a 13 caracteres")
        ],
        validations: [
          "Fecha debe venir en AAAAMMDD.",
          "Los datos de garantia y garante se validan por tipo de persona y bloque.",
          "Monto y folio real se revisan por formato y longitud."
        ]
      },
      {
        title: "Liquidacion",
        fields: [
          field("fecha_pago", "8 caracteres, formato AAAAMMDD"),
          field("instrumento_monetario", "1 a 2 digitos"),
          field("moneda", "1 a 3 digitos"),
          field("monto_operacion", "monto con 2 decimales")
        ],
        validations: [
          "fecha_pago debe venir en AAAAMMDD.",
          "instrumento_monetario y moneda se validan como catalogos numericos operativos.",
          "monto_operacion exige formato numerico con 2 decimales."
        ]
      }
    ]
  },
  ventas: {
    expectedHeadersCount: 85,
    formFields: ["Empresa", "Mes afectacion", "Anio afectacion", "Tipo de actividad fijo VEH"],
    processingNotes: [
      "El XML de ventas conserva la estructura VEH alineada al legado operativo actual.",
      "nivel_blindaje se genera con valor fijo 9 para conservar compatibilidad con el XML legado de ventas.",
      "Repuve y Placas se reciben y validan en la carga, pero no se estan exportando dentro del XML legado alineado.",
      "monto_operacion se exporta con dos decimales respetando el valor cargado.",
      "El XML de ventas se genera y descarga con encoding windows-1252."
    ],
    title: "Campos esperados para ventas",
    groups: [
      {
        title: "Encabezado del aviso",
        fields: [
          field("MesReporte", "6 caracteres, formato AAAAMM"),
          field("ClaveSujetoObligado", "RFC de 12 a 13 caracteres"),
          field("ClaveActividad", "3 caracteres, valor fijo VEH"),
          field("ReferenciaAviso", "1 a 14 caracteres"),
          field("FolioModificatorio", "6 a 14 caracteres, formato AAAA-folio"),
          field("DescripcionMod", "1 a 3000 caracteres"),
          field("Prioridad", "1 digito, valores 1 o 2"),
          field("TipoAlerta", "3 a 4 digitos"),
          field("DescripcionAlerta", "1 a 3000 caracteres")
        ],
        validations: [
          "ClaveActividad debe ser VEH.",
          "Si hay aviso modificatorio, FolioModificatorio y DescripcionMod deben viajar juntos.",
          "Prioridad, TipoAlerta y DescripcionAlerta se validan en cada fila."
        ]
      },
      {
        title: "Persona objeto, domicilio y beneficiario",
        fields: [
          field("TipoPersonaObjetoAviso", "1 digito, valores 1 a 3"),
          field("RFCObjetoAviso", "RFC de 12 a 13 caracteres"),
          field("CURPObjetoAviso", "18 caracteres"),
          field("TipoDomicilioAviso", "1 digito, valores 1 o 2"),
          field("CorreoElectronicoAviso", "5 a 60 caracteres"),
          field("TipoPersonaBeneficiario", "1 digito, valores 1 a 3"),
          field("RFCBeneficiario", "RFC de 12 a 13 caracteres"),
          field("CURPBeneficiario", "18 caracteres")
        ],
        validations: [
          "Para persona fisica se exige RFC o CURP.",
          "Si se captura correo, debe existir telefono.",
          "Si hay datos de beneficiario, debe definirse el tipo de persona."
        ]
      },
      {
        title: "Datos del vehiculo",
        fields: [
          field("TipoOperacion", "3 a 4 digitos"),
          field("MarcaFabricante", "1 a 40 caracteres"),
          field("Modelo", "1 a 40 caracteres"),
          field("AÑo", "4 digitos"),
          field("VIN", "17 caracteres"),
          field("Repuve", "8 caracteres"),
          field("Placas", "1 a 12 caracteres")
        ],
        validations: [
          "VIN debe respetar longitud vehicular esperada.",
          "Repuve es obligatorio y debe tener 8 caracteres.",
          "Placas son obligatorias y se validan por longitud."
        ]
      },
      {
        title: "Liquidacion",
        fields: [
          field("FechaPago", "8 caracteres, formato AAAAMMDD"),
          field("FormaPago", "1 digito"),
          field("InstrumentoMonetario", "1 a 2 digitos"),
          field("Moneda", "1 a 3 digitos"),
          field("MontoOperacion", "monto con 2 decimales")
        ],
        validations: [
          "FormaPago es obligatoria.",
          "Si FormaPago es distinta de 3, InstrumentoMonetario es obligatorio.",
          "Si FormaPago es 3, InstrumentoMonetario debe venir vacio.",
          "MontoOperacion se valida con 2 decimales."
        ]
      }
    ]
  },
  arrendamientos: {
    expectedHeadersCount: 88,
    formFields: ["Empresa", "Mes afectacion", "Anio afectacion", "Tipo de actividad fijo ARI"],
    processingNotes: [
      "El XML de arrendamientos conserva la estructura ARI del flujo operativo actual.",
      "monto_operacion se exporta con dos decimales respetando el valor cargado.",
      "Las caracteristicas del inmueble y la liquidacion viajan solo en el esquema de arrendamientos."
    ],
    title: "Campos esperados para arrendamientos",
    groups: [
      {
        title: "Encabezado del aviso",
        fields: [
          field("MesReporte", "6 caracteres, formato AAAAMM"),
          field("ClaveSujetoObligado", "RFC de 12 a 13 caracteres"),
          field("ClaveActividad", "3 caracteres, valor fijo ARI"),
          field("ReferenciaAviso", "1 a 14 caracteres"),
          field("FolioModificatorio", "6 a 14 caracteres, formato AAAA-folio"),
          field("DescripcionMod", "1 a 3000 caracteres"),
          field("Prioridad", "1 digito, valores 1 o 2"),
          field("TipoAlerta", "3 a 4 digitos"),
          field("DescripcionAlerta", "1 a 3000 caracteres")
        ],
        validations: [
          "ClaveActividad debe ser ARI.",
          "Si el aviso es modificatorio, FolioModificatorio y DescripcionMod deben viajar juntos.",
          "Prioridad, TipoAlerta y DescripcionAlerta se validan por fila."
        ]
      },
      {
        title: "Persona objeto, domicilio y beneficiario",
        fields: [
          field("TipoPersonaObjetoAviso", "1 digito, valores 1 a 3"),
          field("RFCObjetoAviso", "RFC de 12 a 13 caracteres"),
          field("CURPObjetoAviso", "18 caracteres"),
          field("TipoDomicilioAviso", "1 digito, valores 1 o 2"),
          field("CorreoElectronicoAviso", "5 a 60 caracteres"),
          field("TipoPersonaBeneficiario", "1 digito, valores 1 a 3"),
          field("RFCBeneficiario", "RFC de 12 a 13 caracteres"),
          field("CURPBeneficiario", "18 caracteres")
        ],
        validations: [
          "Los bloques de persona fisica, moral y fideicomiso no pueden mezclarse.",
          "El domicilio nacional y extranjero no deben capturarse al mismo tiempo.",
          "Si hay beneficiario, solo debe llenarse el bloque del tipo seleccionado."
        ]
      },
      {
        title: "Operacion y caracteristicas del inmueble",
        fields: [
          field("fecha_operacion", "8 caracteres, formato AAAAMMDD"),
          field("tipo_operacion", "3 a 4 digitos"),
          field("fecha_inicio", "8 caracteres, formato AAAAMMDD"),
          field("fecha_termino", "8 caracteres, formato AAAAMMDD"),
          field("tipo_inmueble", "1 a 3 digitos"),
          field("valor_avaluo_catastral", "monto con 2 decimales"),
          field("colonia_inmueble", "1 a 50 caracteres"),
          field("calle_inmueble", "1 a 100 caracteres"),
          field("codigo_postal_inmueble", "5 digitos"),
          field("folio_real", "1 a 200 caracteres")
        ],
        validations: [
          "fecha_operacion, fecha_inicio y fecha_termino deben venir en AAAAMMDD.",
          "fecha_inicio no puede ser mayor que fecha_termino.",
          "tipo_inmueble, valor de referencia y folio real se validan por formato."
        ]
      },
      {
        title: "Liquidacion",
        fields: [
          field("fecha_pago", "8 caracteres, formato AAAAMMDD"),
          field("forma_pago", "1 a 3 digitos"),
          field("instrumento_monetario", "1 a 2 digitos"),
          field("moneda", "1 a 3 digitos"),
          field("monto_operacion", "monto con 2 decimales")
        ],
        validations: [
          "FormaPago es obligatoria.",
          "Si FormaPago es distinta de 3, InstrumentoMonetario es obligatorio.",
          "Si FormaPago es 3, InstrumentoMonetario debe venir vacio.",
          "MontoOperacion se valida con 2 decimales."
        ]
      }
    ]
  }
};

export function ReportRequirementsPanel({ kind }: { kind: ReportKind }) {
  const [isOpen, setIsOpen] = useState(false);
  const config = requirementConfigByKind[kind];

  return (
    <section className={`requirements-panel report-type-${kind}`}>
      <div className="section-heading section-heading-row requirements-header">
        <div>
          <p className="eyebrow">Referencia de carga</p>
          <h2>{config.title}</h2>
          <p>
            Esta referencia corresponde solo al informe actual y muestra la
            estructura esperada del archivo junto con las reglas principales de
            validacion y procesamiento.
          </p>
        </div>
        <button
          aria-expanded={isOpen}
          className="ghost-button compact-button"
          type="button"
          onClick={() => setIsOpen((current) => !current)}
        >
          {isOpen ? (
            <ChevronUp aria-hidden="true" size={16} strokeWidth={2} />
          ) : (
            <ChevronDown aria-hidden="true" size={16} strokeWidth={2} />
          )}
          <span>{isOpen ? "Ocultar detalle" : "Mostrar detalle"}</span>
        </button>
      </div>

      <div className="requirements-meta">
        <div>
          <FileText aria-hidden="true" size={18} strokeWidth={2} />
          <div>
            <span>Encabezados XLS esperados</span>
            <strong>{config.expectedHeadersCount}</strong>
          </div>
        </div>
        <div>
          <ListChecks aria-hidden="true" size={18} strokeWidth={2} />
          <div>
            <span>Campos del formulario</span>
            <strong>{config.formFields.length}</strong>
          </div>
        </div>
        <div>
          <ShieldCheck aria-hidden="true" size={18} strokeWidth={2} />
          <div>
            <span>Bloques validados</span>
            <strong>{config.groups.length}</strong>
          </div>
        </div>
      </div>

      <div
        className={
          isOpen ? "requirements-body requirements-body-open" : "requirements-body"
        }
      >
        <div className="requirements-form-tags">
          {config.formFields.map((field) => (
            <span key={field}>{field}</span>
          ))}
        </div>

        <article className="requirements-processing-card">
          <h3>Procesamiento del XML</h3>
          <ul className="requirements-rules">
            {config.processingNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </article>

        <div className="requirements-grid">
          {config.groups.map((group) => (
            <article className="requirements-card" key={group.title}>
              <h3>{group.title}</h3>

              <div className="requirements-block">
                <span>Campos esperados</span>
                <div className="requirements-tags">
                  {group.fields.map((field) => (
                    <small key={field.name}>
                      <strong>{field.name}</strong>
                      {field.note ? <span>{field.note}</span> : null}
                    </small>
                  ))}
                </div>
              </div>

              <div className="requirements-block">
                <span>Validaciones clave</span>
                <ul className="requirements-rules">
                  {group.validations.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
