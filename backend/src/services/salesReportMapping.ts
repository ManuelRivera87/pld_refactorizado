import {
  creditReportColumns,
  type CreditReportColumn
} from "./creditReportMapping.js";

const commonSalesReportColumns = creditReportColumns.slice(
  0,
  creditReportColumns.findIndex((column) => column.column === "tipo_operacion") + 1
);

export const salesReportColumns: CreditReportColumn[] = [
  ...commonSalesReportColumns,
  { header: "MarcaFabricante", column: "marca_fabricante", type: "text" },
  { header: "Modelo", column: "modelo", type: "text" },
  { header: "AÑo", column: "anio_vehiculo", type: "integer" },
  { header: "Vin", column: "vin", type: "text" },
  { header: "Repuve", column: "repuve", type: "text" },
  { header: "Placas", column: "placas", type: "text" },
  { header: "FechaPago", column: "fecha_pago", type: "date" },
  { header: "FormaPago", column: "forma_pago", type: "integer" },
  { header: "InstrumentoMonetario", column: "instrumento_monetario", type: "integer" },
  { header: "Moneda", column: "moneda", type: "integer" },
  { header: "MontoOperacion", column: "monto_operacion", type: "numeric" }
];
