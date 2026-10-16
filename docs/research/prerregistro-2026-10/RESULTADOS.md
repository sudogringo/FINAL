# Resultados de las mediciones prerregistradas (14/10/2026)

**Reglas:** las de [`PRERREGISTRO.md`](PRERREGISTRO.md) (commit `89bc412`), publicado antes de generar los resultados de este documento.

**Artefacto medido:** `db4954f`. El commit `89bc412` solo agrega el prerregistro y no modifica el código.

**Desvíos:** ninguno en estas mediciones. `DESVIOS.md` se creó el 15/10/2026 y solo registra desvíos del Estudio 1 (entrevistas a PyMEs).

## Medición B: catálogo frente a `/productos` del sitio preexistente (§2)

**Datos:**
- Lote: `docs/research/lighthouse/results/prereg-catalogo-2026-10-14/`, de las 12:52 a las 13:03 (ART), según `started.txt` y `finished.txt`.
- Lighthouse 12.8.2. Las 20 corridas son válidas (no hay `incidencias.txt`).
- Análisis: `prereg_analysis.py`, con la salida en `analysis.txt`.

| Perfil | Métrica | Original: mediana [mín–máx] | Nueva: mediana [mín–máx] | p unilateral exacto |
|---|---|---|---|---|
| Móvil | Performance | 56 [53–57] | 95 [94–95] | 0,0040 |
| Móvil | LCP (ms) | 9438 [8035–11144] | 2502 [2486–2630] | 0,0040 |
| Escritorio (estándar) | Performance | 76 [72–76] | 99 [98–99] | 0,0040 |
| Escritorio (estándar) | LCP (ms) | 2465 [2426–3187] | 823 [788–866] | 0,0040 |

**Decisión: H1b-cat confirmada.** Las 4 comparaciones tienen p ≤ 0,0125 y ninguna mediana va en la dirección contraria. Las cuatro muestran separación completa.

**Criterios no decisorios:**
- El LCP móvil de `/catalogo` es de 2502 ms, en la categoría **«Necesita mejora»**: supera el umbral de «Bueno» (2500 ms) por 2 ms.
- Accessibility: 100 / 100 en la página nueva, frente a 90 / 86 en el original.

**Confusor declarado (§2.2):** el resultado corresponde al par código + alojamiento. La página nueva se sirvió desde el staging local y la original desde Google Sites.

## Remedición de la portada (§2.5)

**Datos:**
- Lote: `docs/research/lighthouse/results/prereg-portada-2026-10-14/`.
- La portada nueva se midió **después** del despliegue en GitHub Pages; los assets publicados están en `deployed-assets.txt`.
- Las 20 corridas son válidas.

**Accessibility (regla prerregistrada):**
- Móvil: portada nueva **100**, original 94.
- Escritorio: portada nueva **100**, original 89.

**Decisión: la regresión de accesibilidad está resuelta.** En la R37 era de 83 frente a 94 en móvil.

**Réplica exploratoria (sin regla de decisión):**
- Performance móvil: 37 → 76 (p = 0,0040).
- LCP móvil: 11284 → 5815 ms (p = 0,0278). **No es significativo** al nivel corregido, por la dispersión del original (4823–12808 ms). El LCP móvil de la portada sigue en la categoría «Pobre».
- Performance escritorio: 73 → 93 (p = 0,0040).
- LCP escritorio: 2760 → 1589 ms (p = 0,0040).

## Medición C: oráculos de contenido de n8n (§3)

**Datos:**
- Lote: `docs/research/n8n-workflow-runs/results/prereg-2026-10-14/`, con 3 corridas por workflow (n8n en `n8n-version.txt`).
- Archivos: `runs.csv`, `summary.csv` y `content.csv`; la columna `oracle_checks` registra los controles aprobados.

| Workflow | Corridas sin error | Oráculo | Correcto |
|---|---|---|---|
| 01 | 3/3 | 9/9 en las 3 | Sí |
| 02 | 3/3 | 5/5 en las 3 | Sí |
| 03 | 3/3 | 9/9 en las 3 | Sí |
| 04 | 3/3 | 6/6 en las 3 | Sí |
| 05 | 3/3 | 12/12 en las 3 | Sí |
| 06a | 3/3 | 5/5 en las 3 | Sí |
| 06b | 3/3 | 7/7 en las 3 | Sí |
| 07 | 3/3 | 5/5 en las 3 | Sí |

**Decisión: Objetivo 3 cumplido.** Los workflows 01, 04 y 06a son correctos, y los otros cinco también.

**Límites (ORACLES.md):**
- Cada oráculo verifica la coherencia entre la entrada y la salida según la regla del propio workflow, no la adecuación de esa regla al negocio.
- 06a y 06b generan un correo por destinatario, pero en la rama TESIS envían uno solo (nodo «Limitar a 1»).
- El 04 no consume la paleta del 01.
- La facturación del 05 es 0, porque los pedidos sembrados no tienen precio.
