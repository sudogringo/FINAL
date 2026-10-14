# Despliegue remoto del backend (Render + Neon)

Este documento describe cómo publicar el backend de Golden Harvest S.A. en servicios de plan gratuito, sin tarjeta de crédito: **Neon** (PostgreSQL) y **Render** (servicio web). El frontend permanece en GitHub Pages (`https://sudogringo.github.io`) y n8n continúa ejecutándose de forma local.

## 1. Arquitectura resultante

```
GitHub Pages (frontend)  --HTTPS-->  Render (backend Express)  --SSL-->  Neon (PostgreSQL)
                                          |
                                          +-- webhooks hacia n8n: SKIPPED si n8n no es accesible desde Internet
```

Como n8n corre en un equipo local, Render no puede alcanzarlo. El backend lo tolera: las entregas del *outbox* cuyo destino no está configurado se marcan `SKIPPED` (ver sección 7) y no se pierde ningún dato de negocio.

## 2. Crear la base de datos en Neon

1. Ingresar a <https://neon.tech> y crear una cuenta (acceso con GitHub o correo; no solicita tarjeta).
2. Crear un proyecto (por ejemplo `golden-harvest`), con PostgreSQL 16 o superior y la región más cercana disponible.
3. En el panel del proyecto, botón **Connect**, copiar la cadena de conexión directa (sin el *pooler*), que tiene la forma:
   `postgresql://USUARIO:CLAVE@ep-xxxx.region.aws.neon.tech/neondb?sslmode=require`
4. Verificar que la cadena termine en **`?sslmode=require`**. Neon rechaza conexiones sin SSL; si falta el parámetro, agregarlo.

Esta cadena es un secreto: se pega únicamente en el panel de Render (sección 3) y, de forma temporal, en la terminal propia para el seed (sección 5). Nunca se guarda en el repositorio.

## 3. Crear el servicio en Render

Opción A (recomendada, Blueprint):

1. Ingresar a <https://render.com>, crear una cuenta (acceso con GitHub) y elegir **New > Blueprint**.
2. Seleccionar el repositorio del proyecto. Render lee `render.yaml` de la raíz y propone el servicio `golden-harvest-api` (plan *Free*, directorio raíz `backend`).
3. Render solicitará los valores de las variables marcadas como secretas (tabla siguiente). Completarlas y confirmar.

Opción B (manual): **New > Web Service**, repositorio del proyecto, *Root Directory* `backend`, *Runtime* Node, *Instance Type* Free, y los comandos de la sección 4.

### Variables de entorno

| Variable | Valor | Obligatoria |
|---|---|---|
| `DATABASE_URL` | Cadena de Neon con `?sslmode=require` | Sí |
| `JWT_SECRET` | Cadena aleatoria larga (por ejemplo `openssl rand -base64 48`) | Sí |
| `SERVICE_API_KEY` | Cadena aleatoria; la usará n8n en el encabezado `X-Service-Key` | Sí |
| `SEED_ADMIN_PASSWORD` | Contraseña del administrador (mínimo 12 caracteres), usada solo al ejecutar el seed | Sí, para el seed |
| `FRONTEND_URL` | `https://sudogringo.github.io` (varios orígenes separados por coma) | Sí |
| `NODE_ENV` | `production` (ya definida en `render.yaml`) | Sí |
| `N8N_QUOTE_WEBHOOK`, `N8N_LOGISTICS_WEBHOOK` | URL pública de n8n; dejar vacías si n8n es local | No |

`PORT` lo define Render automáticamente y el backend lo respeta. Ninguna clave real debe cargarse en archivos del repositorio.

## 4. Comandos de construcción y arranque

| Etapa | Comando |
|---|---|
| Build | `npm ci --include=dev && npm run build:render` (equivale a `prisma generate && tsc`) |
| Start | `npm run start:render` (equivale a `prisma migrate deploy && node dist/index.js`) |
| Health check | `/api/health` |

`--include=dev` es necesario porque `prisma` y `typescript` son dependencias de desarrollo. Las migraciones se aplican automáticamente en cada arranque (`migrate deploy` es idempotente y no destructivo).

