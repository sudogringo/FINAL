# Estudio 1 — Entrevistas estructuradas a PyMEs: protocolo

**Estado:** recolección cerrada con 5 entrevistas (14 y 15/10/2026), **sin saturación**. El cierre es un desvío de §2.3, registrado como D2 en [`DESVIOS.md`](../../prerregistro-2026-10/DESVIOS.md). Este protocolo se conserva tal como se fijó antes de los datos.
**Investigadores:** Cunto Boberg, Tiago y Rojo, Emiliano (UTN, Tecnicatura Universitaria en Programación).
**Directores:** Prof. Alberto Cortez y Ariel Enferrel.

## 1. Objetivo

Aportar evidencia empírica al segundo eje del problema de la tesis, que hasta ahora se presenta como supuesto: la carga que imponen los procesos manuales en una PyME. El estudio describe cuatro procesos:

1. la recepción y respuesta de consultas y pedidos de cotización;
2. el aviso al vendedor o responsable cuando entra una consulta;
3. el armado de la información de despacho;
4. la publicación de contenido en redes sociales.

Son los cuatro procesos que el artefacto automatiza (workflows 00, 04, 07, 06a y 06b de `docs/architecture/n8n_workflows.md`). El estudio también cierra en parte el **ciclo de relevancia** de la investigación en ciencia del diseño (Hevner, 2007): contrasta el problema planteado con el entorno de aplicación, y no solo con la literatura.

**Alcance.** El estudio es **descriptivo y exploratorio**. No contrasta hipótesis ni permite generalizar a la población de PyMEs argentinas. Sus resultados se informan como un diagnóstico de casos.

## 2. Participantes

### 2.1 Criterios de inclusión (se deben cumplir todos)

- PyME argentina **en funcionamiento** al momento de la entrevista.
- Vende a otros negocios, a consumidores o a ambos.
- Recibe consultas o pedidos por al menos un canal (WhatsApp, teléfono, correo, redes, web o atención presencial).
- La persona entrevistada es **dueña, encargada o responsable de ventas o de administración**, es decir, conoce de primera mano cómo se responden las consultas.

### 2.2 Criterios de exclusión

- Golden Harvest S.A.
- Empresas donde trabaje alguno de los autores.

**Recomendación (no excluyente):** evitar empresas de familiares directos de los autores. Si se incluye alguna, se registra en la columna `vinculo_autores` y se informa.

### 2.3 Tamaño de muestra: de 5 a 8 entrevistas

- El estudio es descriptivo y exploratorio. Busca caracterizar los procesos y su orden de magnitud (minutos, cantidades por semana), no estimar parámetros poblacionales con precisión.
- **Criterio de saturación.** Las preguntas abiertas (P07, P09, P13 y P15) se codifican a medida que se hacen las entrevistas. A partir de la 5.ª, la recolección se detiene cuando **dos entrevistas consecutivas no aportan códigos nuevos**, con un máximo de 8. En entrevistas estructuradas con participantes relativamente homogéneos, la mayor parte de los códigos aparece en las primeras seis (Guest, Bunce y Johnson, 2006). Ese antecedente orienta el rango, pero no lo garantiza.
- Con este n, las medianas y los rangos describen los casos entrevistados y no la población. Así debe redactarse en la tesis.
- **Diversidad buscada (sin cuotas):** si es posible, incluir al menos un rubro alimentario o mayorista, para acercarse al caso, y al menos una empresa que venda principalmente a otros negocios.

### 2.4 Reclutamiento

Por contacto directo o por referidos de la red de los autores y de los directores. Se usa el mensaje de `../MENSAJE_RECLUTAMIENTO.md` (Estudio 1). No hay compensación.

## 3. Modalidad

- Presencial, llamada telefónica o videollamada, a elección de la persona entrevistada.
- **Duración objetivo:** 20 minutos. Si se llega a 25 minutos, el entrevistador pasa directamente a la sección F.
- Un único entrevistador por sesión: uno de los autores. Se registra quién hizo cada entrevista.
- **Sin grabación de audio.** El entrevistador carga las respuestas en la planilla durante la entrevista o, como máximo, dentro de las 2 horas siguientes. Así se reduce el manejo de datos personales.

## 4. Procedimiento para el entrevistador

1. **Antes de la entrevista**
   - Confirmar que la empresa cumple los criterios de §2.1 y §2.2.
   - Asignar el próximo código libre (`PyME-01`, `PyME-02`…).
   - Enviar `CONSENTIMIENTO.md` por mensaje, junto con el día y la hora acordados.
2. **Inicio (2 minutos)**
   - Presentarse y leer el consentimiento, o confirmar que la persona lo leyó.
   - Obtener la aceptación con la fórmula literal, por escrito: un mensaje de WhatsApp o un correo.
   - Si la entrevista es presencial, la persona puede escribir la fórmula en papel o enviarla por mensaje en ese momento.
   - **Sin aceptación escrita no se empieza la entrevista.**
3. **Desarrollo (15 minutos)**
   - Seguir `GUIA.md` **en orden y de forma literal**.
   - Las preguntas se leen tal como están escritas.
   - Solo se usan las repreguntas previstas en la guía.
