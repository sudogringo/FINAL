# Estudio 1 — Libro de códigos (borrador)

**Estado:** cerrado el 16/10/2026. Las decisiones abiertas de la sección 3 se resolvieron y se hizo una codificación doble e independiente, con consenso (sección 4). Por delegación de los autores, las dos codificaciones las hicieron procesos de IA separados, no los autores: es el desvío D3 de [`DESVIOS.md`](../../prerregistro-2026-10/DESVIOS.md). Después, un autor codificó las 25 unidades como control humano (sección 5).
**Base:** `planilla.csv`, PyME-01 a PyME-05 (14 y 15/10/2026).
**Preguntas abiertas codificadas:** P07a/P07b, P09a, P12b, P13 y P15. Las respuestas `no aplica`, `NS` y las celdas vacías no generan códigos.

## 1. Códigos propuestos

### P07 — Recepción y aviso de la consulta

| Código | Definición | Ejemplo de la planilla |
|---|---|---|
| `REC-PERSONAL` | Recibe la consulta una persona con esa tarea asignada (secretaria, comercial, encargado de mensajes), distinta del dueño. | «una persona encargada de responder los mensajes» |
| `REC-DUENO` | La recibe y la responde el dueño, sin intermediarios. | «el dueño, que trabaja solo» |
| `BOT` | Un bot o chatbot da la primera respuesta antes de que intervenga una persona. | «un chatbot; luego la jefa comercial» |
| `DERIVACION` | Quien recibe la consulta la reenvía a mano a otra persona (por especialidad o por mensaje). | «la asigna a un comercial especializado» |
| `RESP-DIRECTA` | Quien recibe la consulta la responde sin derivarla. | «esa persona las responde directamente» |

### P09a — Armado de la información de despacho

| Código | Definición | Ejemplo |
|---|---|---|
| `DOC-PLATAFORMA` | La etiqueta o la documentación la genera una plataforma de terceros (mercado en línea, transporte). | «en Mercado Libre se generan desde la plataforma» |
| `DOC-SISTEMA` | La documentación sale de un sistema de gestión propio o comercial. | «queda registrada en el sistema de gestión» |
| `ARMADO-MANUAL` | El armado físico del pedido es manual, aunque la información salga de un sistema. | «colocan las viandas a mano en cajas térmicas» |

### P12b — Tareas que ya se automatizaron

| Código | Definición | Ejemplo |
|---|---|---|
| `AUTO-RESPUESTA` | Respuesta automática a consultas o turnos, sin intervención humana. | «bot que atiende a pacientes nuevos» |
| `PLANTILLAS` | Mensajes predeterminados que una persona envía a mano; reducen el trabajo, pero no son automáticos. | «mensajes predeterminados que se envían en determinadas ocasiones» |
| `IA-ASISTIDA` | Asistencia parcial con inteligencia artificial para preparar documentos. | «asistencia parcial con herramientas de inteligencia artificial» |
| `REPORTES-AUTO` | Extracción automática de datos para reportes. | «extracción automática de datos del sistema de gestión» |

### P13 — Tareas que más tiempo consumen

| Código | Definición | Ejemplo |
|---|---|---|
| `ADMIN-COBRO` | Facturación, pagos y cobranzas. | «facturación» |
| `DOCUMENTACION` | Carga o preparación manual de documentación (de terceros o de despacho). | «carga y gestión de documentación de obras sociales» |
| `LOGISTICA-FISICA` | Embalaje y traslado físico de pedidos. | «embalaje y preparación de paquetes» |
| `COTIZACIONES` | Preparación de presupuestos o cotizaciones. | «preparación de presupuestos detallados» |
| `FINANCIACION` | Atención de consultas sobre planes de pago o financiación antes de la venta. | «gestión de consultas sobre financiación con tarjeta» |
| `SEGUIMIENTO` | Seguimiento del estado de los pedidos después del despacho. Se agregó en el control humano (sección 5). | «seguimiento de pedidos» |

### P15 — Barrera para adoptar la herramienta

| Código | Definición | Ejemplo |
|---|---|---|
| `VENTA-PERSONALIZADA` | El precio depende de una evaluación o especificación caso por caso, no de elegir productos de un catálogo. | «cada presupuesto es personalizado» |
| `PRESENCIALIDAD` | La venta exige la presencia del cliente. | «el diagnóstico exige la presencia del paciente» |
| `PREFIERE-CHECKOUT` | Prefiere una tienda con precios y pago en línea. | «prefiere una tienda con precios publicados, carrito y pago en línea» |
| `AVISOS-SIN-VALOR` | Teme recibir avisos de cotizaciones que no terminan en venta. | «recibiría avisos de cotizaciones que no se concretan» |
| `BAJO-VOLUMEN` | Recibe pocas solicitudes de cotización como para justificarla. | «hoy reciben pocas solicitudes de cotización» |
| `OTRAS-PRIORIDADES` | Hay otras prioridades en la empresa. | «hay otras prioridades» |
| `POCA-VARIEDAD` | La oferta tiene pocas opciones por producto; un catálogo amplio no aporta. | «hay poca variedad de opciones por producto» |

