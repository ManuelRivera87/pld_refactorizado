CREATE TABLE IF NOT EXISTS informe_arrendamiento_registros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_upload_id UUID REFERENCES report_uploads(id),
  uploaded_by_user_id UUID NOT NULL REFERENCES users(id),
  company_id UUID NOT NULL REFERENCES companies(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mes_afectacion INTEGER,
  anio_afectacion INTEGER,
  tipo_actividad VARCHAR(10) NOT NULL DEFAULT 'ARI',
  mes_reporte INTEGER,
  clave_sujeto_obligado VARCHAR(20),
  clave_actividad VARCHAR(10),
  referencia_aviso VARCHAR(50),
  folio_modificatorio VARCHAR(50),
  descripcion_mod TEXT,
  prioridad INTEGER,
  tipo_alerta INTEGER,
  descripcion_alerta TEXT,
  tipo_persona_objeto_aviso INTEGER,
  nombre_objeto_aviso VARCHAR(200),
  ape_paterno_objeto_aviso VARCHAR(200),
  ape_materno_objeto_aviso VARCHAR(200),
  fecha_nacimiento_objeto_aviso DATE,
  rfc_objeto_aviso VARCHAR(20),
  curp_objeto_aviso VARCHAR(20),
  pais_nacionalidad_objeto_aviso VARCHAR(10),
  actividad_economica_objeto_aviso VARCHAR(20),
  denominacion_razon_moral VARCHAR(255),
  fecha_constitucion_moral DATE,
  rfc_moral VARCHAR(20),
  pais_moral VARCHAR(10),
  giro_mercantil_moral VARCHAR(20),
  nombre_representante_apoderado VARCHAR(200),
  ape_paterno_representantee_aapoderado VARCHAR(200),
  ape_materno_representante_apoderado VARCHAR(200),
  fecha_nacimiento_representante_aapoderado DATE,
  rfc_representante_apoderado VARCHAR(20),
  curp_representante_aapoderado VARCHAR(20),
  denominacion_razon_fideicomiso VARCHAR(255),
  rfc_fideicomiso VARCHAR(20),
  identificador_fideicomiso VARCHAR(100),
  nombre_apoderado_delegado VARCHAR(200),
  ape_paterno_apoderado_delegado VARCHAR(200),
  ape_materno_apoderado_delegado VARCHAR(200),
  fecha_nacimiento_apoderado_delegado DATE,
  rfc_aapoderado_delegado VARCHAR(20),
  curp_apoderado_delegado VARCHAR(20),
  tipo_domicilio_aviso INTEGER,
  colonia_aviso_nacional VARCHAR(255),
  calle_aviso_nacional VARCHAR(255),
  numero_ext_aviso_nacional VARCHAR(60),
  numero_int_aviso_nacional VARCHAR(60),
  codigo_postal_aviso_nacional VARCHAR(10),
  pais_aviso_extranjero VARCHAR(10),
  estadoprovincia_aviso_extranjero VARCHAR(150),
  ciudad_poblacion_aviso_extranjero VARCHAR(150),
  colonia_aviso_extranjero VARCHAR(255),
  calle_aviso_extranjero VARCHAR(255),
  numero_ext_aviso_extranjero VARCHAR(60),
  numero_int_aviso_extranjero VARCHAR(60),
  codigo_postal_aviso_extranjero VARCHAR(20),
  telefono_clave_pais_aviso VARCHAR(10),
  numero_telefono_aviso VARCHAR(30),
  correo_electronico_aviso VARCHAR(255),
  tipo_persona_beneficiario INTEGER,
  nombre_beneficiario VARCHAR(200),
  ape_paterno_beneficiario VARCHAR(200),
  ape_materno_beneficiario VARCHAR(200),
  fecha_nacimiento_beneficiario DATE,
  rfc_beneficiario VARCHAR(20),
  curp_beneficiario VARCHAR(20),
  pais_nacionalidad_beneficiario VARCHAR(10),
  denominacion_razon_moral_beneficiario VARCHAR(255),
  fecha_constitucion_moral_beneficiario DATE,
  rfc_moral_beneficiario VARCHAR(20),
  pais_moral_beneficiario VARCHAR(10),
  giromercantil_moral_beneficiario VARCHAR(20),
  denominacion_razon_fideicomiso_beneficiario VARCHAR(255),
  rfc_fideicomiso_beneficiario VARCHAR(20),
  id_fideicomiso_beneficiario VARCHAR(100),
  fecha_operacion DATE,
  tipo_operacion INTEGER,
  fecha_inicio DATE,
  fecha_termino DATE,
  tipo_inmueble INTEGER,
  valor_avaluo_catastral NUMERIC(18,2),
  colonia_inmueble VARCHAR(255),
  calle_inmueble VARCHAR(255),
  numero_exterior_inmueble VARCHAR(60),
  numero_interior_inmueble VARCHAR(60),
  codigo_postal_inmueble VARCHAR(10),
  folio_real VARCHAR(100),
  fecha_pago DATE,
  forma_pago INTEGER,
  instrumento_monetario INTEGER,
  moneda INTEGER,
  monto_operacion NUMERIC(18,2)
);

