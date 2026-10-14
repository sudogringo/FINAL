# Oráculos de contenido por workflow

Implementados en [`check-content.mjs`](check-content.mjs) (`ORACLES`) y verificados con
[`check-content.test.mjs`](check-content.test.mjs) (`node --test check-content.test.mjs`).

## Qué es un oráculo aquí

El criterio anterior aceptaba una corrida si algún nodo devolvía "algún elemento". Un oráculo, en cambio,
compara la **salida** de un workflow con su **entrada**, ambas leídas del mismo JSON de ejecución que imprime
`n8n execute --rawOutput`, y devuelve `{pass, checks:[{name, pass, detail}]}`. La corrida pasa solo si pasan
todos sus controles. Una corrida con error de ejecución falla sin evaluar el oráculo.

Regla general: las reglas se derivan del código de los propios nodos (por ejemplo, "4 estrellas o más se
responde automáticamente") y de los datos de la ejecución; no se usan campos que la ejecución no contenga.
Limitación común: como la regla proviene del código del workflow, el oráculo detecta incoherencias entre
entrada y salida y regresiones, pero no puede demostrar que la regla de negocio sea la adecuada.

## Regla de decisión propuesta para la repetición preregistrada

La regla vinculante es la de [`../prerregistro-2026-10/PRERREGISTRO.md`](../prerregistro-2026-10/PRERREGISTRO.md) §3.3.
Un workflow es **correcto** si sus **3 de 3 corridas** terminan sin error **y** pasan todos los controles de su
oráculo. El Objetivo 3 (contenido de marca; workflows 01, 04 y 06a, según §3.2 de la tesis) es **cumplido** si
los tres son correctos, **parcialmente cumplido** si lo son uno o dos y **no cumplido** si ninguno. Se informa
además el resultado de los 8 workflows (01, 02, 03, 04, 05, 06a, 06b, 07).

Los oráculos se diseñaron con las ejecuciones del 08/10/2026 a la vista (resultado de la sección siguiente), por
lo que ese contraste es exploratorio; el contraste confirmatorio es la repetición posterior al prerregistro. Se informa además, por workflow, la fracción de controles
aprobados (columna `oracle_checks` de `content.csv`). El workflow 00 se mide aparte (`quote-latency/`).
Los controles no pasan por "debilitamiento" del oráculo: si una corrida real viola un control, se informa
como hallazgo.

## Resultado contra las ejecuciones reales del 08/10/2026

Los tres lotes pasan todos los controles: 01 (9/9), 02 (5/5), 03 (9/9), 05 (12/12), 06a (5/5), 06b (7/7),
07 (5/5), en las 3 corridas de cada uno. El workflow 04 falló en el lote principal del 08/10 en
`Leer Sheet de Contenido` (la credencial de Google Sheets no estaba disponible); su oráculo se evaluó sobre
el lote de repetición `results/2026-10-08-wf04/` (3 corridas, todas aprobadas). Hallazgos que el oráculo
deja a la vista sin invalidar la corrida: ver "Hallazgos" al final.

## 01 Automated Branding

Entrada: el HTML renderizado por Puppeteer (`Fetch HTML`). Salida: paleta, correo.

Controles: HTML capturado y no vacío; la paleta tiene entre 1 y 5 colores, únicos y hexadecimales válidos
(3 o 6 dígitos); **cada color de la paleta aparece efectivamente en el HTML capturado** (como literal hex o
como `rgb()` equivalente); la paleta son los colores **más frecuentes** del HTML (cantidad igual a
`min(5, colores distintos)`, orden no creciente, ningún color excluido más frecuente que uno incluido);
sin negro ni blanco; `primary`/`secondary` coinciden con las dos primeras posiciones; el correo muestra todos
los colores y la URL analizada, y esa URL es la del nodo disparador; si se detectó fondo, aparece en el HTML;
el correo fue entregado (Gmail con etiqueta `SENT`).

No verifica: el HTML capturado incluye solo estilos incrustados o inline; los colores de hojas de estilo
externas no están en la ejecución. No verifica que los colores representen la marca percibida por una
persona, ni que el HTML sea la versión vigente del sitio.

## 02 Website Health & SEO Monitor

Se conservan los criterios previos (cuatro categorías devueltas por PageSpeed en móvil y escritorio; ocho
puntajes numéricos). Se agregó la misma debilidad detectada en los otros: los puntajes del reporte deben ser
`round(puntaje PSI × 100)` de la categoría correspondiente, los ocho aparecen como `N/100` en el correo, y la
bandera `alerta`/`estado` y la rama tomada (`Log OK` o `Log Alerta`) siguen la regla "alerta si algún
puntaje de rendimiento es menor que 80".

No verifica: que PageSpeed Insights mida correctamente el sitio, ni la estabilidad de los puntajes entre
corridas (varían legítimamente).

## 03 Google Maps Review Management

Entrada: las cinco reseñas simuladas (`[TESIS] Mock Reviews`). Salida: clasificación y correo.

Controles: reseñas con calificación válida (1 a 5); **un resultado por reseña**, mismo orden e identificador;
estrellas, comentario y autor preservados; **clasificación coherente con la calificación**: 4 o más
estrellas → `auto_reply`, prioridad normal, respuesta que nombra al autor y sin escalación; menos de 4 →
escalación que nombra al autor, sin respuesta, y `urgent_admin` si y solo si el comentario contiene
"demora", "roto", "pésimo" u "horrible"; los conteos del resumen (total, positivas, negativas, urgentes)
**igualan los recalculados desde la entrada**; asunto del correo y cifras del HTML iguales a esos conteos; el
correo menciona a cada autor y su comentario; entrega con etiqueta `SENT`.

No verifica: que la clasificación por estrellas y palabras clave sea acertada semánticamente (es una regla
fija, no análisis de sentimiento), que las reseñas sean reales (son simuladas), ni la publicación de
respuestas (no se publican en Google Maps).

## 04 Social Media Content Engine (modo Sheet)

Entrada: filas leídas de la hoja `posts` (`Leer Sheet de Contenido`). Salida: tres publicaciones por fila y
fila escrita de vuelta.

Controles: una publicación y una escritura por fila leída; `row_number` y producto (`tema`) preservados;
Instagram, WhatsApp y Facebook contienen el producto y la descripción (WhatsApp, la descripción abreviada a
120 caracteres), Facebook la fecha o "A confirmar", ninguna contiene `undefined`/`null`/`NaN`; hashtags
iguales a los recalculados (hasta 5 palabras clave de producto y descripción, más las 13 etiquetas base) e
incrustados (10 en Instagram, 5 en WhatsApp); URL de imagen igual a la de la fila o, si está vacía, a la
imagen determinista `picsum.photos/seed/<producto>`; la fila escrita a la hoja coincide campo a campo con las
publicaciones generadas.

No verifica: la paleta de colores. En el export actual ningún nodo del workflow 04 recibe los colores del
workflow 01, de modo que la dependencia descrita en el diseño no está implementada y no es verificable.
Tampoco cubre el modo formulario (el oráculo está definido solo para modo Sheet) ni la calidad editorial de
los textos. Requiere que la hoja tenga al menos una fila y que la credencial de Google Sheets sea válida.

## 05 Monthly Activity Report

Entrada: `GET /api/stats/monthly` y `GET /api/orders` de la misma ejecución. Salida: reporte HTML.

Controles: forma de las métricas; `quotes.total` = pendientes + contactadas + cerradas; **el total de
pedidos de `/stats/monthly` iguala la cantidad de pedidos del mes devueltos por `/orders`**; el nodo Merge
transporta todos los ítems; el período del reporte es el de las métricas; "Pedidos totales" igual a
`orders.total`; "Clientes únicos" igual a los correos distintos de los pedidos del mes; las tres filas del
top coinciden en nombre, orden y unidades con `topProducts`; vistas, carritos y compras iguales a
`webInteractions`; tasa de conversión recalculada; entrega con etiqueta `SENT`.

No verifica: la facturación. Los pedidos del backend no tienen precio, por lo que "Facturación total" es
siempre $0; el control solo comprueba que el reporte sea coherente con esa ausencia y falla si aparecen
campos de precio que el reporte ignore. Tampoco verifica que los datos del backend sean los correctos
(se toman como verdad de referencia).

## 06a Newsletter Quincenal

Entrada: suscriptores simulados (`jsonplaceholder /users`, 10). Salida: segmentos y correos.

Controles: suscriptores con nombre y correo; **segmentación** coherente (correo, nombre, empresa, ciudad y
categoría `roja`/`dorada`/`mix` por posición módulo 3); **un correo generado por suscriptor**, sin
destinatarios repetidos; cada cuerpo saluda con el nombre del suscriptor, menciona su ciudad y la línea de
producto de su categoría; el envío efectivo coincide con lo que deja pasar el nodo `Limitar a 1 (TESIS)`.

No verifica: el asunto ni el destinatario del correo enviado (la ejecución solo devuelve el identificador de
Gmail; el destinatario es fijo, `bandeja.demo@example.com`).

## 06b Carrito Abandonado

Entrada: publicaciones de `jsonplaceholder /posts` (100), de las que el workflow deriva 8 clientes.

Controles: clientes derivados de las primeras `min(8, n)` publicaciones (id, correo, nombre); productos de
cada carrito dentro del catálogo de cinco y sin repetidos; carrito y total según la regla de generación;
**descuento = `round(10 % del total)`**, total final = total − descuento; **la lista de productos del correo
es exactamente la del carrito**, con el saludo al cliente; el correo declara "10% OFF", el total original y
el total con descuento; el envío coincide con el nodo `Limitar a 1 (TESIS)`.

No verifica: que los carritos sean reales. Los genera el propio workflow a partir de posiciones
(no lee `GET /api/stats/abandoned-carts`), por lo que el oráculo comprueba el correo contra carritos
sintéticos. Tampoco verifica el temporizador de 2 horas ni la verificación de compra previa (ramas PRODUCCIÓN
deshabilitadas).

## 07 Logistics & Shipping Automation

Se conservan los criterios previos (resumen de despacho presente, sin `null`, pedidos confirmados leídos).
Se agregó: todos los pedidos leídos están `CONFIRMADO`; el resumen incluye de cada pedido (hasta 3, límite
demo) el identificador, cliente, localidad y unidades (`total`), y su total coincide con la cantidad de
pedidos listados; entrega con etiqueta `SENT`.

No verifica: etiquetas PDF ni WhatsApp (ramas PRODUCCIÓN deshabilitadas). Una base de datos sin pedidos
confirmados hace fallar el oráculo, de modo que el lote requiere al menos uno.

## Hallazgos que el oráculo deja a la vista (no son fallas del oráculo)

- 06a y 06b generan un correo por suscriptor o cliente (10 y 8) pero envían **uno solo** por el nodo
  `Limitar a 1 (TESIS)`. El oráculo lo informa como nota; la afirmación "un correo enviado por suscriptor"
  sería falsa para la rama TESIS.
- 05: la facturación es siempre $0 (los pedidos no tienen precio).
- 04: la paleta del workflow 01 no se usa; el lote principal del 08/10 falló por credencial de Sheets.
- 06b: los carritos son sintéticos y el workflow no lee los carritos abandonados reales del backend.