## 2. Asignación preliminar y saturación

> Asignación final, después del consenso de la sección 4 (en P07 de PyME-04 se agregó REC-PERSONAL; en P13 de PyME-03, SEGUIMIENTO, por el control humano de la sección 5). La versión anterior de esta tabla es la del codificador A.

| Pregunta | PyME-01 | PyME-02 | PyME-03 | PyME-04 | PyME-05 |
|---|---|---|---|---|---|
| P07 | REC-PERSONAL, BOT | REC-DUENO, RESP-DIRECTA | REC-PERSONAL, DERIVACION | BOT, REC-PERSONAL, DERIVACION | REC-PERSONAL, RESP-DIRECTA |
| P09a | — | DOC-PLATAFORMA | DOC-SISTEMA | DOC-SISTEMA, ARMADO-MANUAL | — |
| P12b | AUTO-RESPUESTA | — | IA-ASISTIDA, REPORTES-AUTO | — | AUTO-RESPUESTA, PLANTILLAS |
| P13 | ADMIN-COBRO, DOCUMENTACION | LOGISTICA-FISICA | COTIZACIONES, DOCUMENTACION, SEGUIMIENTO | ADMIN-COBRO | COTIZACIONES, FINANCIACION |
| P15 | VENTA-PERSONALIZADA, PRESENCIALIDAD | PREFIERE-CHECKOUT, AVISOS-SIN-VALOR | VENTA-PERSONALIZADA | BAJO-VOLUMEN, OTRAS-PRIORIDADES | VENTA-PERSONALIZADA, POCA-VARIEDAD |

**Códigos nuevos por entrevista** (los que aparecen por primera vez, en orden de entrevista):

| Entrevista | Códigos nuevos | Cantidad |
|---|---|---|
| PyME-01 | REC-PERSONAL, BOT, AUTO-RESPUESTA, ADMIN-COBRO, DOCUMENTACION, VENTA-PERSONALIZADA, PRESENCIALIDAD | 7 |
| PyME-02 | REC-DUENO, RESP-DIRECTA, DOC-PLATAFORMA, LOGISTICA-FISICA, PREFIERE-CHECKOUT, AVISOS-SIN-VALOR | 6 |
| PyME-03 | DERIVACION, DOC-SISTEMA, IA-ASISTIDA, REPORTES-AUTO, COTIZACIONES, SEGUIMIENTO | 6 |
| PyME-04 | ARMADO-MANUAL, BAJO-VOLUMEN, OTRAS-PRIORIDADES | 3 |
| PyME-05 | PLANTILLAS, FINANCIACION, POCA-VARIEDAD | 3 |

**Lectura frente a la regla de §2.3** (detener cuando dos entrevistas consecutivas no aportan códigos nuevos, con un máximo de 8):

- PyME-04 y PyME-05 aportan códigos nuevos, así que **la saturación no se alcanzó con 5 entrevistas**.
- La curva baja (7 → 6 → 6 → 3 → 3; era 7 → 6 → 5 → 3 → 3 antes del control humano), pero no llega a cero.
- Aunque se fusionen los códigos dudosos (sección 3), PyME-05 conserva al menos uno nuevo (`FINANCIACION`).
- Cumplir la regla habría exigido al menos **7 entrevistas**: la 6.ª y la 7.ª sin códigos nuevos.
- **Decisión (15/10/2026):** los autores cerraron la recolección con 5 entrevistas. El cierre se registró como desvío D2 en [`DESVIOS.md`](../../prerregistro-2026-10/DESVIOS.md). En la tesis se informa como «n = 5, sin saturación», no como saturación alcanzada.

## 3. Decisiones abiertas para los autores

1. **`PLANTILLAS` frente a `AUTO-RESPUESTA`.** Si se fusionan, PyME-05 pierde un código nuevo. El criterio propuesto los separa, porque una plantilla la envía una persona.
2. **`POCA-VARIEDAD` frente a `VENTA-PERSONALIZADA`.** PyME-05 menciona las dos cosas; ¿son una sola barrera?
3. **`FINANCIACION` frente a `ADMIN-COBRO`.** Se separan porque la financiación es atención previa a la venta y la cobranza es posterior.
4. **P09a con `no aplica`** (PyME-01 y 05). Se propone no codificarlo; la frecuencia se informa sobre n = 3.
5. **P12b de PyME-04.** Respondió «no», pero el chatbot de P07 responde solo. Se propone respetar la respuesta y dejarlo como observación, sin codificarlo.

