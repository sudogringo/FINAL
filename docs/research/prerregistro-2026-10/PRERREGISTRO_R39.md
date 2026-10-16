# Prerregistro R39: catálogo remoto frente a la página de productos del sitio preexistente

Este documento fija **antes de medir** las hipótesis, el protocolo, el análisis y las reglas de decisión de la medición D. Se registra con sello externo en OSF (Open Science Framework) y en este repositorio. Ningún resultado de Lighthouse del catálogo remoto existe al momento de registrarlo.

Responde a dos observaciones de la octava lectura (R38):

- **Predicción de bajo riesgo.** La medición B (`PRERREGISTRO.md` §2) se prerregistró cuando ya se conocía el resultado local de `/catalogo`, y el commit del prerregistro no tenía sello externo.
- **Confusor del alojamiento.** En la medición B, `/catalogo` se sirvió desde un staging local y `/productos` desde Google Sites remoto, lo que sesga el contraste a favor del sitio nuevo.

Todo lo que no figure aquí y se informe en la tesis se presentará como **análisis exploratorio**.

## 1. Conocimiento previo de los autores

Se declara lo que se sabía al registrar este documento:

- **Resultados locales (medición B, 14/10/2026), en el staging local:** `/catalogo` obtuvo Performance 95 (móvil) y 99 (escritorio), con LCP de 2502 ms (móvil) y 823 ms (escritorio). `/productos` obtuvo 56 y 76, con LCP de 9438 ms y 2465 ms.
- **El despliegue remoto funciona** (15/10/2026): el catálogo publicado carga los 8 productos con sus imágenes desde el backend remoto y no hay errores de CORS. Esa verificación se hizo con un navegador, **sin medir rendimiento**: no se conoce ningún puntaje, LCP ni TTFB del catálogo remoto.
- **Cold start:** el servicio gratuito de Render se suspende tras unos 15 minutos sin tráfico y tarda alrededor de un minuto en reactivarse. Se observó el 15/10/2026 en el inicio de sesión del panel.

**Por qué la predicción es arriesgada.** El LCP móvil local quedó 2 ms por encima del umbral «Bueno». En remoto se suman la latencia real de GitHub Pages, la de Render (Ohio, EE. UU.) y la de Neon, que no existían en el staging local. El resultado puede caer de cualquier lado del umbral, y la hipótesis H2 puede refutarse.

## 2. Estado del artefacto medido

- **Frontend:** el de `a573423`, publicado en GitHub Pages por el workflow «Deploy to GitHub Pages». Los commits posteriores (este prerregistro) no modifican `frontend/`. Antes de medir se registran en `deployed-assets.txt` los nombres de los assets servidos y el identificador de la corrida de Actions.
- **Backend:** servicio `golden-harvest-api` en Render (plan gratuito, región Ohio), desplegado desde el commit `6cd304c`. Entre `6cd304c` y `a573423`, el único cambio en `backend/` es `backend/.env.example` (documentación); el código no cambió.
- **Base de datos:** Neon (plan gratuito, AWS us-east-2), con los datos simulados del seed: 8 productos y las imágenes asignadas el 15/10/2026 según `docs/research/lighthouse/assign-product-images.mjs`.
- No se modifica `frontend/` ni `backend/` entre el registro y el fin de las mediciones. Si fuera necesario, se descarta el lote completo y se repite.

## 3. Hipótesis

**H1b-rem.** La página de catálogo publicada (`https://sudogringo.github.io/FINAL/catalogo`) obtiene mejor rendimiento técnico que la página de productos del sitio preexistente (`https://www.goldenharvest.com.ar/productos`):

- **(P1)** mayor puntaje de Performance de Lighthouse;
- **(P2)** menor LCP.

Ambas se evalúan en los perfiles móvil y escritorio. Hipótesis nula de cada comparación: las distribuciones no difieren en la dirección postulada.

**H2 (riesgosa).** El LCP móvil del catálogo publicado está en la categoría **«Bueno»** de Core Web Vitals: **mediana ≤ 2500 ms**.

## 4. Condiciones y confusores

