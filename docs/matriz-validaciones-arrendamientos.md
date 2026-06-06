# Matriz De Validaciones - Arrendamientos

Documento operativo para comparar el estado actual de las validaciones del flujo `ARI` contra los huecos detectados para una alineacion mas estricta con SAT/UIF.

No modifica codigo ni base de datos. Sirve como backlog de implementacion.

## Fuentes de referencia

- Portal SAT/PLD - Arrendamiento de inmuebles: https://sppld.sat.gob.mx/pld/interiores/arrendamiento.html
- Resolucion de avisos e informes 30 agosto 2013, Anexo 15: https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/resolucion_avisos_informes.pdf
- Compilado de formatos oficiales 02 octubre 2019: https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/compilado_formatosofic_02oct2019.pdf
- Compilado de formatos oficiales 24 mayo 2021: https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/compilado_formatosofic_24mayo2021.pdf
- Reforma de formatos 24 julio 2014: https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/reforma_formatoavisosav_dof24jul14.pdf

## Convenciones

- `OK`: la validacion actual cubre razonablemente el requisito operativo detectado.
- `Parcial`: existe una validacion base, pero falta una regla de consistencia o catalogo.
- `Pendiente`: no se detecto validacion suficiente.
- Prioridad:
  - `Alta`: puede provocar rechazo SAT/XML o dejar pasar datos inconsistentes relevantes.
  - `Media`: mejora consistencia y calidad de datos, pero no necesariamente rompe siempre el formato.
  - `Baja`: ajuste fino o validacion dependiente de confirmar criterio oficial exacto.

## Matriz

