# Estudio 1 — Libro de códigos (borrador)

**Estado:** borrador para el paso 1 de `PROTOCOLO.md` §6.3: es una propuesta de libro de códigos que los dos autores deben revisar. **No reemplaza** la codificación independiente (paso 2) ni la resolución de desacuerdos por consenso (paso 3).
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

> Asignación hecha por una sola persona para estimar la saturación. Para no sesgar la codificación independiente del paso 2, cada autor debería codificar primero con la sección 1 y recién después mirar esta tabla.

| Pregunta | PyME-01 | PyME-02 | PyME-03 | PyME-04 | PyME-05 |
|---|---|---|---|---|---|
| P07 | REC-PERSONAL, BOT | REC-DUENO, RESP-DIRECTA | REC-PERSONAL, DERIVACION | BOT, DERIVACION | REC-PERSONAL, RESP-DIRECTA |
| P09a | — | DOC-PLATAFORMA | DOC-SISTEMA | DOC-SISTEMA, ARMADO-MANUAL | — |
| P12b | AUTO-RESPUESTA | — | IA-ASISTIDA, REPORTES-AUTO | — | AUTO-RESPUESTA, PLANTILLAS |
| P13 | ADMIN-COBRO, DOCUMENTACION | LOGISTICA-FISICA | COTIZACIONES, DOCUMENTACION | ADMIN-COBRO | COTIZACIONES, FINANCIACION |
| P15 | VENTA-PERSONALIZADA, PRESENCIALIDAD | PREFIERE-CHECKOUT, AVISOS-SIN-VALOR | VENTA-PERSONALIZADA | BAJO-VOLUMEN, OTRAS-PRIORIDADES | VENTA-PERSONALIZADA, POCA-VARIEDAD |

**Códigos nuevos por entrevista** (los que aparecen por primera vez, en orden de entrevista):

| Entrevista | Códigos nuevos | Cantidad |
|---|---|---|
| PyME-01 | REC-PERSONAL, BOT, AUTO-RESPUESTA, ADMIN-COBRO, DOCUMENTACION, VENTA-PERSONALIZADA, PRESENCIALIDAD | 7 |
| PyME-02 | REC-DUENO, RESP-DIRECTA, DOC-PLATAFORMA, LOGISTICA-FISICA, PREFIERE-CHECKOUT, AVISOS-SIN-VALOR | 6 |
| PyME-03 | DERIVACION, DOC-SISTEMA, IA-ASISTIDA, REPORTES-AUTO, COTIZACIONES | 5 |
| PyME-04 | ARMADO-MANUAL, BAJO-VOLUMEN, OTRAS-PRIORIDADES | 3 |
| PyME-05 | PLANTILLAS, FINANCIACION, POCA-VARIEDAD | 3 |

**Lectura frente a la regla de §2.3** (detener cuando dos entrevistas consecutivas no aportan códigos nuevos, con un máximo de 8):

- PyME-04 y PyME-05 aportan códigos nuevos, así que **la saturación no se alcanzó con 5 entrevistas**.
- La curva baja (7 → 6 → 5 → 3 → 3), pero no llega a cero.
- Aunque se fusionen los códigos dudosos (sección 3), PyME-05 conserva al menos uno nuevo (`FINANCIACION`).
- Con la regla tal como está escrita, el mínimo pasa a ser **7 entrevistas**: la 6.ª y la 7.ª sin códigos nuevos. Si alguna aporta uno, se sigue hasta el tope de 8.
- Si se cierra con 5, hay que **declararlo como desvío del protocolo** y no como saturación.

## 3. Decisiones abiertas para los autores

1. **`PLANTILLAS` frente a `AUTO-RESPUESTA`.** Si se fusionan, PyME-05 pierde un código nuevo. El criterio propuesto los separa, porque una plantilla la envía una persona.
2. **`POCA-VARIEDAD` frente a `VENTA-PERSONALIZADA`.** PyME-05 menciona las dos cosas; ¿son una sola barrera?
3. **`FINANCIACION` frente a `ADMIN-COBRO`.** Se separan porque la financiación es atención previa a la venta y la cobranza es posterior.
4. **P09a con `no aplica`** (PyME-01 y 05). Se propone no codificarlo; la frecuencia se informa sobre n = 3.
5. **P12b de PyME-04.** Respondió «no», pero el chatbot de P07 responde solo. Se propone respetar la respuesta y dejarlo como observación, sin codificarlo.
