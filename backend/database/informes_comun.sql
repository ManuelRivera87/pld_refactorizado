CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS report_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  company_id UUID NOT NULL REFERENCES companies(id),
  uploaded_by_user_id UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  mes_afectacion INTEGER,
  anio_afectacion INTEGER,
  tipo_actividad VARCHAR(10) NOT NULL DEFAULT 'MPC',
  rows_inserted INTEGER NOT NULL DEFAULT 0,
  fields_inserted INTEGER NOT NULL DEFAULT 0
);

ALTER TABLE report_uploads
  ADD COLUMN IF NOT EXISTS mes_afectacion INTEGER;

ALTER TABLE report_uploads
  ADD COLUMN IF NOT EXISTS anio_afectacion INTEGER;

ALTER TABLE report_uploads
  ADD COLUMN IF NOT EXISTS tipo_actividad VARCHAR(10) NOT NULL DEFAULT 'MPC';

CREATE INDEX IF NOT EXISTS idx_report_uploads_company_id
  ON report_uploads(company_id);

CREATE INDEX IF NOT EXISTS idx_report_uploads_uploaded_by_user_id
  ON report_uploads(uploaded_by_user_id);

CREATE INDEX IF NOT EXISTS idx_report_uploads_uploaded_at
  ON report_uploads(uploaded_at);

CREATE INDEX IF NOT EXISTS idx_report_uploads_periodo_afectacion
  ON report_uploads(anio_afectacion, mes_afectacion);
