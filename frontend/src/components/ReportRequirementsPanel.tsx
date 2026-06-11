import {
  ChevronDown,
  ChevronUp,
  FileText,
  ListChecks,
  ShieldCheck
} from "lucide-react";
import { useState } from "react";

type ReportKind = "ventas" | "creditos" | "arrendamientos";

type RequirementGroup = {
  fields: string[];
  title: string;
  validations: string[];
};

type RequirementConfig = {
  expectedHeadersCount: number;
  formFields: string[];
  groups: RequirementGroup[];
  title: string;
};

const requirementConfigByKind: Record<ReportKind, RequirementConfig> = {
  creditos: {
    expectedHeadersCount: 97,
    formFields: ["Empresa", "Mes afectacion", "Anio afectacion", "Tipo de actividad fijo MPC"],
    title: "Campos esperados para creditos",
    groups: [
      {
        title: "Encabezado del aviso",
        fields: [
          "MesReporte",
          "ClaveSujetoObligado",
          "ClaveActividad",
          "ReferenciaAviso",
          "FolioModificatorio",
          "DescripcionMod",
          "Prioridad",
          "TipoAlerta",
          "DescripcionAlerta"
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
          "TipoPersonaObjetoAviso",
          "RFCObjetoAviso",
          "CURPObjetoAviso",
          "PaisNacionalidadObjetoAviso",
          "TipoDomicilioAviso",
          "ColoniaAvisoNacional",
          "PaisAvisoExtranjero",
          "NumeroTelefonoAviso"
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
          "TipoPersonaBeneficiario",
          "NombreBeneficiario",
          "RFCBeneficiario",
          "CURPBeneficiario",
          "DenominacionRazonMoralBeneficiario",
          "RFCFideicomisoBeneficiario"
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
          "Fecha",
          "CodigoPostalAgencia",
          "NombreSucursal",
          "TipoOperacion",
          "tipo_garantia",
          "tipo_inmueble",
          "valor_avaluo_catastral",
          "folio_real",
          "tipo_persona",
          "rfcgarante"
        ],
        validations: [
          "Fecha debe venir en AAAAMMDD.",
          "Los datos de garantia y garante se validan por tipo de persona y bloque.",
          "Monto y folio real se revisan por formato y longitud."
        ]
      },
      {
        title: "Liquidacion",
        fields: ["fecha_pago", "instrumento_monetario", "moneda", "monto_operacion"],
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
    title: "Campos esperados para ventas",
    groups: [
      {
        title: "Encabezado del aviso",
        fields: [
          "MesReporte",
          "ClaveSujetoObligado",
          "ClaveActividad",
          "ReferenciaAviso",
          "FolioModificatorio",
          "DescripcionMod",
          "Prioridad",
          "TipoAlerta",
          "DescripcionAlerta"
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
          "TipoPersonaObjetoAviso",
          "RFCObjetoAviso",
          "CURPObjetoAviso",
          "TipoDomicilioAviso",
          "CorreoElectronicoAviso",
          "TipoPersonaBeneficiario",
          "RFCBeneficiario",
          "CURPBeneficiario"
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
          "TipoOperacion",
          "MarcaFabricante",
          "Modelo",
          "AnioModelo",
          "VIN",
          "Repuve",
          "Placas"
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
          "FechaPago",
          "FormaPago",
          "InstrumentoMonetario",
          "Moneda",
          "MontoOperacion"
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
    title: "Campos esperados para arrendamientos",
    groups: [
      {
        title: "Encabezado del aviso",
        fields: [
          "MesReporte",
          "ClaveSujetoObligado",
          "ClaveActividad",
          "ReferenciaAviso",
          "FolioModificatorio",
          "DescripcionMod",
          "Prioridad",
          "TipoAlerta",
          "DescripcionAlerta"
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
          "TipoPersonaObjetoAviso",
          "RFCObjetoAviso",
          "CURPObjetoAviso",
          "TipoDomicilioAviso",
          "CorreoElectronicoAviso",
          "TipoPersonaBeneficiario",
          "RFCBeneficiario",
          "CURPBeneficiario"
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
          "fecha_operacion",
          "tipo_operacion",
          "fecha_inicio",
          "fecha_termino",
          "tipo_inmueble",
          "valor_avaluo_catastral",
          "colonia_inmueble",
          "calle_inmueble",
          "codigo_postal_imueble",
          "folio_real"
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
          "fecha_pago",
          "formaPago",
          "instrumento_monetario",
          "moneda",
          "monto_operacion"
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
            Este resumen muestra la estructura esperada del archivo y las reglas
            principales que hoy valida el sistema antes de insertar la informacion.
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

        <div className="requirements-grid">
          {config.groups.map((group) => (
            <article className="requirements-card" key={group.title}>
              <h3>{group.title}</h3>

              <div className="requirements-block">
                <span>Campos esperados</span>
                <div className="requirements-tags">
                  {group.fields.map((field) => (
                    <small key={field}>{field}</small>
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
