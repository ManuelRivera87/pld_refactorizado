# Reglas De Campos SAT/UIF - Ventas De Vehiculos

Documento informativo de referencia para el esquema de ventas de vehiculos.

No modifica codigo, base de datos ni flujo del sistema. Su objetivo es dejar por escrito la lectura operativa de obligatoriedad de campos con base en formatos oficiales SAT/UIF consultados.

## Fuentes oficiales consultadas

- Portal SAT/PLD - Vehiculos: https://sppld.sat.gob.mx/pld/interiores/vehiculos.html
- Compilado de formatos oficiales 02 octubre 2019: https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/compilado_formatosofic_02oct2019.pdf
- Compilado de formatos oficiales 24 mayo 2021: https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/compilado_formatosofic_24mayo2021.pdf
- Resolucion de avisos e informes 30 agosto 2013: https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/resolucion_avisos_informes.pdf

## Criterio de lectura

- `Obligatorio`: el formato oficial lo marca como requerido para el bloque correspondiente.
- `Condicional`: depende del tipo de persona, domicilio, aviso modificatorio o forma de pago.
- `Opcional`: el formato oficial permite omitirlo.

## Nota operativa

- En el proyecto actual, la clave de actividad usada para ventas es `VEH`.
- La documentacion oficial consultada muestra `repuve` y `placas` como obligatorios para vehiculo terrestre.
- En documentos oficiales historicos aparece `nombre_sucursal` como obligatorio en ventas; si la plantilla operativa no lo incluye, conviene validar contra el anexo vigente antes de endurecer o relajar reglas en codigo.

## 1. Encabezado general del aviso

| Campo sistema | Campo SAT/XML | Obligatoriedad | Regla resumida |
| --- | --- | --- | --- |
| `mes_reporte` | `<mes_reportado>` | Obligatorio | Formato `AAAAMM`. |
| `clave_sujeto_obligado` | `<clave_sujeto_obligado>` | Obligatorio | RFC/clave del sujeto obligado, 12-13 caracteres. |
| `clave_actividad` | `<clave_actividad>` | Obligatorio | Alfanumerico de 3 posiciones. |
| `referencia_aviso` | `<referencia_aviso>` | Obligatorio | 1-14 caracteres. |
| `folio_modificatorio` | `<folio_modificacion>` | Condicional | Solo cuando el aviso es modificatorio. |
| `descripcion_mod` | `<descripcion_modificacion>` | Condicional | Solo cuando el aviso es modificatorio. |
| `prioridad` | `<prioridad>` | Obligatorio | Valor de un digito. |
| `tipo_alerta` | `<tipo_alerta>` | Obligatorio | 3-4 digitos. |
| `descripcion_alerta` | `<descripcion_alerta>` | Obligatorio | 1-3000 caracteres. |

## 2. Persona objeto del aviso

### Campo selector

| Campo sistema | Campo SAT/XML | Obligatoriedad | Regla resumida |
| --- | --- | --- | --- |
| `tipo_persona_objeto_aviso` | Bloque `<tipo_persona>` | Obligatorio | Define si el cliente/usuario es persona fisica, moral o fideicomiso. |

### Si `tipo_persona_objeto_aviso = 1` (persona fisica)

| Campo sistema | Campo SAT/XML | Obligatoriedad |
| --- | --- | --- |
| `nombre_objeto_aviso` | `<nombre>` | Obligatorio |
| `ape_paterno_objeto_aviso` | `<apellido_paterno>` | Obligatorio |
| `ape_materno_objeto_aviso` | `<apellido_materno>` | Obligatorio |
| `fecha_nacimiento_objeto_aviso` | `<fecha_nacimiento>` | Obligatorio |
| `rfc_objeto_aviso` | `<rfc>` | Condicional |
| `curp_objeto_aviso` | `<curp>` | Condicional |
| `pais_nacionalidad_objeto_aviso` | `<pais_nacionalidad>` | Obligatorio |
| `actividad_economica_objeto_aviso` | `<actividad_economica>` | Obligatorio |

Nota: operativamente se suele exigir al menos `RFC` o `CURP`.

### Si `tipo_persona_objeto_aviso = 2` (persona moral)

