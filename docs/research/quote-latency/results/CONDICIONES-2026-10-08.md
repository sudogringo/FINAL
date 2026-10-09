# Condiciones de los lotes del 08/10/2026

| Dato | Valor |
|---|---|
| Código | commit `99c9d5b` (backend con transacción en el cierre y validación de productos; workflow 00 del export actual) |
| n8n | 2.27.5 (`n8n --version` en el contenedor `golden_harvest_n8n`) |
| Credencial Gmail | creada el 08/10/2026 en la instancia; destinatario `bandeja.demo@example.com` (los envíos rebotan después de que Gmail los acepta; t1 se sella al volver la API de Gmail) |
| Productos | los seis `seed-*` de `fixtures.mjs` (el lote del 25/08 usó ids de vinos que el catálogo no tiene) |
| Reloj | desvío contenedor − anfitrión: backend +78 ms, n8n +73 ms (`docker exec … node -e Date.now()`, mejor de 5, ventana ≈ 190 ms). Los dos contenedores comparten reloj dentro de la resolución del método. |

| Lote | Protocolo |
|---|---|
| `batch-2026-10-08-frio` | n8n recién reiniciado (`docker compose restart n8n`), una sola solicitud. El token OAuth de Gmail estaba vigente (autorizado menos de 1 h antes), así que no incluye su renovación. |
| `batch-2026-10-08-rafaga` | 18 solicitudes seguidas, sin pausa (mismo protocolo que el 25/08). |
| `batch-2026-10-08-espaciado` | 15 solicitudes, una por minuto (`--interval-ms=60000`). |
