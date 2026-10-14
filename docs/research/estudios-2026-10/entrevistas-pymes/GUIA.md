# Estudio 1 — Guía de entrevista (guion literal)

**Uso.** El entrevistador lee el texto entre comillas **tal como está escrito**.

- Las *repreguntas* en cursiva se usan solo en el caso indicado.
- Lo que va entre corchetes son instrucciones para el entrevistador y no se lee.
- La columna de destino en `planilla.csv` figura al final de cada pregunta.
- Se registra `NS` si la persona no sabe y `NR` si no responde.

**Duración objetivo:** 20 minutos.

---

## Apertura

«Muchas gracias por su tiempo. Le voy a hacer unas quince preguntas sobre cómo trabaja su empresa con las consultas de clientes, los pedidos y algunas tareas administrativas. No hay respuestas correctas ni incorrectas: nos interesa cómo funciona hoy, tal cual es. Cuando le pida un número, alcanza con una estimación aproximada. Si alguna pregunta no quiere responderla, me lo dice y seguimos.»

[Confirmar que ya se recibió la aceptación escrita del consentimiento. Si no se recibió, no seguir.]

[Registrar `rol_entrevistado`: dueño/a, encargado/a, responsable de ventas, responsable de administración u otro.]

---

## Sección A — La empresa

**P01.** «¿A qué se dedica la empresa? ¿Qué vende o qué servicio presta?»
→ `p01_rubro`. [Registrar una categoría amplia, sin nombres propios.]

«¿Sus clientes son principalmente otros negocios, consumidores finales o ambos?»
→ `p01_tipo_cliente`: `negocios` / `consumidores` / `ambos`.

**P02.** «¿Cuántas personas trabajan en la empresa, contándolo/a a usted?»
→ `p02_personas` (número de personas).

**P03.** «¿Hace cuántos años funciona la empresa?»
→ `p03_antiguedad_anios` (años).

---

## Sección B — Consultas y cotizaciones

**P04.** «¿Por qué medios les llegan las consultas o los pedidos de los clientes?»

[No leer la lista. Marcar todos los que mencione: `whatsapp`, `telefono`, `correo`, `redes`, `web`, `presencial`, `otro`.]

→ `p04_canales`, con los valores separados por `;`.

«De esos, ¿por cuál le llegan más?»
→ `p04_canal_principal`.

**P05.** «En una semana normal, ¿cuántas consultas o pedidos de presupuesto reciben, aproximadamente?»

*Repregunta, si duda:* «Si lo piensa por día, ¿cuántas serían en un día normal?» [Multiplicar por los días hábiles que indique y anotar el cálculo en `observaciones`.]

→ `p05_consultas_semana` (consultas por semana).

**P06.** «Cuando alguien pide un presupuesto o una cotización, ¿cuántos minutos de trabajo le lleva a usted o a su equipo prepararla y enviarla, en promedio? Me refiero al tiempo de trabajo, no al tiempo que pasa hasta que se envía.»

→ `p06_min_por_cotizacion` (minutos de trabajo por cotización).

**P07.** «Cuando entra una consulta, ¿quién se entera primero?»
→ `p07a_quien_recibe` (texto breve: rol, no nombre).

«¿Cómo le llega esa consulta a la persona que tiene que responderla?»
→ `p07b_como_llega` (texto breve).

*Repregunta, solo si quien recibe y quien responde es la misma persona:* «¿Entonces la misma persona que la recibe es la que la responde?» [Si confirma, registrar `misma persona` en `p07b_como_llega` y 0 en `p07c_min_aviso`.]

«Desde que entra la consulta hasta que la persona que responde se entera, ¿cuántos minutos pasan, en general?»
→ `p07c_min_aviso` (minutos).

**P08.** «¿Pasa que alguna consulta quede sin responder o se pierda?»

*Si responde que sí:* «¿Cuántas, aproximadamente, en un mes?»
→ `p08_sin_respuesta_mes` (consultas por mes; 0 si responde que no pasa).

---

## Sección C — Despachos y entregas

[Si la empresa no hace envíos ni entregas, registrar `no aplica` en P09a, dejar vacías P09b y P09c y pasar a la sección D.]

**P09.** «Cuando hay que despachar o entregar un pedido, ¿cómo se arma la información necesaria (qué productos van, a qué dirección, el remito o la etiqueta)?»
→ `p09a_como_despacho` (texto breve: herramienta y pasos).

«¿Cuántos pedidos despachan o entregan por semana, aproximadamente?»
→ `p09b_pedidos_semana` (pedidos por semana).

«¿Cuántos minutos lleva preparar esa información para un pedido?»
→ `p09c_min_por_despacho` (minutos por pedido).

---

## Sección D — Redes sociales

**P10.** «¿Publican en redes sociales? Si es así, ¿cuántas publicaciones hacen por semana, más o menos?»
→ `p10a_publicaciones_semana` (publicaciones por semana; 0 si no publican).

[Si publican:] «¿Cuántas horas por semana le dedica alguien de la empresa a preparar y subir esas publicaciones?»
→ `p10b_horas_redes_semana` (horas por semana).

---

## Sección E — Herramientas y tareas

**P11.** «¿Qué herramientas digitales usan para vender o administrar?»

[No leer la lista. Marcar todas las que mencione: `whatsapp_business`, `planilla`, `sistema_gestion`, `tienda_online`, `crm`, `correo_masivo`, `redes`, `otro`.]

→ `p11_herramientas`, con los valores separados por `;`. Detallar `otro` en `observaciones`.

**P12.** «¿Hay alguna tarea que hoy se haga sola, sin que una persona tenga que hacerla a mano cada vez?»
→ `p12a_automatiza`: `si` / `no`.

*Si responde que sí:* «¿Cuál o cuáles?»
→ `p12b_que_automatiza` (texto breve).

**P13.** «Pensando en las tareas de ventas y de administración, ¿cuáles son las dos que más tiempo le consumen por semana?»
→ `p13_tarea1`, `p13_tarea2` (texto breve).

[Por cada tarea:] «¿Cuántas horas por semana le lleva esa tarea, aproximadamente?»
→ `p13_tarea1_horas_semana`, `p13_tarea2_horas_semana` (horas por semana).

---

## Sección F — Disposición a adoptar una herramienta

[Recién aquí se describe la herramienta. Leer el texto de forma literal, sin agregar ventajas.]

«Ahora le voy a describir un tipo de herramienta y le voy a pedir su opinión. Es un catálogo en internet donde el cliente elige productos, arma un pedido y pide una cotización; no paga en línea. Cuando el cliente envía el pedido, el sistema lo guarda y le avisa por correo a la persona de ventas. Además, puede preparar borradores de publicaciones para redes sociales y un resumen de los pedidos confirmados para despachar.»

**P14.** «En una escala del 1 al 5, donde 1 es "nada dispuesto" y 5 es "muy dispuesto", ¿qué tan dispuesta estaría su empresa a usar una herramienta así?»
→ `p14_disposicion_1a5` (entero de 1 a 5).

**P15.** «¿Cuál sería la principal dificultad o motivo para no usarla?»
→ `p15_barrera` (texto breve). [Si responde «ninguna», registrar `ninguna`.]

---

## Cierre

«Eso es todo. Muchas gracias. Sus respuestas se van a publicar sin el nombre de la empresa ni el suyo. Si le interesa, le enviamos el resumen de resultados cuando esté listo.»

[Si pregunta, recién ahora se puede explicar que la tesis desarrolla una herramienta de ese tipo.]

[Registrar en `duracion_min` los minutos totales de la entrevista.]