| Campo sistema | Campo SAT/XML | Obligatoriedad |
| --- | --- | --- |
| `denominacion_razon_moral` | `<denominacion_razon>` | Obligatorio |
| `fecha_constitucion_moral` | `<fecha_constitucion>` | Obligatorio |
| `rfc_moral` | `<rfc>` | Obligatorio |
| `pais_moral` | `<pais>` | Obligatorio |
| `giro_mercantil_moral` | `<giro_mercantil>` | Obligatorio |
| `nombre_representante_apoderado` | `<nombre>` | Obligatorio |
| `ape_paterno_representantee_aapoderado` | `<apellido_paterno>` | Obligatorio |
| `ape_materno_representante_apoderado` | `<apellido_materno>` | Obligatorio |
| `fecha_nacimiento_representante_aapoderado` | `<fecha_nacimiento>` | Obligatorio |
| `rfc_representante_apoderado` | `<rfc>` | Condicional |
| `curp_representante_aapoderado` | `<curp>` | Condicional |

### Si `tipo_persona_objeto_aviso = 3` (fideicomiso)

| Campo sistema | Campo SAT/XML | Obligatoriedad |
| --- | --- | --- |
| `denominacion_razon_fideicomiso` | `<denominacion_razon>` | Obligatorio |
| `rfc_fideicomiso` | `<rfc>` | Obligatorio |
| `identificador_fideicomiso` | `<identificador_fideicomiso>` | Obligatorio |
| `nombre_apoderado_delegado` | `<nombre>` | Obligatorio |
| `ape_paterno_apoderado_delegado` | `<apellido_paterno>` | Obligatorio |
| `ape_materno_apoderado_delegado` | `<apellido_materno>` | Obligatorio |
| `fecha_nacimiento_apoderado_delegado` | `<fecha_nacimiento>` | Obligatorio |
| `rfc_aapoderado_delegado` | `<rfc>` | Condicional |
| `curp_apoderado_delegado` | `<curp>` | Condicional |

## 3. Domicilio del aviso

### Campo selector

| Campo sistema | Campo SAT/XML | Obligatoriedad |
| --- | --- | --- |
| `tipo_domicilio_aviso` | Bloque `<tipo_domicilio>` | Obligatorio |

### Si `tipo_domicilio_aviso = 1` (nacional)

| Campo sistema | Campo SAT/XML | Obligatoriedad |
| --- | --- | --- |
| `colonia_aviso_nacional` | `<colonia>` | Obligatorio |
| `calle_aviso_nacional` | `<calle>` | Obligatorio |
| `numero_ext_aviso_nacional` | `<numero_exterior>` | Obligatorio |
| `numero_int_aviso_nacional` | `<numero_interior>` | Opcional |
| `codigo_postal_aviso_nacional` | `<codigo_postal>` | Obligatorio |

### Si `tipo_domicilio_aviso = 2` (extranjero)

| Campo sistema | Campo SAT/XML | Obligatoriedad |
| --- | --- | --- |
| `pais_aviso_extranjero` | `<pais>` | Obligatorio |
| `estadoprovincia_aviso_extranjero` | `<estado_provincia>` | Obligatorio |
| `ciudad_poblacion_aviso_extranjero` | `<ciudad_poblacion>` | Obligatorio |
| `colonia_aviso_extranjero` | `<colonia>` | Obligatorio |
| `calle_aviso_extranjero` | `<calle>` | Obligatorio |
| `numero_ext_aviso_extranjero` | `<numero_exterior>` | Obligatorio |
| `numero_int_aviso_extranjero` | `<numero_interior>` | Opcional |
| `codigo_postal_aviso_extranjero` | `<codigo_postal>` | Obligatorio |

## 4. Telefono y correo

| Campo sistema | Campo SAT/XML | Obligatoriedad | Regla resumida |
| --- | --- | --- | --- |
| `telefono_clave_pais_aviso` | `<clave_pais>` | Obligatorio | Clave alfabetica de 2 posiciones. |
| `numero_telefono_aviso` | `<numero_telefono>` | Obligatorio | 10-12 digitos. |
| `correo_electronico_aviso` | `<correo_electronico>` | Opcional | Si se captura, debe cumplir patron de correo. |

## 5. Dueño beneficiario

El bloque oficial `<dueno_beneficiario>` aparece como `Opcional`. Si existe, sus subcampos internos pasan a ser obligatorios segun el tipo de persona.

### Campo selector

| Campo sistema | Campo SAT/XML | Obligatoriedad |
| --- | --- | --- |
| `tipo_persona_beneficiario` | Bloque `<tipo_persona>` | Condicional |