| Campo | Validacion actual | Validacion faltante | Prioridad |
| --- | --- | --- | --- |
| `mes_reporte` | OK. Formato `AAAAMM`. | Sin hueco material detectado. | Baja |
| `clave_sujeto_obligado` | OK. Patron RFC 12-13. | Sin hueco material detectado. | Baja |
| `clave_actividad` | OK. Longitud 3 y valor fijo `ARI`. | Sin hueco material detectado. | Baja |
| `referencia_aviso` | OK. Patron y longitud. | Sin hueco material detectado. | Baja |
| `folio_modificatorio` | Parcial. Solo valida formato si viene. | Hacer obligatoria la pareja con `descripcion_mod` cuando el aviso sea modificatorio. | Alta |
| `descripcion_mod` | Parcial. Solo valida formato si viene. | Hacer obligatoria la pareja con `folio_modificatorio` cuando el aviso sea modificatorio. | Alta |
| `prioridad` | OK. Solo acepta `1` o `2`. | Sin hueco material detectado. | Baja |
| `tipo_alerta` | Parcial. Solo acepta 3-4 digitos. | Validar contra catalogo oficial SAT/UIF, no solo por longitud. | Alta |
| `descripcion_alerta` | OK. Longitud y patron. | Sin hueco material detectado. | Baja |
| `tipo_persona_objeto_aviso` | OK. Enum `1, 2, 3`. | Rechazar datos capturados en bloques no aplicables. | Media |
| `nombre_objeto_aviso` | OK para persona fisica. | Rechazar valor cuando el tipo de persona no sea fisica. | Media |
| `ape_paterno_objeto_aviso` | OK para persona fisica. | Rechazar valor cuando el tipo de persona no sea fisica. | Media |
| `ape_materno_objeto_aviso` | OK para persona fisica. | Rechazar valor cuando el tipo de persona no sea fisica. | Media |
| `fecha_nacimiento_objeto_aviso` | OK para persona fisica. | Rechazar valor cuando el tipo de persona no sea fisica. | Media |
| `rfc_objeto_aviso` | OK. Exige RFC o CURP en persona fisica y valida patron. | Rechazar valor cuando el tipo de persona no sea fisica. | Media |
| `curp_objeto_aviso` | OK. Exige RFC o CURP en persona fisica y valida patron. | Rechazar valor cuando el tipo de persona no sea fisica. | Media |
| `pais_nacionalidad_objeto_aviso` | OK para persona fisica. | Rechazar valor cuando el tipo de persona no sea fisica. | Media |
| `actividad_economica_objeto_aviso` | OK para persona fisica. | Rechazar valor cuando el tipo de persona no sea fisica. | Media |
| `denominacion_razon_moral` | OK para persona moral. | Rechazar valor cuando el tipo de persona no sea moral. | Media |
| `fecha_constitucion_moral` | OK para persona moral. | Rechazar valor cuando el tipo de persona no sea moral. | Media |
| `rfc_moral` | OK para persona moral. | Rechazar valor cuando el tipo de persona no sea moral. | Media |
| `pais_moral` | OK para persona moral. | Rechazar valor cuando el tipo de persona no sea moral. | Media |
| `giro_mercantil_moral` | OK para persona moral. | Rechazar valor cuando el tipo de persona no sea moral. | Media |
| `nombre_representante_apoderado` | OK para persona moral. | Rechazar valor cuando el tipo de persona no sea moral. | Media |
| `ape_paterno_representantee_aapoderado` | OK para persona moral. | Rechazar valor cuando el tipo de persona no sea moral. | Media |
| `ape_materno_representante_apoderado` | OK para persona moral. | Rechazar valor cuando el tipo de persona no sea moral. | Media |
| `fecha_nacimiento_representante_aapoderado` | OK para persona moral. | Rechazar valor cuando el tipo de persona no sea moral. | Media |
| `rfc_representante_apoderado` | OK. Exige RFC o CURP del representante en moral. | Rechazar valor cuando el tipo de persona no sea moral. | Media |
| `curp_representante_aapoderado` | OK. Exige RFC o CURP del representante en moral. | Rechazar valor cuando el tipo de persona no sea moral. | Media |
| `denominacion_razon_fideicomiso` | OK para fideicomiso. | Rechazar valor cuando el tipo de persona no sea fideicomiso. | Media |
| `rfc_fideicomiso` | OK para fideicomiso. | Rechazar valor cuando el tipo de persona no sea fideicomiso. | Media |
| `identificador_fideicomiso` | OK para fideicomiso. | Rechazar valor cuando el tipo de persona no sea fideicomiso. | Media |
| `nombre_apoderado_delegado` | OK para fideicomiso. | Rechazar valor cuando el tipo de persona no sea fideicomiso. | Media |
| `ape_paterno_apoderado_delegado` | OK para fideicomiso. | Rechazar valor cuando el tipo de persona no sea fideicomiso. | Media |
| `ape_materno_apoderado_delegado` | OK para fideicomiso. | Rechazar valor cuando el tipo de persona no sea fideicomiso. | Media |
| `fecha_nacimiento_apoderado_delegado` | OK para fideicomiso. | Rechazar valor cuando el tipo de persona no sea fideicomiso. | Media |
| `rfc_aapoderado_delegado` | OK. Exige RFC o CURP del apoderado en fideicomiso. | Rechazar valor cuando el tipo de persona no sea fideicomiso. | Media |
| `curp_apoderado_delegado` | OK. Exige RFC o CURP del apoderado en fideicomiso. | Rechazar valor cuando el tipo de persona no sea fideicomiso. | Media |
| `tipo_domicilio_aviso` | OK. Enum `1, 2`. | Rechazar captura simultanea de domicilio nacional y extranjero. | Media |
| `colonia_aviso_nacional` | OK para domicilio nacional. | Rechazar valor cuando el domicilio sea extranjero. | Media |
| `calle_aviso_nacional` | OK para domicilio nacional. | Rechazar valor cuando el domicilio sea extranjero. | Media |
| `numero_ext_aviso_nacional` | OK para domicilio nacional. | Rechazar valor cuando el domicilio sea extranjero. | Media |
| `numero_int_aviso_nacional` | OK. Opcional en nacional. | Rechazar valor cuando el domicilio sea extranjero. | Baja |
| `codigo_postal_aviso_nacional` | OK para domicilio nacional. | Rechazar valor cuando el domicilio sea extranjero. | Media |
| `pais_aviso_extranjero` | OK para domicilio extranjero. | Rechazar valor cuando el domicilio sea nacional. | Media |
| `estadoprovincia_aviso_extranjero` | OK para domicilio extranjero. | Rechazar valor cuando el domicilio sea nacional. | Media |
| `ciudad_poblacion_aviso_extranjero` | OK para domicilio extranjero. | Rechazar valor cuando el domicilio sea nacional. | Media |
| `colonia_aviso_extranjero` | OK para domicilio extranjero. | Rechazar valor cuando el domicilio sea nacional. | Media |
| `calle_aviso_extranjero` | OK para domicilio extranjero. | Rechazar valor cuando el domicilio sea nacional. | Media |
| `numero_ext_aviso_extranjero` | OK para domicilio extranjero. | Rechazar valor cuando el domicilio sea nacional. | Media |
| `numero_int_aviso_extranjero` | OK. Opcional en extranjero. | Rechazar valor cuando el domicilio sea nacional. | Baja |
| `codigo_postal_aviso_extranjero` | OK para domicilio extranjero. | Rechazar valor cuando el domicilio sea nacional. | Media |
| `telefono_clave_pais_aviso` | OK. Pais de 2 letras. | Sin hueco material detectado. | Baja |
| `numero_telefono_aviso` | OK. 10-12 digitos. | Sin hueco material detectado. | Baja |
| `correo_electronico_aviso` | Parcial. Se valida formato y se exige telefono si existe correo. | Confirmar si tambien debe rechazarse correo en ciertos escenarios sin telefono internacional separado. | Baja |
| `tipo_persona_beneficiario` | Parcial. Se exige solo si existen datos del beneficiario. | Rechazar datos de bloques no aplicables y capturas mezcladas. | Media |
| `nombre_beneficiario` | OK para beneficiario fisico. | Rechazar valor cuando el tipo de beneficiario no sea fisico. | Media |
| `ape_paterno_beneficiario` | OK para beneficiario fisico. | Rechazar valor cuando el tipo de beneficiario no sea fisico. | Media |
| `ape_materno_beneficiario` | OK para beneficiario fisico. | Rechazar valor cuando el tipo de beneficiario no sea fisico. | Media |
| `fecha_nacimiento_beneficiario` | OK para beneficiario fisico. | Rechazar valor cuando el tipo de beneficiario no sea fisico. | Media |
| `rfc_beneficiario` | OK. Exige RFC o CURP si el beneficiario es fisico. | Confirmar si el SAT exige ambos o solo uno en el anexo vigente. | Media |
| `curp_beneficiario` | OK. Exige RFC o CURP si el beneficiario es fisico. | Confirmar si el SAT exige ambos o solo uno en el anexo vigente. | Media |
| `pais_nacionalidad_beneficiario` | OK para beneficiario fisico. | Confirmar si sigue siendo obligatorio u opcional en la version vigente. | Baja |
| `denominacion_razon_moral_beneficiario` | OK para beneficiario moral. | Rechazar valor cuando el tipo de beneficiario no sea moral. | Media |
| `fecha_constitucion_moral_beneficiario` | OK para beneficiario moral. | Rechazar valor cuando el tipo de beneficiario no sea moral. | Media |
| `rfc_moral_beneficiario` | OK para beneficiario moral. | Rechazar valor cuando el tipo de beneficiario no sea moral. | Media |
| `pais_moral_beneficiario` | OK para beneficiario moral. | Rechazar valor cuando el tipo de beneficiario no sea moral. | Media |
| `giromercantil_moral_beneficiario` | Parcial. Se valida formato si viene. | Confirmar si el anexo vigente lo exige obligatorio para moral en arrendamiento. | Baja |
| `denominacion_razon_fideicomiso_beneficiario` | OK para beneficiario fideicomiso. | Rechazar valor cuando el tipo de beneficiario no sea fideicomiso. | Media |
| `rfc_fideicomiso_beneficiario` | OK para beneficiario fideicomiso. | Rechazar valor cuando el tipo de beneficiario no sea fideicomiso. | Media |
| `id_fideicomiso_beneficiario` | OK para beneficiario fideicomiso. | Rechazar valor cuando el tipo de beneficiario no sea fideicomiso. | Media |
| `fecha_operacion` | OK. Fecha `AAAAMMDD`. | Validar coherencia cronologica con `fecha_pago`, `fecha_inicio` y `fecha_termino`. | Media |
| `tipo_operacion` | Parcial. Solo 3-4 digitos. | Validar contra catalogo oficial SAT/UIF de operaciones aplicables a ARI. | Alta |
| `fecha_inicio` | OK. Fecha `AAAAMMDD`. | Validar que no sea mayor que `fecha_termino`. | Alta |
| `fecha_termino` | OK. Fecha `AAAAMMDD`. | Validar que no sea menor que `fecha_inicio`. | Alta |
| `tipo_inmueble` | Parcial. Solo 1-3 digitos. | Validar contra catalogo oficial SAT/UIF para inmuebles en ARI. | Alta |
| `valor_avaluo_catastral` | OK. Monto con 2 decimales. | Confirmar si existen escenarios donde el campo pueda ser opcional por tipo de inmueble u operacion. | Baja |
| `colonia_inmueble` | OK. Patron y longitud. | Sin hueco material detectado. | Baja |
| `calle_inmueble` | OK. Patron y longitud. | Sin hueco material detectado. | Baja |
| `numero_exterior_inmueble` | OK. Patron y longitud. | Sin hueco material detectado. | Baja |
| `numero_interior_inmueble` | OK. Opcional. | Sin hueco material detectado. | Baja |
| `codigo_postal_inmueble` | OK. CP de 5 digitos. | Sin hueco material detectado. | Baja |
| `folio_real` | Parcial. Acepta 1-200. | Confirmar longitud exacta vigente del anexo para no endurecer ni relajar de mas. | Baja |
| `fecha_pago` | OK. Fecha `AAAAMMDD`. | Validar coherencia cronologica frente a `fecha_operacion`. | Media |
| `forma_pago` | Parcial. Solo 1-3 digitos. | Validar contra catalogo oficial SAT/UIF. | Alta |
| `instrumento_monetario` | Parcial. Obligatorio cuando `forma_pago != 3`. | Validar contra catalogo oficial y rechazar valor cuando `forma_pago = 3`, si asi lo confirma el criterio SAT aplicable a ARI. | Alta |
| `moneda` | Parcial. Solo 1-3 digitos. | Validar contra catalogo oficial SAT/UIF. | Alta |
| `monto_operacion` | OK. Monto con 2 decimales. | Sin hueco material detectado. | Baja |

