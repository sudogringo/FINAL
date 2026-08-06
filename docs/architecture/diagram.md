# Diagrama de Arquitectura

Se descompone en varias láminas chicas en vez de un único diagrama grande — así cada una tiene una sola responsabilidad de lectura y el layout automático de Mermaid no termina en cruces de líneas.

- **[0] Overview** — la lámina principal para la tesis: las 3 capas + Postgres + servicios externos, con el flujo lead-to-sale.
- **[1] Frontend** — estructura interna de `src/features/`.
- **[2] Backend** — rutas, modelos y Postgres.
- **[3] n8n** — los 7 módulos agrupados por función de negocio.

Cada set se presenta dos veces: **Arquitectura objetivo** (diseño completo) y **Arquitectura demo / as-built** (lo que corre hoy). Los diagramas de detalle [1]/[2]/[3] no cambian de estructura interna entre ambos — el código es el mismo — así que solo se repiten cuando hay una diferencia real que mostrar; si no, se indica "igual al diagrama objetivo".

Ver también: [`frontend.md`](./frontend.md), [`backend.md`](./backend.md), [`n8n.md`](./n8n.md), [`n8n_workflows.md`](./n8n_workflows.md).

---

## Arquitectura objetivo (diseño completo)

### [0] Overview

```mermaid
---
title: Arquitectura — Vista General
---
flowchart TD
    classDef frontend fill:#e3f2fd,stroke:#1565c0,color:#0d47a1
    classDef backend fill:#e8f5e9,stroke:#2e7d32,color:#1b5e20
    classDef orch fill:#fff3e0,stroke:#ef6c00,color:#e65100
    classDef ext fill:#f3e5f5,stroke:#7b1fa2,color:#4a148c
    classDef db fill:#e8f5e9,stroke:#2e7d32,color:#1b5e20

    FE["🖥️ Frontend<br/>React 19 + Vite"]:::frontend
    BE["⚙️ Backend<br/>Express + Prisma"]:::backend
    DB[("🗄️ PostgreSQL")]:::db
    N8N["🔁 n8n<br/>7 módulos de automatización"]:::orch
    EXT["🌐 Servicios externos<br/>Google · Email · WhatsApp"]:::ext

    FE -- "cotización del carrito" --> BE
    BE -- "guarda lead" --> DB
    BE -- "dispara evento" --> N8N
    N8N -- "lee datos" --> BE
    N8N -- "notifica / publica" --> EXT
```

### [1] Frontend

```mermaid
---
title: Frontend — React 19 + Vite
---
flowchart TD
    classDef box fill:#e3f2fd,stroke:#1565c0,color:#0d47a1

    subgraph FE[" "]
        direction TB
        Catalog["Catálogo<br/>features/products"]:::box
        Cart["Carrito<br/>features/cart<br/>CartContext"]:::box
        Timer["Timer 2h<br/>carrito abandonado"]:::box
        Quote["Cotización<br/>features/quote"]:::box
        Admin["Panel Admin<br/>features/admin<br/>AdminContext"]:::box
    end

    Catalog --> Cart --> Quote
    Cart --> Timer

    style FE fill:#f7fbff,stroke:#1565c0,color:#0d47a1
```

*React 19 + TypeScript + Vite. Estructura feature-based bajo `src/features/`. `Timer` corre enteramente en el cliente: si no hay cotización enviada 2h después de actividad en el carrito, dispara el webhook de carrito abandonado.*

### [2] Backend

```mermaid
---
title: Backend — Express + Prisma
---
flowchart TD
    classDef box fill:#e8f5e9,stroke:#2e7d32,color:#1b5e20
    classDef db fill:#c8e6c9,stroke:#2e7d32,color:#1b5e20,stroke-width:2px

    subgraph BE[" "]
        direction TB
        Auth["/auth<br/>JWT (admin)"]:::box
        Products["/products"]:::box
        Quotes["/quotes"]:::box
        Upload["/upload<br/>Multer"]:::box
        Prisma["Prisma ORM"]:::box
    end
    DB[("PostgreSQL<br/>Product · Quote · Admin")]:::db

    Auth --> Prisma
    Products --> Prisma
    Quotes --> Prisma
    Upload --> Prisma
    Prisma --> DB

    style BE fill:#f6fbf6,stroke:#2e7d32,color:#1b5e20
```

