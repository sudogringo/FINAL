# Medición D: catálogo publicado frente a /productos (16/10/2026)

Prerregistro: `docs/research/prerregistro-2026-10/PRERREGISTRO_R39.md` y https://osf.io/fu58z (16/10/2026, 03:13:40 UTC). Resultados y decisiones: `docs/research/prerregistro-2026-10/RESULTADOS.md`, sección «Medición D».

- `analysis.txt` es la salida sin editar de `prereg_analysis.py`, escrito para la medición B. Por eso rotula el LCP móvil de la página nueva como «(no decisoria)». En la medición D ese criterio **sí es decisorio**: es H1b-LCP (rotulada H2 en OSF), que se confirma si la mediana es ≤ 2500 ms (PRERREGISTRO_R39.md §6.2). La mediana fue 2302 ms: confirmada.
- `warmup.txt`: tiempo de `/api/health` antes de cada corrida de la página nueva (el primero, 33 s, despertó el backend).
- `coldstart.txt`: arranque en frío (n = 1, descriptivo), tras 21 minutos sin tráfico.
- `deployed-assets.txt` y `commit.txt`: artefacto medido.
