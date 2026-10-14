# Prerregistro de las mediciones de octubre de 2026

Este documento fija **antes de medir** las hipótesis, las mediciones, el análisis y las reglas de decisión. El commit que lo incorpora es anterior a todo archivo de resultados citado en él. `git log --follow` de este archivo y de las carpetas de resultados permite verificarlo.

Responde a dos observaciones de la evaluación de la R37:

- **F3 / F4.** La comparación de rendimiento medía la portada y no el catálogo, y las reglas de decisión de VD1 y VD4 se fijaron después de ver los datos.
- **F5.** El criterio de contenido de los workflows 01, 03, 04, 05, 06a y 06b solo verificaba que hubiera salida.

Todo lo que no figure aquí y se informe en la tesis se presentará como **análisis exploratorio** y no como contraste de hipótesis.

## 1. Estado del artefacto medido

- **Commit medido:** `db4954f`. Incluye las correcciones de accesibilidad del frontend (puntos del carrusel, contraste del texto dorado y de baja opacidad, jerarquía de encabezados de `/catalogo`) y los oráculos de contenido de `docs/research/n8n-workflow-runs/check-content.mjs`.
- No se modifica `frontend/`, `backend/` ni `n8n/workflows/` entre este commit y el fin de las mediciones. Si fuera necesario, se descarta el lote completo y se repite.

## 2. Medición B: catálogo frente a la página de productos del sitio preexistente

### 2.1 Hipótesis direccionales

**H1b-cat.** La página de catálogo del sitio nuevo (`/catalogo`) obtiene mejor rendimiento técnico que la página de productos del sitio preexistente (`https://www.goldenharvest.com.ar/productos`). Concretamente:

- **(P1)** mayor puntaje de Performance de Lighthouse;
- **(P2)** menor LCP.

Ambas se evalúan en los perfiles móvil y escritorio.

Hipótesis nula de cada comparación: las distribuciones de las dos páginas no difieren en la dirección postulada.

### 2.2 Unidades y condiciones

| Página | Alojamiento | Datos |
|---|---|---|
| Original `/productos` | Google Sites (alojamiento real) | Contenido publicado |
| Nueva `/catalogo` | Staging local: build de producción con `vite preview` y el backend del `docker-compose.yml` | Datos sembrados (`npm run db:seed`) |

**Confusor declarado.** El alojamiento difiere. El throttling simulado de Lighthouse aplica el mismo RTT y el mismo ancho de banda modelados a las dos páginas, pero el tiempo de respuesta del servidor y la latencia real no se igualan. Por eso, el resultado se atribuye al par código + alojamiento y no al código solo.

### 2.3 Protocolo

- Lighthouse CLI, la misma versión registrada en el JSON de cada corrida.
  - Perfil móvil: el valor por defecto de `run-audit.mjs`.
  - Perfil escritorio: `--profile=standard`, el preset de escritorio de Lighthouse.
- 5 corridas por página y perfil, **intercaladas en una misma sesión** (original, nueva, original…). Entre llamadas hay 30 s de pausa, y cada auditoría externa es una llamada `--runs=1` con `--run-index`.
- Carpeta de resultados: `docs/research/lighthouse/results/prereg-catalogo-<fecha>/`, con `started.txt` y `finished.txt`.
- Si una corrida falla (error de Lighthouse o de red), se repite con el mismo índice y se registra en `incidencias.txt`. No se descartan corridas válidas.

### 2.4 Análisis y reglas de decisión

- **Estadístico informado:** mediana, mínimo y máximo de cada métrica.
- **Prueba:** Mann-Whitney U **exacta, unilateral**, en la dirección de la hipótesis.
- **Comparaciones:** k = 4 (P1 y P2 × móvil y escritorio).
- **Corrección de Bonferroni:** α = 0,05 / 4 = **0,0125** por comparación.
  - Con 5 + 5 corridas, el p unilateral mínimo posible es 1/252 ≈ 0,0040.
  - Para rechazar la nula, por lo tanto, se requiere una separación completa o casi completa.
- **Regla de decisión:**
  - H1b-cat se **confirma** si las cuatro comparaciones tienen p ≤ 0,0125.
  - Se **confirma parcialmente** si lo hacen entre una y tres.
  - Se **refuta** si ninguna lo hace o si en alguna la mediana va en la dirección contraria.