*Express + TypeScript, validación con Zod en todas las rutas. Única fuente de verdad de datos para frontend y n8n.*

### [3] n8n

```mermaid
---
title: n8n — Módulos de Automatización
---
flowchart LR
    classDef marketing fill:#fff3e0,stroke:#ef6c00,color:#e65100
    classDef monitor fill:#fce4ec,stroke:#ad1457,color:#880e4f
    classDef crm fill:#e0f2f1,stroke:#00695c,color:#004d40
    classDef groupMarketing fill:#fffaf0,stroke:#ef6c00,color:#e65100
    classDef groupMonitor fill:#fef6f8,stroke:#ad1457,color:#880e4f
    classDef groupCrm fill:#f0faf9,stroke:#00695c,color:#004d40

    subgraph M["Marketing &amp; Marca"]
        direction TB
        W1["1. Branding"]:::marketing
        W4["4. Social Media<br/>Content Engine"]:::marketing
        W1 -. "colores de marca" .-> W4
    end

    subgraph R["Monitoreo &amp; Reputación"]
        direction TB
        W2["2. SEO &amp; Performance"]:::monitor
        W3["3. Google Maps<br/>Reputation"]:::monitor
        W5["5. Reporte Mensual"]:::monitor
    end

    subgraph C["CRM &amp; Ventas"]
        direction TB
        W6a["6a. Newsletter<br/>Quincenal"]:::crm
        W6b["6b. Carrito<br/>Abandonado"]:::crm
        W7["7. Logística"]:::crm
    end

    M ~~~ R ~~~ C

    style M fill:#fffaf0,stroke:#ef6c00,color:#e65100
    style R fill:#fef6f8,stroke:#ad1457,color:#880e4f
    style C fill:#f0faf9,stroke:#00695c,color:#004d40
```

| # | Módulo | Trigger | Lee del backend |
|---|---|---|---|
| 1 | Automated Branding | Mensual / webhook | — |
| 2 | SEO & Performance Monitor | Semanal, lunes 08:00 | — |
| 3 | Google Maps Reputation | Cada 6h | — |
| 4 | Social Media Content Engine | Webhook (producto nuevo) | `GET /api/products` |
| 5 | Monthly Activity Report | Día 1 de cada mes | `GET /api/stats/monthly` |
| 6a | Newsletter Quincenal | Quincenal (1º/15) | `GET /api/mock/newsletter-subscribers` |
| 6b | Carrito Abandonado | Webhook (2h inactividad) | `GET /api/stats/abandoned-carts` |
| 7 | Logistics Automation | Webhook (orden confirmada) | `GET /api/orders/:id/items` |

*Docker, SQLite propio en `n8n/data/`, puerto 4343. Única dependencia entre workflows: Branding (1) alimenta colores de marca a Social Media (4).*

---

## Arquitectura demo / tesis (as-built)

Mismo esquema visual que la versión objetivo, para comparar lado a lado. Verificado contra el código real: `backend/src/routes/quotes.ts` (el webhook corta con `if (!url) return` si la env var está vacía) y `docker-compose.yml` (`N8N_QUOTE_WEBHOOK`/`N8N_ABANDONED_WEBHOOK` sin valor por default). Los diagramas [1] Frontend y [2] Backend no difieren estructuralmente del objetivo — mismo código — así que no se repiten; solo cambia el overview y la conexión n8n↔Backend.

### [0] Overview (as-built)

```mermaid
---
title: Arquitectura — Vista General (Demo / As-Built)
---
flowchart TD
    classDef frontend fill:#e3f2fd,stroke:#1565c0,color:#0d47a1
    classDef backend fill:#e8f5e9,stroke:#2e7d32,color:#1b5e20
    classDef orch fill:#fff3e0,stroke:#ef6c00,color:#e65100
    classDef db fill:#e8f5e9,stroke:#2e7d32,color:#1b5e20

    FE["🖥️ Frontend<br/>React 19 + Vite"]:::frontend
    BE["⚙️ Backend<br/>Express + Prisma"]:::backend
    DB[("🗄️ PostgreSQL")]:::db
    N8N["🔁 n8n<br/>8 workflows importados<br/>todos inactive"]:::orch

    FE -- "POST /api/quotes ✅" --> BE
    BE -- "GET /api/products ✅" --> FE
    BE -- "guarda lead ✅" --> DB
    BE -. "webhook (env var vacía)" .-> N8N
    N8N -. "GH_API_BASE_URL<br/>sin uso real aún" .-> BE
```

