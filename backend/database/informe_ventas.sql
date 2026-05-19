CREATE TABLE IF NOT EXISTS informe_venta_registros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_upload_id UUID REFERENCES report_uploads(id),
  uploaded_by_user_id UUID NOT NULL REFERENCES users(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mes_afectacion INTEGER,
  anio_afectacion INTEGER,
  tipo_actividad VARCHAR(10) NOT NULL DEFAULT 'VEH',
  mes_reporte INTEGER,
  clave_sujeto_obligado VARCHAR(50),
  clave_actividad VARCHAR(50),
  referencia_aviso INTEGER,
  folio_modificatorio VARCHAR(50),
  descripcion_mod TEXT,
  prioridad INTEGER,
  tipo_alerta INTEGER,
  descripcion_alerta VARCHAR(100),
  tipo_persona_objeto_aviso INTEGER,
  nombre_objeto_aviso VARCHAR(150),
  ape_paterno_objeto_aviso VARCHAR(100),
  ape_materno_objeto_aviso VARCHAR(100),
  fecha_nacimiento_objeto_aviso DATE,
  rfc_objeto_aviso VARCHAR(20),
  curp_objeto_aviso VARCHAR(20),
  pais_nacionalidad_objeto_aviso VARCHAR(10),
  actividad_economica_objeto_aviso INTEGER,
  denominacion_razon_moral VARCHAR(255),
  fecha_constitucion_moral DATE,
  rfc_moral VARCHAR(20),
  pais_moral VARCHAR(10),
  giro_mercantil_moral INTEGER,
  nombre_representante_apoderado VARCHAR(150),
  ape_paterno_representantee_aapoderado VARCHAR(100),
  ape_materno_representante_apoderado VARCHAR(100),
  fecha_nacimiento_representante_aapoderado DATE,
  rfc_representante_apoderado VARCHAR(20),
  curp_representante_aapoderado VARCHAR(20),
  denominacion_razon_fideicomiso VARCHAR(255),
  rfc_fideicomiso VARCHAR(20),
  identificador_fideicomiso VARCHAR(100),
  nombre_apoderado_delegado VARCHAR(150),
  ape_paterno_apoderado_delegado VARCHAR(100),
  ape_materno_apoderado_delegado VARCHAR(100),
  fecha_nacimiento_apoderado_delegado DATE,
  rfc_aapoderado_delegado VARCHAR(20),
  curp_apoderado_delegado VARCHAR(20),
  tipo_domicilio_aviso INTEGER,
  colonia_aviso_nacional VARCHAR(255),
  calle_aviso_nacional VARCHAR(255),
  numero_ext_aviso_nacional VARCHAR(50),
  numero_int_aviso_nacional VARCHAR(50),
  codigo_postal_aviso_nacional VARCHAR(10),
  pais_aviso_extranjero VARCHAR(10),
  estadoprovincia_aviso_extranjero VARCHAR(150),
  ciudad_poblacion_aviso_extranjero VARCHAR(150),
  colonia_aviso_extranjero VARCHAR(255),
  calle_aviso_extranjero VARCHAR(255),
  numero_ext_aviso_extranjero VARCHAR(50),
  numero_int_aviso_extranjero VARCHAR(50),
  codigo_postal_aviso_extranjero VARCHAR(20),
  telefono_clave_pais_aviso VARCHAR(10),
  numero_telefono_aviso VARCHAR(30),
  correo_electronico_aviso VARCHAR(255),
  tipo_persona_beneficiario INTEGER,
  nombre_beneficiario VARCHAR(150),
  ape_paterno_beneficiario VARCHAR(100),
  ape_materno_beneficiario VARCHAR(100),
  fecha_nacimiento_beneficiario DATE,
  rfc_beneficiario VARCHAR(20),
  curp_beneficiario VARCHAR(20),
  pais_nacionalidad_beneficiario VARCHAR(10),
  denominacion_razon_moral_beneficiario VARCHAR(255),
  fecha_constitucion_moral_beneficiario DATE,
  rfc_moral_beneficiario VARCHAR(20),
  pais_moral_beneficiario VARCHAR(10),
  denominacion_razon_fideicomiso_beneficiario VARCHAR(255),
  rfc_fideicomiso_beneficiario VARCHAR(20),
  id_fideicomiso_beneficiario VARCHAR(100),
  fecha DATE,
  codigo_postal_agencia VARCHAR(10),
  nombre_sucursal VARCHAR(150),
  tipo_operacion INTEGER,
  marca_fabricante VARCHAR(40),
  modelo VARCHAR(40),
  anio_vehiculo INTEGER,
  vin VARCHAR(20),
  repuve VARCHAR(8),
  placas VARCHAR(12),
  fecha_pago DATE,
  forma_pago INTEGER,
  instrumento_monetario INTEGER,
  moneda INTEGER,
  monto_operacion NUMERIC(18,2)
);

