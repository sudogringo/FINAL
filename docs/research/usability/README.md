# Prueba de usabilidad — System Usability Scale (SUS)

Datos crudos y cálculo de la prueba de usabilidad exploratoria para la validación de VD4
(usabilidad del catálogo). Una versión anterior de la tesis la declaraba pendiente; se
ejecutó el 2 y el 3 de septiembre de 2026 (protocolo en §4.5 y en el Anexo B de la tesis).

## Fuente de los datos crudos

Documento de campo: consolidado de las notas de los dos moderadores, armado por uno de ellos
(metadatos del archivo: creado el 02/09/2026 a las 22:31, hora de Argentina, y editado hasta el
03/09/2026). No es un registro tomado en tiempo real durante cada sesión:
[`raw/campo-original_PrimerasEncuestasGH.docx`](raw/campo-original_PrimerasEncuestasGH.docx)
(archivo de trabajo `PrimerasEncuestasGH.BACKUP-2026-09-02 (1).docx`, última edición
03/09/2026; MD5 `eb712a704ee5dcdbd4611bbc90f0cdc0`). Se publica sin alteraciones: identifica a
los participantes solo como P1–P5 y no contiene nombres ni datos de contacto. Su transcripción a
Markdown, sesión por sesión, está en [`raw/participantes.md`](raw/participantes.md).

## Metodología aplicada

Coincide con el protocolo descrito en §4.5 y en el Anexo B de la tesis: muestra intencional de
5 usuarios representativos, moderación presencial, sin asistencia externa durante la tarea
(completar una solicitud de cotización en el catálogo), y calificación mediante el
cuestionario SUS (System Usability Scale, Brooke 1996) de 10 ítems en escala Likert de 5
puntos.

- **P1-P3**: moderados por Emiliano, 02/09/2026.
- **P4-P5**: moderados por Tiago, 03/09/2026.
- Todos en notebook/PC de escritorio — no se probó en dispositivo móvil.
- **Reclutamiento**: por contacto directo de los autores entre familiares, amigos y parejas.
  Ninguno tenía vínculo con Golden Harvest S.A. El vínculo personal con los moderadores
  refuerza el sesgo de deseabilidad social sobre el puntaje SUS.
- **Consentimiento informado**: verbal, no formulario firmado. Se explicó a cada
  participante el propósito de la prueba (validar la usabilidad de un catálogo de e-commerce
  académico, sin vínculo con la empresa real) antes de comenzar la tarea. No hubo compensación.
  Los participantes figuran solo como P1-P5, aunque el documento de campo conserva el tramo
  etario y observaciones de conducta; por eso, el 09/10/2026 se les pidió conformidad para
  publicar sus respuestas anonimizadas en este repositorio, y los cinco la dieron por escrito
  (mensajes conservados por los autores). No hubo revisión de un comité de ética.

## Cálculo del puntaje SUS

Fórmula estándar (Brooke, 1996): para los ítems impares (1,3,5,7,9), la contribución es
`respuesta − 1`; para los pares (2,4,6,8,10), `5 − respuesta`. La suma de las 10
contribuciones se multiplica por 2,5 para obtener un puntaje de 0 a 100.

| Participante | SUS | Categoría (Bangor et al., 2009) |
|---|---|---|
| P1 | 100,0 | Best Imaginable |
| P2 | 100,0 | Best Imaginable |
| P3 | 97,5 | Best Imaginable |
| P4 | 97,5 | Best Imaginable |
| P5 | 77,5 | Good |
| **Promedio** | **94,5** | **Best Imaginable** |
| **Mediana (rango)** | **97,5 (77,5–100)** | |

Con n=5 y efecto techo (P1 y P2 en el extremo favorable de los diez ítems; P3 y P4 apartados
en un solo ítem), la mediana y el rango describen el resultado mejor que el promedio.

Detalle del cálculo por ítem en [`results/sus-summary.csv`](results/sus-summary.csv).

## Tasa de completitud

**4/5 según el criterio del protocolo.** La tarea pedía seleccionar al menos tres productos,
interpretado como tres variedades distintas (Anexo B de la tesis); P4 seleccionó dos variedades
(tres unidades), por lo que no cumple ese criterio aunque envió la solicitud. Los cinco
participantes enviaron la solicitud de cotización.

P3 consultó al moderador, una sola vez, si podía seleccionar cualquier producto: una pregunta
sobre la consigna, no sobre el uso de la interfaz. El registro de campo no consigna la respuesta. Se registra como observación; no altera la
completitud de P3.

## Limitaciones (declarar en la tesis, no ocultar)

- **n=5**, muestra intencional no probabilística — no permite generalizar más allá de una
  validación exploratoria, que es justamente lo que el diseño original prometía.
- **Dos moderadores distintos** (Emiliano P1-P3, Tiago P4-P5) — introduce una variable no
  controlada; ninguna evidencia sugiere que haya afectado el resultado, pero corresponde
  declararlo.
- **Un solo tipo de dispositivo** (notebook/PC) — no se evaluó el catálogo en mobile, pese a
  que el tráfico web es mayoritariamente móvil (Statcounter Global Stats, 2024a, citado en
  §2.5 de la tesis).
- **P5** fue el único participante con fricción real; es uno de los dos participantes del tramo
  de 60 años o más (P3 y P5; P3 no tuvo fricción) — declaró explícitamente que "le costaba leer las descripciones"
  (letra chica). Este hallazgo es **consistente** con la regresión de Accessibility que
  Lighthouse reporta en el Capítulo 5 (83 vs. 89–94 del sitio preexistente), pero no la
  corrobora de forma independiente: es un solo participante, en una prueba moderada por los
  autores, y Lighthouse no mide el tamaño de letra percibido (§5.1.2 de la tesis).