## 5. Cargar los datos simulados (seed)

El seed (`npm run db:seed`) solo crea datos sintéticos: el usuario administrador `admin@goldenharvest.com` y el catálogo de productos con stock aleatorio. Es idempotente (usa `upsert`), aunque volver a ejecutarlo restablece la contraseña del administrador y el stock simulado.

Con el servicio ya desplegado (migraciones aplicadas), ejecutarlo una única vez desde un equipo propio:

```bash
cd backend
npm ci
export DATABASE_URL='<cadena de Neon con ?sslmode=require>'
export SEED_ADMIN_PASSWORD='<contraseña de al menos 12 caracteres>'
npm run db:seed
```

(En PowerShell: `$env:DATABASE_URL='...'`.) Alternativa: la pestaña **Shell** de Render permite ejecutar `npm run db:seed` dentro del servicio, pero puede no estar disponible en el plan gratuito.

## 6. Verificación

1. `https://<servicio>.onrender.com/api/health` debe responder `{"status":"ok","db":"up"}`. Si responde 503 con `"db":"down"`, revisar `DATABASE_URL` (en particular `sslmode=require`).
2. `https://<servicio>.onrender.com/api/products` debe listar los productos simulados.
3. Desde la consola del navegador, en `https://sudogringo.github.io`, un `fetch` al API no debe producir error de CORS (si lo produce, revisar `FRONTEND_URL`: debe coincidir exactamente con el origen, sin ruta).
4. Con el token de administrador (o `X-Service-Key`), `GET /api/webhook-deliveries` lista el estado del *outbox*.

## 7. Entrega de webhooks hacia n8n en el despliegue remoto

Cada notificación se guarda en la tabla `webhook_deliveries` dentro de la misma transacción que la cotización o la orden, y un proceso interno la entrega con reintentos (retroceso exponencial desde 30 s, tope de 1 h, hasta 8 intentos; encabezado `Idempotency-Key`). Si `N8N_QUOTE_WEBHOOK` o `N8N_LOGISTICS_WEBHOOK` están vacías, la entrega queda en estado `SKIPPED` con el motivo en `lastError`; el sistema no falla ni reintenta. Para recibir notificaciones reales habría que exponer n8n públicamente (por ejemplo con un túnel gratuito) y cargar las URL; las entregas `SKIPPED` anteriores no se reenvían automáticamente.

## 8. Comportamiento del plan gratuito

- **Suspensión por inactividad:** Render suspende el servicio gratuito tras unos 15 minutos sin tráfico. La primera solicitud posterior tarda aproximadamente un minuto en responder mientras el servicio se reactiva (*cold start*); el frontend debe tolerar ese primer retardo o reintentar.
- Mientras el servicio está suspendido no corre el proceso de reintentos del outbox; las entregas pendientes se envían al reactivarse.
- **Neon** también suspende el cómputo por inactividad; la reactivación demora pocos segundos.
- El sistema de archivos de Render es efímero: las imágenes subidas por `/api/upload` no persisten entre despliegues.

## 9. Postura de seguridad

- **Solo datos simulados:** no existe acceso a datos reales de la empresa; la base remota contiene únicamente información sintética.
- **Secretos únicamente en el panel de Render** (variables con `sync: false`); ningún secreto se versiona. Rotar `JWT_SECRET`, `SERVICE_API_KEY` y la contraseña del administrador ante cualquier sospecha de filtración.
- **CORS restringido** a los orígenes de `FRONTEND_URL` (en producción no se admite `localhost`).
- **Límite de tasa por IP** en los endpoints públicos de escritura: `POST /api/quotes` (10 cada 10 minutos) y `POST /api/interactions` (120 por minuto), con respuesta 429 y `Retry-After`. Es un limitador en memoria apto para una sola instancia; se ajusta con `RATE_LIMIT_QUOTES_MAX` y `RATE_LIMIT_INTERACTIONS_MAX`.
- **TLS** extremo a extremo: HTTPS provisto por Render y `sslmode=require` hacia Neon.
- Las rutas administrativas requieren JWT; las de lectura para n8n, `X-Service-Key`.