## Backlog sugerido de implementacion

1. Alta prioridad
- Pareja obligatoria `folio_modificatorio` + `descripcion_mod`
- Catalogos oficiales para `tipo_alerta`, `tipo_operacion`, `tipo_inmueble`, `forma_pago`, `instrumento_monetario`, `moneda`
- Coherencia `fecha_inicio <= fecha_termino`
- Regla de `instrumento_monetario` cuando `forma_pago = 3`, si se confirma en criterio SAT aplicable

2. Media prioridad
- Rechazar mezcla de bloques de tipo de persona
- Rechazar mezcla de domicilio nacional/extranjero
- Coherencia de fechas de operacion y pago
- Rechazar datos capturados en bloques no aplicables del beneficiario

3. Baja prioridad
- Ajustes finos de obligatoriedad historica o variable:
  - `pais_nacionalidad_beneficiario`
  - `giromercantil_moral_beneficiario`
  - longitud exacta de `folio_real`
  - opcionalidad de `valor_avaluo_catastral` segun escenario exacto

## Referencias internas

- Validador actual: [leaseReportValidation.ts](../backend/src/services/leaseReportValidation.ts)
- Mapeo de columnas: [leaseReportMapping.ts](../backend/src/services/leaseReportMapping.ts)
- Tabla y esquema local: [informe_arrendamientos.sql](../backend/database/informe_arrendamientos.sql)