ALTER TABLE informe_arrendamiento_registros
  ADD COLUMN IF NOT EXISTS report_upload_id UUID REFERENCES report_uploads(id);

ALTER TABLE informe_arrendamiento_registros
  ADD COLUMN IF NOT EXISTS mes_afectacion INTEGER;

ALTER TABLE informe_arrendamiento_registros
  ADD COLUMN IF NOT EXISTS anio_afectacion INTEGER;

ALTER TABLE informe_arrendamiento_registros
  ADD COLUMN IF NOT EXISTS tipo_actividad VARCHAR(10) NOT NULL DEFAULT 'ARI';

ALTER TABLE informe_arrendamiento_registros
  ADD COLUMN IF NOT EXISTS giromercantil_moral_beneficiario VARCHAR(20);

ALTER TABLE informe_arrendamiento_registros
  ADD COLUMN IF NOT EXISTS fecha_operacion DATE;

ALTER TABLE informe_arrendamiento_registros
  ADD COLUMN IF NOT EXISTS fecha_inicio DATE;

ALTER TABLE informe_arrendamiento_registros
  ADD COLUMN IF NOT EXISTS fecha_termino DATE;

ALTER TABLE informe_arrendamiento_registros
  ADD COLUMN IF NOT EXISTS colonia_inmueble VARCHAR(255);

ALTER TABLE informe_arrendamiento_registros
  ADD COLUMN IF NOT EXISTS calle_inmueble VARCHAR(255);

ALTER TABLE informe_arrendamiento_registros
  ADD COLUMN IF NOT EXISTS numero_exterior_inmueble VARCHAR(60);

ALTER TABLE informe_arrendamiento_registros
  ADD COLUMN IF NOT EXISTS numero_interior_inmueble VARCHAR(60);

ALTER TABLE informe_arrendamiento_registros
  ADD COLUMN IF NOT EXISTS codigo_postal_inmueble VARCHAR(10);

ALTER TABLE informe_arrendamiento_registros
  ADD COLUMN IF NOT EXISTS forma_pago INTEGER;

CREATE INDEX IF NOT EXISTS idx_informe_arrendamiento_report_upload_id
  ON informe_arrendamiento_registros(report_upload_id);

CREATE INDEX IF NOT EXISTS idx_informe_arrendamiento_uploaded_by_user_id
  ON informe_arrendamiento_registros(uploaded_by_user_id);

CREATE INDEX IF NOT EXISTS idx_informe_arrendamiento_company_id
  ON informe_arrendamiento_registros(company_id);

CREATE INDEX IF NOT EXISTS idx_informe_arrendamiento_uploaded_at
  ON informe_arrendamiento_registros(uploaded_at);

CREATE INDEX IF NOT EXISTS idx_informe_arrendamiento_mes_reporte
  ON informe_arrendamiento_registros(mes_reporte);

CREATE INDEX IF NOT EXISTS idx_informe_arrendamiento_periodo_afectacion
  ON informe_arrendamiento_registros(anio_afectacion, mes_afectacion);

CREATE INDEX IF NOT EXISTS idx_informe_arrendamiento_fecha_operacion
  ON informe_arrendamiento_registros(fecha_operacion);

CREATE TABLE IF NOT EXISTS arrend_xml_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_upload_id UUID NOT NULL REFERENCES report_uploads(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id),
  generated_by_user_id UUID NOT NULL REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  file_path TEXT NOT NULL,
  mes_afectacion INTEGER NOT NULL,
  anio_afectacion INTEGER NOT NULL,
  tipo_actividad VARCHAR(10) NOT NULL DEFAULT 'ARI',
  xls_headers JSONB NOT NULL,
  rows_exported INTEGER NOT NULL DEFAULT 0,
  xml_content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_arrend_xml_exports_report_upload_id
  ON arrend_xml_exports(report_upload_id);

CREATE INDEX IF NOT EXISTS idx_arrend_xml_exports_company_id
  ON arrend_xml_exports(company_id);

CREATE INDEX IF NOT EXISTS idx_arrend_xml_exports_generated_by_user_id
  ON arrend_xml_exports(generated_by_user_id);

CREATE INDEX IF NOT EXISTS idx_arrend_xml_exports_created_at
  ON arrend_xml_exports(created_at);
