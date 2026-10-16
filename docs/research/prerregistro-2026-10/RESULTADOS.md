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

## Medición D: catálogo publicado frente a `/productos` (PRERREGISTRO_R39.md)

**Reglas:** las de [`PRERREGISTRO_R39.md`](PRERREGISTRO_R39.md) (commit `e35056e`), registradas también en OSF (https://osf.io/fu58z, 16/10/2026 a las 03:13:40 UTC) antes de generar cualquier dato de esta medición.
**Artefacto medido:** frontend de `a573423`, publicado por la corrida 38844286616 de GitHub Actions (`e35056e`, que no modifica `frontend/`); backend `6cd304c` en Render (Ohio); base Neon (us-east-2) con el seed y las imágenes del 15/10.

**Datos:**
- Lote: `docs/research/lighthouse/results/prereg-remoto-2026-10-16/`, de las 00:15:32 a las 00:32:48 (ART), según `started.txt` y `finished.txt`.
- Lighthouse 12.8.2. Las 20 corridas son válidas al primer intento (no hay `incidencias.txt`).
- Backend despierto antes de cada corrida de la página nueva (`warmup.txt`; el primer despertar tardó 33 s).
- Análisis: `prereg_analysis.py`, con la salida en `analysis.txt`.

| Perfil | Métrica | Original: mediana [mín–máx] | Nueva publicada: mediana [mín–máx] | p unilateral exacto |
|---|---|---|---|---|
| Móvil | Performance | 57 [55–58] | 96 [92–96] | 0,0040 |
| Móvil | LCP (ms) | 14329 [11310–14615] | 2302 [2175–2617] | 0,0040 |
| Escritorio (estándar) | Performance | 72 [72–78] | 98 [95–98] | 0,0040 |
| Escritorio (estándar) | LCP (ms) | 3079 [2167–3174] | 891 [878–1129] | 0,0040 |

**Decisión H1b-rem: confirmada (4/4).** Las 4 comparaciones tienen p ≤ 0,0125 (0,0040, el mínimo posible con 5 + 5) y ninguna mediana va en la dirección contraria.

**Decisión H1b-LCP (rotulada H2 en OSF): confirmada.** La mediana del LCP móvil de la página publicada es 2302 ms ≤ 2500 ms («Bueno»). Una de las cinco corridas quedó por encima del umbral (2617 ms).

**Informado, no decisorio:**
- TTFB (`server-response-time`): página nueva 18–293 ms en móvil y 18–186 ms en escritorio (la primera corrida de cada perfil es la más lenta); original 226–253 ms y 230–250 ms.
- Accessibility: 100 / 100 en la página nueva, frente a 90 / 86 en la original. TBT: 11 / 0 ms frente a 188 / 0 ms. CLS ≤ 0,006 en ambas.
- **Hallazgo no previsto:** el enlace directo `/FINAL/catalogo` responde HTTP 404 con la página `404.html`, que redirige por JavaScript a `/FINAL/?/catalogo` (técnica estándar de SPA en GitHub Pages). Lighthouse sigue la redirección y mide la página final; la auditoría `redirects` le asigna entre 802 y 1084 ms en móvil y entre 252 y 485 ms en escritorio. No es un desvío: la URL es la prerregistrada, y la redirección forma parte de lo que vive quien entra por ese enlace.
- El elemento LCP es el mismo que en la medición B (el párrafo de presentación del encabezado en móvil y el título en escritorio) y no depende de los datos de la API. Que el LCP móvil publicado sea menor que el del entorno de pruebas (2302 frente a 2502 ms) no se atribuye a una causa: el throttling de Lighthouse es simulado y los servidores difieren (`vite preview` frente a la CDN de GitHub Pages).
- El original varía entre mediciones: su LCP móvil fue de 9438 ms el 14/10 y de 14329 ms el 16/10.
- **Arranque en frío** (§6.3, n = 1): ver `coldstart.txt`.