| Página | Alojamiento | Datos |
|---|---|---|
| Original `/productos` | Google Sites | Contenido publicado |
| Nueva `/catalogo` | GitHub Pages (frontend) + Render (API) + Neon (base de datos), todo en planes gratuitos | Datos simulados del seed |

- **Alojamiento:** las dos páginas se sirven ahora desde **alojamientos remotos públicos**, lo que elimina el confusor de localhost de la medición B. Igual difieren entre sí (Google Sites frente a GitHub Pages + Render), así que el resultado se atribuye al par código + alojamiento.
- **Asimetría de contenido:** las páginas no tienen el mismo contenido. `/catalogo` muestra 8 productos con selector de presentación y carrito; `/productos` muestra el contenido del sitio de la empresa. La comparación es entre las páginas de productos de cada sitio, no entre contenidos idénticos.
- **Estado del backend:** se mide con el backend **despierto** (§5). El cold start no se incluye en las corridas confirmatorias; se informa aparte, de forma descriptiva (§6.3). Esta elección favorece al sitio nuevo y se declara como tal.
- **Red del equipo de medición:** el mismo equipo y la misma conexión para las dos páginas, con las corridas intercaladas.

## 5. Protocolo

- Lighthouse CLI 12.8.2, la misma versión de la medición B, con `docs/research/lighthouse/run-audit.mjs`.
  - Perfil móvil: el valor por defecto de `run-audit.mjs`.
  - Perfil escritorio: `--profile=standard`.
- 5 corridas por página y perfil (20 en total), **intercaladas en una misma sesión** (original, nueva, original…). Entre llamadas hay 30 s de pausa, y cada auditoría es una llamada `--runs=1` con `--run-index`.
- **Antes de cada corrida de la página nueva**, se solicita `https://golden-harvest-api.onrender.com/api/health` hasta obtener `{"status":"ok","db":"up"}`. El tiempo de esa solicitud se registra en `warmup.txt`.
- Carpeta de resultados: `docs/research/lighthouse/results/prereg-remoto-<fecha>/`, con `started.txt`, `finished.txt`, `commit.txt`, `deployed-assets.txt` y `warmup.txt`. Etiquetas: `original-productos` y `new-catalogo-remoto`.
- Si una corrida falla (error de Lighthouse o de red), se repite con el mismo índice y se registra en `incidencias.txt`. No se descartan corridas válidas.

## 6. Análisis y reglas de decisión

### 6.1 H1b-rem

- **Estadístico informado:** mediana, mínimo y máximo de cada métrica.
- **Prueba:** Mann-Whitney U **exacta, unilateral**, en la dirección de la hipótesis (`docs/research/lighthouse/prereg_analysis.py`).
- **Comparaciones:** k = 4 (P1 y P2 × móvil y escritorio), con Bonferroni: α = 0,05 / 4 = **0,0125** por comparación. Con 5 + 5 corridas, el p unilateral **mínimo posible** es 1/252 ≈ 0,0040.
- **Regla de decisión:**
  - **se confirma** si las cuatro comparaciones tienen p ≤ 0,0125;
  - **se confirma parcialmente** si lo hacen entre una y tres;
  - **se refuta** si ninguna lo hace o si en alguna la mediana va en la dirección contraria.

### 6.2 H2

- **Se confirma** si la mediana del LCP móvil de las 5 corridas de `new-catalogo-remoto` es ≤ 2500 ms.
- **Se refuta** en caso contrario. No hay categoría intermedia y no se repiten corridas para cambiar la decisión.

### 6.3 Informado, pero no decisorio

- **TTFB** (`server-response-time`) de las dos páginas, en los dos perfiles.
- Accessibility, CLS y TBT.
- **Cold start (descriptivo):** una medición aparte, posterior al lote confirmatorio. Tras al menos 20 minutos sin tráfico hacia el backend, se registra el tiempo hasta la primera respuesta de `/api/products`. Es n = 1 y se informa sin contraste.

## 7. Desvíos

Todo desvío de este protocolo se registra en `DESVIOS.md`, con su fecha y su motivo, y se informa en la tesis.
