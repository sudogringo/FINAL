# Versión de n8n de los resultados

| Resultado | Versión | Cómo se sabe |
|---|---|---|
| Lote del 07/10/2026 (`results/2026-10-07/`) | **2.27.5** | Registrada por `run-all.sh` en `n8n-version.txt`. |
| Lote del 25/09/2026 (`results/2026-09-25/`) | No registrada; 2.27.5 según la única imagen disponible | Ver evidencia. |
| Latencia de VD2, 25/08/2026 (`../quote-latency/`) | No registrada | Ver evidencia. |

## Evidencia

- Entre el 30/06/2026 y el 07/10/2026 el entorno tuvo una sola imagen de n8n,
  `final-n8n:latest` (ID `sha256:183f0983427827b95444f4119b043ce3f079d434ec6fd23772370067d95a422e`,
  construida el 30/06/2026). El 07/10/2026, antes de reconstruirla,
  `docker exec golden_harvest_n8n n8n --version` sobre un contenedor de esa imagen devolvió
  `2.27.5`.
- Ni el lote del 25/09 ni la medición de VD2 guardaron la versión en sus registros. No puede
  descartarse que algún contenedor creado antes del 30/06 con una imagen anterior siguiera en uso
  en esas fechas.
- El `Dockerfile` fija `ARG N8N_VERSION=2.27.5` desde el 22/09/2026. La imagen reconstruida el
  07/10/2026 a partir de ese pin reporta `2.27.5`.

## Corrección

La primera versión de este `README.md` consignaba "n8n 2.35.4" para el lote del 25/09/2026. Ese
dato no se tomó de la instancia que ejecutó el lote y no coincide con la imagen disponible, por lo
que se retira. Desde el 07/10/2026, `run-all.sh` guarda la versión en `n8n-version.txt` dentro de
cada lote.
