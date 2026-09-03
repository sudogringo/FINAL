# Prueba de usabilidad — System Usability Scale (SUS)

Datos crudos y cálculo de la prueba de usabilidad exploratoria para la validación de VD4
(usabilidad del catálogo) — la que el diseño metodológico de la tesis (§4.5) declaraba
como pendiente de ejecución por restricciones de tiempo del proyecto.

## Fuente de los datos crudos

Transcripción manual, sesión por sesión, del documento de campo
`PrimerasEncuestasGH.BACKUP-2026-09-02 (1).docx` (fuera del repo, en la carpeta de trabajo
del equipo). Reproducido íntegro en [`raw/participantes.md`](raw/participantes.md).

## Metodología aplicada

Coincide con el protocolo declarado de antemano en §4.5 de la tesis: muestra intencional de
5 usuarios representativos, moderación presencial, sin asistencia externa durante la tarea
(completar una solicitud de cotización en el catálogo), y calificación mediante el
cuestionario SUS (System Usability Scale, Brooke 1996) de 10 ítems en escala Likert de 5
puntos.

- **P1-P3**: moderados por Emiliano, 02/09/2026.
- **P4-P5**: moderados por Tiago, 03/09/2026.
- Todos en notebook/PC de escritorio — no se probó en dispositivo móvil.
- **Consentimiento informado**: verbal, no formulario firmado. Se explicó a cada
  participante el propósito de la prueba (validar la usabilidad de un catálogo de e-commerce
  académico, sin vínculo con la empresa real) antes de comenzar la tarea. No hubo compensación
  ni registro de datos personales identificables — la participación es anónima (P1-P5).

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

Detalle del cálculo por ítem en [`results/sus-summary.csv`](results/sus-summary.csv).

## Tasa de completitud

5/5 (100 %) completaron la tarea. P3 hizo una consulta menor ("¿selecciono cualquier
producto?") antes de empezar, no una asistencia durante la tarea — se declara igual, sin
suavizarlo, porque el criterio de aceptación de VD4 es completar "sin asistencia externa".

## Limitaciones (declarar en la tesis, no ocultar)

- **n=5**, muestra intencional no probabilística — no permite generalizar más allá de una
  validación exploratoria, que es justamente lo que el diseño original prometía.
- **Dos moderadores distintos** (Emiliano P1-P3, Tiago P4-P5) — introduce una variable no
  controlada; ninguna evidencia sugiere que haya afectado el resultado, pero corresponde
  declararlo.
- **Un solo tipo de dispositivo** (notebook/PC) — no se evaluó el catálogo en mobile, pese a
  que el propio Capítulo 5 reporta que el sitio se usa mayoritariamente desde dispositivos
  móviles (Statcounter Global Stats, 2024a, citado en §2.3).
- **P5** fue el único participante con fricción real, y coincide con ser la persona de mayor
  edad (+60) del grupo — declaró explícitamente que "le costaba leer las descripciones"
  (letra chica). Este hallazgo cualitativo **corrobora de forma independiente** la regresión
  de Accessibility que Lighthouse ya reporta en el Capítulo 5 (83 vs. 89–94 del sitio
  preexistente) — dos instrumentos distintos, mismo síntoma. Vale la pena señalar esta
  triangulación en la tesis, no es casualidad.