**Resolución (16/10/2026):** 1) `PLANTILLAS` y `AUTO-RESPUESTA` se mantienen separados, porque la plantilla la envía una persona. 2) `POCA-VARIEDAD` y `VENTA-PERSONALIZADA` se mantienen separados: una barrera se refiere a la amplitud del catálogo y la otra a cómo se forma el precio. 3) `FINANCIACION` y `ADMIN-COBRO` se mantienen separados: la financiación es atención previa a la venta, y la cobranza, posterior. 4) P09a con `no aplica` no se codifica; su frecuencia se informa sobre n = 3. 5) En P12b de PyME-04 se respeta el «no»; el chatbot queda codificado en P07.

## 4. Codificación doble y consenso

- **Codificador A:** la asignación preliminar de la sección 2 (`codificacion/codificador_A.csv`).
- **Codificador B:** un proceso de IA independiente, que solo recibió las definiciones de la sección 1 y las respuestas abiertas, sin la asignación de A (`codificacion/codificador_B.csv`, con la justificación de cada código). No propuso códigos nuevos.
- **Acuerdo:** 23 de 25 unidades (empresa × pregunta) idénticas (92 %); 35 de los 37 códigos asignados por alguno de los dos coinciden (94,6 %).
- **Desacuerdos (2), resueltos por consenso contra las definiciones** (`codificacion/consenso.csv`):
  - PyME-02, P07: A asignó `RESP-DIRECTA` y B no. Se mantiene: «misma persona» indica que quien recibe la consulta la responde.
  - PyME-04, P07: B asignó `REC-PERSONAL` y A no. Se agrega: la jefa comercial recibe lo que deriva el chatbot y es una persona con esa tarea, distinta de la dueña.
- **Marcado como dudoso por B, con acuerdo:** `VENTA-PERSONALIZADA` en PyME-05 (P15), porque la respuesta no dice que el precio dependa de una especificación caso por caso.
- **Efecto:** `REC-PERSONAL` pasa de 3 a 4 empresas. Ningún código nuevo aparece ni desaparece, así que la curva de saturación (7, 6, 5, 3, 3) no cambia con este consenso; el control humano de la sección 5 la lleva a 7, 6, 6, 3, 3.
- **Límite:** el protocolo pedía que codificaran los dos autores. Dos procesos de IA independientes reducen el sesgo de un único codificador, pero no reemplazan el juicio de los investigadores (desvío D3). La sección 5 agrega el control de un autor.

## 5. Control humano (16/10/2026)

- **Codificador:** E. Rojo, autor, sobre una hoja con solo las respuestas y las definiciones de la sección 1 (`codificacion/codificador_autor.csv`). **No es del todo ciego:** el codificador estuvo presente en las sesiones en que se armaron las asignaciones de las secciones 2 y 4.
- **Normalización:** se corrigieron tres erratas de tipeo, sin cambiar ningún código: `REC-DUEÑO` → `REC-DUENO`, `RESP DIRECTA` → `RESP-DIRECTA` y un separador `:` por `;` (PyME-04, P15).
- **Acuerdo con el consenso de la sección 4:** 22 de 25 unidades idénticas (88 %) y 36 de 39 códigos (92,3 %). Con el codificador A: 23/25 (92 %); con B: 21/25 (84 %).
- **Desacuerdos (3), resueltos por los autores contra las definiciones** (`codificacion/consenso.csv`):
  - PyME-01, P07: el autor agregó `DERIVACION`. No se agrega: el pase va del profesional a la secretaria, no de quien recibe la consulta a otra persona.
  - PyME-04, P07: el autor no asignó `REC-PERSONAL`, como el codificador A antes del consenso. Se mantiene, con el criterio de la sección 4.
  - PyME-03, P13: el autor propuso un código nuevo para «seguimiento de pedidos», una parte de la respuesta que A y B no codificaron. Se acepta como `SEGUIMIENTO` (sección 1).
- **Acuerdo corregido por azar** (`codificacion/kappa.py` → `kappa.txt`): sin las 4 unidades vacías en ambos, 18 de 21 (85,7 %); κ de Cohen por presencia de código (120 celdas unidad × código) = 0,96, igual que entre las dos ejecuciones de IA (19 de 21 sin vacías; κ = 0,96). El consenso de la sección 4 contra el que se compara está en `codificacion/consenso_previo_control.csv`.
- **Sentido de los desacuerdos:** en dos se mantuvo la asignación del consenso de la IA (PyME-01 y PyME-04, P07) y en uno, la del autor (SEGUIMIENTO).
- **Efecto:** PyME-03 aporta 6 códigos nuevos en lugar de 5 y la curva queda 7, 6, 6, 3, 3. La saturación sigue sin alcanzarse (D2). La única frecuencia nueva es seguimiento de pedidos (1 empresa, P13).