### Si `tipo_persona_beneficiario = 1` (persona fisica)

| Campo sistema | Campo SAT/XML | Obligatoriedad |
| --- | --- | --- |
| `nombre_beneficiario` | `<nombre>` | Obligatorio |
| `ape_paterno_beneficiario` | `<apellido_paterno>` | Obligatorio |
| `ape_materno_beneficiario` | `<apellido_materno>` | Obligatorio |
| `fecha_nacimiento_beneficiario` | `<fecha_nacimiento>` | Obligatorio |
| `rfc_beneficiario` | `<rfc>` | Obligatorio |
| `curp_beneficiario` | `<curp>` | Obligatorio |
| `pais_nacionalidad_beneficiario` | `<pais_nacionalidad>` | Opcional en referencias consultadas |

### Si `tipo_persona_beneficiario = 2` (persona moral)

| Campo sistema | Campo SAT/XML | Obligatoriedad |
| --- | --- | --- |
| `denominacion_razon_moral_beneficiario` | `<denominacion_razon>` | Obligatorio |
| `fecha_constitucion_moral_beneficiario` | `<fecha_constitucion>` | Obligatorio |
| `rfc_moral_beneficiario` | `<rfc>` | Obligatorio |
| `pais_moral_beneficiario` | `<pais>` | Obligatorio |

### Si `tipo_persona_beneficiario = 3` (fideicomiso)

| Campo sistema | Campo SAT/XML | Obligatoriedad |
| --- | --- | --- |
| `denominacion_razon_fideicomiso_beneficiario` | `<denominacion_razon>` | Obligatorio |
| `rfc_fideicomiso_beneficiario` | `<rfc>` | Obligatorio |
| `id_fideicomiso_beneficiario` | `<identificador_fideicomiso>` | Obligatorio |

## 6. Detalle especifico de ventas

### Datos de la operacion

| Campo sistema | Campo SAT/XML | Obligatoriedad | Regla resumida |
| --- | --- | --- | --- |
| `fecha` | `<fecha_operacion>` | Obligatorio | Fecha `AAAAMMDD`. |
| `codigo_postal_agencia` | `<codigo_postal>` | Obligatorio | Codigo postal del lugar donde se realizo la operacion. |
| `nombre_sucursal` | `<nombre_sucursal>` | Obligatorio en referencias historicas consultadas | Revisar anexo vigente de la plantilla operativa. |
| `tipo_operacion` | `<tipo_operacion>` | Obligatorio | 3-4 digitos. |

### Vehiculo terrestre

| Campo sistema | Campo SAT/XML | Obligatoriedad | Regla resumida |
| --- | --- | --- | --- |
| `marca_fabricante` | `<marca_fabricante>` | Obligatorio | 1-40 caracteres. |
| `modelo` | `<modelo>` | Obligatorio | 1-40 caracteres. |
| `anio_vehiculo` | `<anio>` | Obligatorio | Formato `AAAA`. |
| `vin` | `<vin>` | Obligatorio | 17 caracteres. |
| `repuve` | `<repuve>` | Obligatorio | 8 caracteres. |
| `placas` | `<placas>` | Obligatorio | 1-12 caracteres. |

### Liquidacion

| Campo sistema | Campo SAT/XML | Obligatoriedad | Regla resumida |
| --- | --- | --- | --- |
| `fecha_pago` | `<fecha_pago>` | Obligatorio | Fecha `AAAAMMDD`. |
| `forma_pago` | `<forma_pago>` | Obligatorio | Un digito. |
| `instrumento_monetario` | `<instrumento_monetario>` | Obligatorio | En referencias oficiales consultadas aparece obligatorio; operativamente suele depender de la forma de pago. |
| `moneda` | `<moneda>` | Obligatorio | 1-3 digitos. |
| `monto_operacion` | `<monto_operacion>` | Obligatorio | Formato numerico con 2 decimales obligatorios. |

## 7. Observaciones practicas

- `repuve` y `placas` no deben considerarse opcionales si se busca apego literal a la documentacion oficial consultada para vehiculo terrestre.
- Cuando el archivo no trae `nombre_sucursal`, conviene revisar si la plantilla fuente realmente corresponde al anexo oficial vigente del tipo de aviso que se esta declarando.
- Si se decide relajar algun campo en el sistema por operacion interna, la recomendacion es marcarlo expresamente como criterio interno y no como criterio SAT/UIF.
