# Relevamiento de canales públicos de Golden Harvest S.A. (09/10/2026)

Respaldo de la afirmación de §1.1 de la tesis sobre la presencia en redes de la empresa (eje 2 del problema).

## Instagram (`@silvia_golden_harvest`)

- **Fecha de consulta:** 09/10/2026.
- **Perfil:** 6 publicaciones, 192 seguidores, 14 seguidos. La captura es `instagram-perfil-2026-10-09.png`, con la línea «X sigue esta cuenta» tapada porque identifica a una persona particular.
- **Publicaciones:** el detalle está en `instagram-publicaciones-2026-10-09.csv`.
  - Las seis van del 18/10/2023 al 20/03/2025.
  - Entre una y otra pasan de 15 a 258 días (más de ocho meses y medio).
  - No hay publicaciones posteriores al 20/03/2025.

**Método:** las fechas se obtienen del código de cada publicación (*shortcode*). Ese código codifica en base64 el id del medio, y los bits altos del id son el instante de creación en milisegundos desde la época de Instagram (`(id >> 23) + 1314220021721`). Una fecha decodificada se cotejó contra la que muestra la publicación. El cálculo es reproducible con el código de la sección siguiente.

## Facebook y TikTok

- **Facebook:** los autores revisaron la página manualmente; su última publicación es de 2024. No hay captura.
- **TikTok:** la empresa no tiene perfil.

## Reproducir la fecha de una publicación

```python
A = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
n = 0
for ch in 'CyjUYA7u7co':
    n = n * 64 + A.index(ch)
ms = (n >> 23) + 1314220021721   # 2023-10-18 (UTC-3)
```
