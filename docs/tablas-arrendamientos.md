# Tablas De Arrendamientos

Documento informativo para el flujo de arrendamientos (`ARI`).

Objetivo:
- dejar documentado el origen del esquema
- separar claramente arrendamientos de creditos y ventas
- identificar las tablas comunes y las exclusivas de arrendamientos

## Origen del esquema

Archivo fuente revisado:
- `C:\Users\manuel.avila.ADAUTOCOM\Downloads\informeArrendamiento.xls`

Hojas relevantes:
- `Informe`: contiene el encabezado operativo real y los registros de carga
- `Hoja3`: contiene referencias historicas de tipos SQL y nombres legacy

Hallazgos clave:
- la hoja `Informe` trae `88` encabezados operativos
- `ClaveActividad` ya viene como `ARI`
- el layout **no coincide** con ventas ni con creditos
- el flujo anterior de arrendamientos estaba heredando columnas de creditos que no existen en este XLS

## Tablas comunes

Estas tablas siguen siendo compartidas por todos los tipos de informe:

- `users`
- `companies`
- `report_uploads`

Nota:
- `report_uploads` se mantiene como tabla comun de control y bitacora
- lo especifico del detalle de arrendamientos vive en su propia tabla

## Tablas exclusivas de arrendamientos

### 1. `informe_arrendamiento_registros`

Tabla detalle exclusiva para los registros cargados desde la hoja `Informe`.

Campos de control:
- `id`
- `report_upload_id`
- `uploaded_by_user_id`
- `company_id`
- `uploaded_at`
- `mes_afectacion`
- `anio_afectacion`
- `tipo_actividad`

Campos del XLS:
- `mes_reporte`
- `clave_sujeto_obligado`
- `clave_actividad`
- `referencia_aviso`
- `folio_modificatorio`
- `descripcion_mod`
- `prioridad`
- `tipo_alerta`
- `descripcion_alerta`
- `tipo_persona_objeto_aviso`
- `nombre_objeto_aviso`
- `ape_paterno_objeto_aviso`
- `ape_materno_objeto_aviso`
- `fecha_nacimiento_objeto_aviso`
- `rfc_objeto_aviso`
- `curp_objeto_aviso`
- `pais_nacionalidad_objeto_aviso`
- `actividad_economica_objeto_aviso`
- `denominacion_razon_moral`
- `fecha_constitucion_moral`
- `rfc_moral`
- `pais_moral`
- `giro_mercantil_moral`
- `nombre_representante_apoderado`
- `ape_paterno_representantee_aapoderado`
- `ape_materno_representante_apoderado`
- `fecha_nacimiento_representante_aapoderado`
- `rfc_representante_apoderado`
- `curp_representante_aapoderado`
- `denominacion_razon_fideicomiso`
- `rfc_fideicomiso`
- `identificador_fideicomiso`
- `nombre_apoderado_delegado`
- `ape_paterno_apoderado_delegado`
- `ape_materno_apoderado_delegado`
- `fecha_nacimiento_apoderado_delegado`
- `rfc_aapoderado_delegado`
- `curp_apoderado_delegado`
- `tipo_domicilio_aviso`
- `colonia_aviso_nacional`
- `calle_aviso_nacional`
- `numero_ext_aviso_nacional`
- `numero_int_aviso_nacional`
- `codigo_postal_aviso_nacional`
- `pais_aviso_extranjero`
- `estadoprovincia_aviso_extranjero`
- `ciudad_poblacion_aviso_extranjero`
- `colonia_aviso_extranjero`
- `calle_aviso_extranjero`
- `numero_ext_aviso_extranjero`
- `numero_int_aviso_extranjero`
- `codigo_postal_aviso_extranjero`
- `telefono_clave_pais_aviso`
- `numero_telefono_aviso`
- `correo_electronico_aviso`
- `tipo_persona_beneficiario`
- `nombre_beneficiario`
- `ape_paterno_beneficiario`
- `ape_materno_beneficiario`
- `fecha_nacimiento_beneficiario`
- `rfc_beneficiario`
- `curp_beneficiario`
- `pais_nacionalidad_beneficiario`
- `denominacion_razon_moral_beneficiario`
- `fecha_constitucion_moral_beneficiario`
- `rfc_moral_beneficiario`
- `pais_moral_beneficiario`
- `giromercantil_moral_beneficiario`
- `denominacion_razon_fideicomiso_beneficiario`
- `rfc_fideicomiso_beneficiario`
- `id_fideicomiso_beneficiario`
- `fecha_operacion`
- `tipo_operacion`
- `fecha_inicio`
- `fecha_termino`
- `tipo_inmueble`
- `valor_avaluo_catastral`
- `colonia_inmueble`
- `calle_inmueble`
- `numero_exterior_inmueble`
- `numero_interior_inmueble`
- `codigo_postal_inmueble`
- `folio_real`
- `fecha_pago`
- `forma_pago`
- `instrumento_monetario`
- `moneda`
- `monto_operacion`

### 2. `arrend_xml_exports`

Tabla reservada para el momento en que se active la generacion XML de arrendamientos.

Hoy queda separada de:
- `credit_xml_exports`
- `sales_xml_exports`

## Diferencias importantes contra otros esquemas

### No deben heredarse de creditos

Estos campos estaban en la copia inicial y **no forman parte** del encabezado operativo actual de arrendamientos:
- `tipo_garantia`
- `descripcion_garantia`
- `tipo_persona`
- `nombre`
- `apellido_paterno`
- `apellido_materno`
- `fecha_nacimiento`
- `rfc_garante`
- `curp_garante`
- `denominacion_razon_moral_garante`
- `fecha_constitucion_moral_garante`
- `rfc_moral_garante`
- `denominacion_razon_fide_garante`
- `rfc_fide_garante`
- `identificador_fideicomiso_fide_garante`

### No deben heredarse de ventas

Estos campos tampoco aparecen en el layout operativo de arrendamientos:
- `marca_fabricante`
- `modelo`
- `anio_vehiculo`
- `vin`
- `repuve`
- `placas`

## Mapeo de hoja operativa

Archivo backend asociado:
- [leaseReportMapping.ts](../backend/src/services/leaseReportMapping.ts)

SQL asociado:
- [informe_arrendamientos.sql](../backend/database/informe_arrendamientos.sql)

## Estado actual

- arrendamientos ya tiene tabla propia
- arrendamientos ya tiene mapeo propio de columnas
- el flujo de carga deja de depender del layout de creditos
- la generacion XML de arrendamientos sigue pendiente de definicion especifica del esquema SAT/UIF