ALTER TABLE informe_venta_registros
  ALTER COLUMN tipo_actividad SET DEFAULT 'VEH';

ALTER TABLE informe_venta_registros
  ADD COLUMN IF NOT EXISTS marca_fabricante VARCHAR(40);

ALTER TABLE informe_venta_registros
  ADD COLUMN IF NOT EXISTS modelo VARCHAR(40);

ALTER TABLE informe_venta_registros
  ADD COLUMN IF NOT EXISTS anio_vehiculo INTEGER;

ALTER TABLE informe_venta_registros
  ADD COLUMN IF NOT EXISTS vin VARCHAR(20);

ALTER TABLE informe_venta_registros
  ADD COLUMN IF NOT EXISTS repuve VARCHAR(8);

ALTER TABLE informe_venta_registros
  ADD COLUMN IF NOT EXISTS placas VARCHAR(12);

ALTER TABLE informe_venta_registros
  ADD COLUMN IF NOT EXISTS forma_pago INTEGER;

CREATE INDEX IF NOT EXISTS idx_informe_venta_report_upload_id
  ON informe_venta_registros(report_upload_id);

CREATE INDEX IF NOT EXISTS idx_informe_venta_uploaded_by_user_id
  ON informe_venta_registros(uploaded_by_user_id);

CREATE INDEX IF NOT EXISTS idx_informe_venta_company_id
  ON informe_venta_registros(company_id);

CREATE INDEX IF NOT EXISTS idx_informe_venta_uploaded_at
  ON informe_venta_registros(uploaded_at);

CREATE INDEX IF NOT EXISTS idx_informe_venta_mes_reporte
  ON informe_venta_registros(mes_reporte);

CREATE INDEX IF NOT EXISTS idx_informe_venta_periodo_afectacion
  ON informe_venta_registros(anio_afectacion, mes_afectacion);

CREATE TABLE IF NOT EXISTS sales_xml_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_upload_id UUID NOT NULL REFERENCES report_uploads(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id),
  generated_by_user_id UUID NOT NULL REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  mes_afectacion INTEGER NOT NULL,
  anio_afectacion INTEGER NOT NULL,
  tipo_actividad VARCHAR(10) NOT NULL DEFAULT 'VEH',
  xls_headers JSONB NOT NULL,
  rows_exported INTEGER NOT NULL DEFAULT 0,
  xml_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_xml_exports_report_upload_id
  ON sales_xml_exports(report_upload_id);

CREATE INDEX IF NOT EXISTS idx_sales_xml_exports_company_id
  ON sales_xml_exports(company_id);

CREATE INDEX IF NOT EXISTS idx_sales_xml_exports_generated_by_user_id
  ON sales_xml_exports(generated_by_user_id);

CREATE INDEX IF NOT EXISTS idx_sales_xml_exports_created_at
  ON sales_xml_exports(created_at);
