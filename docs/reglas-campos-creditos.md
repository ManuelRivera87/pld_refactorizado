# Reglas De Campos SAT/UIF - Mutuo, Prestamos O Creditos

Documento informativo de referencia para el esquema de creditos del proyecto.

No modifica codigo, base de datos ni flujo del sistema. Resume obligatoriedad y condicionantes de campos con base en formatos oficiales SAT/UIF consultados.

## Fuentes oficiales consultadas

- Portal SAT/PLD - Mutuo, prestamos o creditos: https://sppld.sat.gob.mx/pld/interiores/mutuo.html
- Compilado de formatos oficiales 02 octubre 2019: https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/compilado_formatosofic_02oct2019.pdf
- Compilado de formatos oficiales 24 mayo 2021: https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/compilado_formatosofic_24mayo2021.pdf
- Reforma de formatos 24 julio 2014: https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/reforma_formatoavisosav_dof24jul14.pdf
- Resolucion de avisos e informes 30 agosto 2013: https://www.pld.hacienda.gob.mx/work/models/PLD/documentos/resolucion_avisos_informes.pdf

## Criterio de lectura

- `Obligatorio`: requerido por el formato oficial del bloque correspondiente.
- `Condicional`: depende del tipo de persona, domicilio, caracter modificatorio o detalle de garantia.
- `Opcional`: el formato oficial permite omitirlo.

## Nota operativa

- En el proyecto actual, la clave de actividad usada para este esquema es `MPC`.
- En fuentes oficiales historicas y compiladas puede haber diferencias de longitud en `folio_real` o en algunos nombres de etiqueta; este archivo deja visible cuando se detecto alguna variacion.

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

| Campo sistema | Campo SAT/XML | Obligatoriedad |
| --- | --- | --- |
| `tipo_persona_objeto_aviso` | Bloque `<tipo_persona>` | Obligatorio |

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

El bloque oficial `<dueno_beneficiario>` aparece como `Opcional`. Si se informa, sus subcampos internos pasan a ser obligatorios segun el tipo de persona.

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

## 6. Detalle especifico de creditos

### Datos de la operacion

| Campo sistema | Campo SAT/XML | Obligatoriedad | Regla resumida |
| --- | --- | --- | --- |
| `fecha` | `<fecha_operacion>` | Obligatorio | Fecha `AAAAMMDD`. |
| `codigo_postal_agencia` | `<codigo_postal>` | Obligatorio | Codigo postal de la sucursal o lugar de la operacion. |
| `nombre_sucursal` | `<nombre_sucursal>` | Obligatorio | En referencias oficiales historicas aparece expresamente obligatorio. |
| `tipo_operacion` | `<tipo_operacion>` | Obligatorio | 3-4 digitos. |

### Datos de la garantia

Las referencias oficiales consultadas muestran el bloque `<datos_garantia>` como obligatorio dentro del detalle de operacion.

| Campo sistema | Campo SAT/XML | Obligatoriedad | Regla resumida |
| --- | --- | --- | --- |
| `tipo_garantia` | `<tipo_garantia>` | Obligatorio | 1-2 digitos. |
| `tipo_inmueble` | `<tipo_inmueble>` | Condicional | Cuando la garantia es inmueble. |
| `valor_avaluo_catastral` | `<valor_referencia>` o `<valor_avaluo_catastral>` | Condicional | Monto con 2 decimales; obligatorio cuando la garantia es inmueble. |
| `codigo_postal_ubicacion` | `<codigo_postal>` | Condicional | Obligatorio cuando la garantia es inmueble. |
| `folio_real` | `<folio_real>` | Condicional | Obligatorio cuando la garantia es inmueble. |
| `descripcion_garantia` | `<descripcion_garantia>` | Condicional | Obligatorio cuando el tipo de garantia es "Otro". |

### Persona garante

Las referencias consultadas muestran el bloque de garante como obligatorio dentro de `datos_garantia`; sus campos internos dependen del tipo de persona.

| Campo sistema | Campo SAT/XML | Obligatoriedad |
| --- | --- | --- |
| `tipo_persona` | Bloque `<tipo_persona>` | Condicional |

#### Si `tipo_persona = 1` (persona fisica)

| Campo sistema | Campo SAT/XML | Obligatoriedad |
| --- | --- | --- |
| `nombre` | `<nombre>` | Obligatorio |
| `apellido_paterno` | `<apellido_paterno>` | Obligatorio |
| `apellido_materno` | `<apellido_materno>` | Obligatorio |
| `fecha_nacimiento` | `<fecha_nacimiento>` | Obligatorio |
| `rfc_garante` | `<rfc>` | Obligatorio |
| `curp_garante` | `<curp>` | Obligatorio |

#### Si `tipo_persona = 2` (persona moral)

| Campo sistema | Campo SAT/XML | Obligatoriedad |
| --- | --- | --- |
| `denominacion_razon_moral_garante` | `<denominacion_razon>` | Obligatorio |
| `fecha_constitucion_moral_garante` | `<fecha_constitucion>` | Obligatorio |
| `rfc_moral_garante` | `<rfc>` | Obligatorio |

#### Si `tipo_persona = 3` (fideicomiso)

| Campo sistema | Campo SAT/XML | Obligatoriedad |
| --- | --- | --- |
| `denominacion_razon_fide_garante` | `<denominacion_razon>` | Obligatorio |
| `rfc_fide_garante` | `<rfc>` | Obligatorio |
| `identificador_fideicomiso_fide_garante` | `<identificador_fideicomiso>` | Obligatorio |

### Liquidacion

| Campo sistema | Campo SAT/XML | Obligatoriedad | Regla resumida |
| --- | --- | --- | --- |
| `fecha_pago` | `<fecha_disposicion>` o `<fecha_pago>` segun referencia | Obligatorio | Fecha `AAAAMMDD`. |
| `instrumento_monetario` | `<instrumento_monetario>` | Obligatorio | 1-2 digitos. |
| `moneda` | `<moneda>` | Obligatorio | 1-3 digitos. |
| `monto_operacion` | `<monto_operacion>` | Obligatorio | Formato numerico con 2 decimales obligatorios. |

## 7. Diferencias y observaciones historicas detectadas

- `folio_real` aparece con longitud `1-20` en referencias oficiales historicas y con `1-200` en compilados mas recientes.
- `valor_avaluo_catastral` y `valor_referencia` aparecen como equivalentes funcionales segun el documento oficial consultado.
- Si se quiere alinear al 100% el sistema con el anexo vigente, conviene revisar el XSD o el compilado oficial mas reciente de la actividad antes de ajustar validaciones.