- **Criterio adicional, informado pero no decisorio:** la categoría de Core Web Vitals del LCP móvil de la página nueva (Bueno ≤ 2,5 s; Necesita mejora ≤ 4 s; Pobre > 4 s).

### 2.5 Remedición de la portada (accesibilidad)

Después del despliegue del commit de §1 en GitHub Pages, se repite el protocolo pareado de `paired-2026-10-08`: 5 + 5 corridas, perfil móvil por defecto y escritorio estándar, comparando la portada original con la portada nueva publicada.

**Regla de decisión para la accesibilidad de la portada:**

- La regresión informada en la R37 (83 frente a 94 en móvil) se considera **resuelta** si la mediana de Accessibility de la portada nueva es mayor o igual que la del original en los dos perfiles.
- Se considera **atenuada** si mejora respecto de 83 pero sigue por debajo.

## 3. Medición C: oráculos de contenido de los workflows de n8n

### 3.1 Oráculos

Los oráculos están definidos en `docs/research/n8n-workflow-runs/ORACLES.md` e implementados en `check-content.mjs`, en el commit de §1. Cada oráculo compara la salida de la ejecución con **su propia entrada**, registrada en la misma ejecución de n8n. Su resumen:

| Workflow | Controles | Qué verifica |
|---|---|---|
| 01 | 9 | Cada color de la paleta aparece en el HTML capturado y figura entre los más frecuentes, hex válido, sin negro ni blanco; destinatario y URL coherentes |
| 02 | 5 | Puntajes del reporte = round(PSI × 100), presentes en el correo; alerta (algún puntaje < 80) coherente con la rama tomada |
| 03 | 9 | Un resultado por reseña; clasificación según estrellas (≥ 4 → respuesta automática; < 4 → escalada, urgente si hay palabra clave); conteos del resumen recalculados desde la entrada |
| 04 | — | Una publicación por fila de la planilla, con producto, descripción y hashtags; regla de la URL de imagen; fila escrita de vuelta |
| 05 | 12 | Total de pedidos del mes = pedidos de `/api/orders` en la misma ejecución; clientes únicos, top 3, interacciones y conversión recalculados |
| 06a | 5 | Segmentación; un correo generado por suscriptor con su nombre, ciudad y línea de producto; envío coherente con el nodo Limit |
| 06b | 7 | Productos dentro del catálogo; descuento = round(10 %); lista del correo = carrito; totales coherentes |
| 07 | 5 | Cada pedido confirmado aparece en el resumen con id, cliente, localidad y unidades |

Los oráculos se diseñaron con las ejecuciones del 08/10/2026 a la vista, y todas las corridas de ese lote los pasan. Ese contraste es **exploratorio**. El contraste **confirmatorio** es la repetición de §3.2.

**Límite común:** como cada regla proviene del código del propio workflow, el oráculo detecta incoherencias entre la entrada y la salida, y también regresiones, pero no demuestra que la regla de negocio sea la adecuada.

### 3.2 Protocolo

- `docs/research/n8n-workflow-runs/run-all.sh`: 3 corridas por workflow (01, 02, 03, 04, 05, 06a, 06b y 07), sobre la instancia local de n8n con los workflows del commit de §1.
- Carpeta de resultados: `docs/research/n8n-workflow-runs/results/prereg-<fecha>/`.

### 3.3 Regla de decisión

- **Por workflow:** se considera **correcto** si sus 3 corridas terminan sin error de ejecución **y** pasan su oráculo.
- **Objetivo 3** (contenido de marca: workflows 01, 04 y 06a):
  - **cumplido** si los tres son correctos;
  - **parcialmente cumplido** si lo son uno o dos;
  - **no cumplido** si no lo es ninguno.
- **Fallas de entorno:** una corrida que falla por credenciales vencidas o por un servicio externo caído no cuenta como falla del oráculo. Se registra, se repara el entorno y se repite **el lote completo de ese workflow**. Una salida que viola el oráculo **no se repite**: se informa como resultado.

## 4. Desvíos

Todo desvío de este protocolo se registrará en `docs/research/prerregistro-2026-10/DESVIOS.md`, con su fecha y su motivo, y se informará en la tesis.