**Leyenda:** línea sólida = implementado y funcionando. Línea punteada = diseñado (código o config presente) pero no activo hoy.

**Gaps identificados** (relevantes para el capítulo de resultados/conclusiones):
- `N8N_QUOTE_WEBHOOK` y `N8N_ABANDONED_WEBHOOK` no están seteados por default en `docker-compose.yml` → el backend nunca dispara hacia n8n en una corrida estándar.
- Ningún workflow de n8n hace `fetch`/`HTTP Request` real contra `GH_API_BASE_URL` todavía, pese a que la infraestructura (`depends_on`, env var) está lista.
- Los 8 workflows están importados en la instancia n8n pero `active: false` — falta activarlos para que corran por schedule/webhook real.

**[1] Frontend** — igual al diagrama objetivo, sin cambios.
**[2] Backend** — igual al diagrama objetivo, sin cambios.
**[3] n8n** — misma agrupación por función de negocio que el objetivo; los 8 workflows existen y están importados en la instancia, pero ninguno está activo (`active: false`) ni hace las llamadas HTTP al backend indicadas en la tabla — ver gaps arriba.

---

## Cronograma del proyecto (Anexo E)

Deriva de la Tabla 3 del cuerpo de la tesis (§3.6, "Hitos principales del proyecto"), que solo documenta **fechas de hito puntuales** (una fecha, un estado). Para el diagrama de Gantt del Anexo E cada fase de trabajo se reconstruye como el intervalo entre un hito y el hito inmediatamente anterior — es la única forma de derivar duraciones reales a partir de una tabla de milestones. Esa inferencia no está en la Tabla 3 original; queda marcada acá para no generar ambigüedad con los datos fuente.

```mermaid
---
title: Anexo E — Diagrama de Gantt del proyecto
---
gantt
    dateFormat  YYYY-MM-DD
    axisFormat  %d/%m
    todayMarker off

    section Fundacional
    Inicio del proyecto                        :milestone, m0, 2026-01-01, 0d
    Auditoría técnica y entrevistas             :done, t1, 2026-01-01, 2026-01-15

    section Diseño
    Aprobación diseño UI/UX (cliente)           :done, t2, 2026-01-15, 2026-02-01

    section Desarrollo — Frontend
    Catálogo React funcional (staging)          :done, t3, 2026-02-01, 2026-03-01

    section Desarrollo — Infraestructura
    Stack n8n + infraestructura Docker          :done, t4, 2026-03-01, 2026-03-15

    section Módulos n8n
    Módulo 1 (Motor de Leads) validado          :done, t5, 2026-03-15, 2026-04-01
    Módulo 2 (Motor RRSS) validado              :done, t6, 2026-04-01, 2026-04-15
    Módulos 3–4 (Omni + Logística) validados    :done, t7, 2026-04-15, 2026-04-30

    section Cierre
    Integración end-to-end y pruebas finales    :done, t8, 2026-04-30, 2026-05-15
    Presentación de tesis                       :active, t9, 2026-05-15, 2026-05-28
    Despliegue en producción (proyectado)       :crit, t10, 2026-05-28, 2026-05-31
```

**Cómo leer las barras:** cada tarea corre desde el hito anterior de la Tabla 3 hasta su propia fecha — la duración es **inferida**, no una fecha de inicio declarada en el documento original. Verde/tildado (`done`) = hito con estado "✓ Completado" en la Tabla 3; naranja (`active`) = "En proceso" (Presentación de tesis); rojo (`crit`) = "Pendiente" (Despliegue en producción). El rombo inicial marca el arranque del proyecto (01/01/2026) como punto cero, sin duración.

Render estático para inserción directa en el `.docx` de la tesis: [`../assets/gantt-anexo-e.png`](../assets/gantt-anexo-e.png).