4. **Reglas durante la entrevista**
   - No mencionar el artefacto, la tesis sobre automatización ni n8n antes de la sección F.
   - No calificar las respuestas («está bien», «eso es mucho»).
   - Si la persona no sabe un número, pedir una estimación aproximada con la repregunta prevista. Si aun así no puede darla, registrar `NS` (no sabe).
   - Si la persona prefiere no responder, registrar `NR` (no responde).
   - Registrar siempre la **unidad** que pide la guía. Si la persona responde en otra unidad (por ejemplo, horas en lugar de minutos), anotar la respuesta textual en `observaciones` y la conversión en la columna correspondiente.
5. **Cierre (2 minutos)**
   - Agradecer.
   - Si la persona lo pide, contar en qué consiste el artefacto de la tesis, y solo después de terminar la sección F.
   - Ofrecer el envío del informe de resultados cuando esté disponible.
6. **Después de la entrevista**
   - Completar la fila de `planilla.csv`, con la fecha, la modalidad, el entrevistador y la duración.
   - Guardar el mensaje de aceptación como captura o correo, **fuera del repositorio** (ver §5).

## 5. Manejo de datos

| Dato | Dónde se guarda | ¿Se publica? |
|---|---|---|
| Nombre de la empresa y de la persona | Solo en una lista de contacto privada de los autores, fuera del repositorio | **No** |
| Mensaje de aceptación (captura o correo) | Carpeta privada de los autores, fuera del repositorio | **No**. Se conserva hasta la aprobación de la tesis. |
| Código `PyME-NN` y respuestas | `planilla.csv` en este repositorio | **Sí**, anonimizadas |
| Rubro | `planilla.csv`, en categoría amplia (por ejemplo, «alimentos – mayorista», no «distribuidora de fiambres de la calle X») | Sí |
| Localidad | No se registra. Como mucho, la provincia. | Solo la provincia |

**Regla de anonimización.** Antes de cada commit se revisan las columnas de texto libre (`p07_*`, `p09_*`, `p13_*`, `p15_*` y `observaciones`). Se eliminan nombres propios, marcas, direcciones, teléfonos y cualquier detalle que permita identificar a la empresa. Por ejemplo, «somos la única fábrica de X en Y» se reemplaza por «[detalle identificatorio omitido]».

La tabla de correspondencia entre código y empresa **no se versiona**.

## 6. Plan de análisis (descriptivo)

### 6.1 Preguntas cuantitativas

P02, P03, P05, P06, P07c, P08, P09b, P09c, P10a, P10b, P13 (horas) y P14:

- **mediana, mínimo y máximo** de cada una, con n válido (se excluyen `NS` y `NR`, y se informa cuántos hubo);
- sin promedios como estadístico principal: con n ≤ 8 y distribuciones asimétricas, la mediana es más estable;
- **una variable derivada**, informada caso por caso y luego con su mediana:
  - horas semanales dedicadas a cotizaciones = P05 × P06 / 60;
  - horas semanales dedicadas a despacho = P09b × P09c / 60.

  Se presentan como **estimaciones de los propios entrevistados** y no como mediciones.

### 6.2 Preguntas cerradas de opción múltiple

P04, P11 y P12a: frecuencia absoluta de cada opción, por ejemplo, «WhatsApp: 6 de 7».

### 6.3 Preguntas abiertas

P07a, P07b, P09a, P12b, P13 y P15. Se hace una **codificación temática simple**:

1. Los dos autores leen todas las respuestas y proponen un libro de códigos breve, con códigos como «aviso verbal», «reenvío de WhatsApp», «planilla manual», «costo», «falta de tiempo para aprender».
2. Cada autor codifica **de forma independiente** todas las respuestas.
3. Los desacuerdos se resuelven por consenso, y se informa cuántos hubo.
4. Se informa la frecuencia de cada código: cuántas PyMEs lo mencionan.

### 6.4 Lectura de los resultados frente al problema de la tesis

Se describen tal como salgan:

- ¿Las tareas manuales que más tiempo consumen (P13) coinciden con los procesos que el artefacto automatiza?
- ¿El aviso al vendedor (P07) es manual y tiene demora?
- ¿Se pierden consultas (P08)?

Si los datos **no** muestran carga manual relevante en alguno de esos procesos, se informa igual, como evidencia contraria al supuesto.

### 6.5 Limitaciones a declarar

- Muestra intencional y pequeña.
- Datos autoinformados y estimados de memoria.
- Entrevistas hechas por los autores, con posible sesgo del entrevistador, mitigado por el guion literal y por presentar el artefacto recién al final.
- Sin revisión de un comité de ética.

## 7. Referencias

- Guest, G., Bunce, A., & Johnson, L. (2006). How many interviews are enough? An experiment with data saturation and variability. *Field Methods, 18*(1), 59–82. https://doi.org/10.1177/1525822X05279903
- Hevner, A. R. (2007). A three cycle view of design science research. *Scandinavian Journal of Information Systems, 19*(2), 87–92.
