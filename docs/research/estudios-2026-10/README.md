# Estudios con personas de octubre de 2026

**Estado: materiales listos; datos pendientes.** Preparados el 14/10/2026.

Estos dos estudios responden a dos críticas de la evaluación:

1. el segundo eje del problema, la carga de los procesos manuales en las PyMEs, se presentaba como supuesto;
2. la validación de VD4 era débil: n = 5, participantes familiares, moderación de los autores, una traducción propia del SUS y reglas de decisión fijadas después de ver los datos (ver `docs/research/usability/`).

## Índice

| Archivo | Contenido |
|---|---|
| [`MENSAJE_RECLUTAMIENTO.md`](MENSAJE_RECLUTAMIENTO.md) | Mensajes de WhatsApp o correo para invitar a participar, uno por estudio |
| [`HIPOTESIS_PROPUESTAS.md`](HIPOTESIS_PROPUESTAS.md) | Propuesta de hipótesis y reglas de decisión del Estudio 2, con su potencia, para pasar al prerregistro |
| **Estudio 1 — Entrevistas a PyMEs** (descriptivo) | |
| [`entrevistas-pymes/PROTOCOLO.md`](entrevistas-pymes/PROTOCOLO.md) | Objetivo, criterios, n = 5–8 con saturación, procedimiento, manejo de datos y plan de análisis |
| [`entrevistas-pymes/GUIA.md`](entrevistas-pymes/GUIA.md) | Guion literal: 15 preguntas, la mayoría cuantificables y con su unidad |
| [`entrevistas-pymes/CONSENTIMIENTO.md`](entrevistas-pymes/CONSENTIMIENTO.md) | Consentimiento para leer o enviar por mensaje, con la fórmula de aceptación |
| [`entrevistas-pymes/planilla.csv`](entrevistas-pymes/planilla.csv) | Una fila por PyME (`PyME-01`…) |
| **Estudio 2 — Usabilidad del catálogo** (confirmatorio) | |
| [`usabilidad-catalogo/PROTOCOLO.md`](usabilidad-catalogo/PROTOCOLO.md) | Diseño, criterios, n ≥ 10 (objetivo 12), entorno, tareas con criterio de éxito, métricas y ética |
| [`usabilidad-catalogo/GUION_MODERADOR.md`](usabilidad-catalogo/GUION_MODERADOR.md) | Guion literal del moderador neutral: qué decir, qué no decir, cuándo una tarea falla y cómo registrar |
| [`usabilidad-catalogo/CONSENTIMIENTO.md`](usabilidad-catalogo/CONSENTIMIENTO.md) | Consentimiento escrito, con la grabación de pantalla como opción aparte |
| [`usabilidad-catalogo/SUS_ES.md`](usabilidad-catalogo/SUS_ES.md) | SUS en español validado (Sevilla-Gonzalez et al., 2020), texto literal y cálculo del puntaje |
| [`usabilidad-catalogo/fuente/`](usabilidad-catalogo/fuente/) | Apéndice multimedia 2 del artículo de JMIR, de donde sale el texto del SUS (CC BY 4.0) |
| [`usabilidad-catalogo/DATOS_FICTICIOS.md`](usabilidad-catalogo/DATOS_FICTICIOS.md) | Hoja del participante: lista de productos y datos de contacto ficticios |
| [`usabilidad-catalogo/planilla.csv`](usabilidad-catalogo/planilla.csv) | Una fila por participante (`U01`…) |

## ⚠ Bloqueante del Estudio 2: resolverlo antes de agendar sesiones

El sitio publicado (https://sudogringo.github.io/FINAL/) **no carga el catálogo** desde el dispositivo de ningún participante:

- el build de GitHub Pages llama a `http://localhost:3001`, porque `deploy.yml` no define `VITE_API_URL`;
- el backend solo acepta CORS de `http://localhost:*`.

Las opciones son el staging local en la notebook del moderador (sin cambiar código) o publicar un backend. Al 14/10/2026 hay cambios **sin commitear** que preparan la segunda: `docs/architecture/deploy-remoto.md`, `render.yaml` y `VITE_API_URL` en `deploy.yml`. El detalle está en `usabilidad-catalogo/PROTOCOLO.md`, §4.1.

El Estudio 1 no depende de esto y **puede empezar hoy**.

## Checklist para los autores

### Hoy

- [ ] Completar el contacto (nombre y correo o teléfono) en los dos `CONSENTIMIENTO.md` y en `MENSAJE_RECLUTAMIENTO.md`.
- [ ] **Estudio 1:** enviar los primeros mensajes de reclutamiento y apuntar a 8 contactos para lograr entre 5 y 8 entrevistas.
- [ ] **Estudio 2:** conseguir al **moderador**, un compañero que no haya participado del desarrollo, y pasarle `GUION_MODERADOR.md`.
- [ ] **Estudio 2:** empezar a reclutar compradores comerciales, sin agendar todavía, y apuntar a 15 contactos para lograr 12 sesiones. Descartar a familiares directos, parejas y a P1–P5.

### Antes de la primera sesión del Estudio 2

- [ ] Decidir la opción de entorno, A o B (`PROTOCOLO.md`, §4.1), y verificar que el commit medido incluya la validación de teléfono corregida (§4.2).
- [ ] Fijar el **commit medido**.
- [ ] Pasar las hipótesis elegidas de `HIPOTESIS_PROPUESTAS.md` al prerregistro, en una sección nueva de `docs/research/prerregistro-2026-10/PRERREGISTRO.md` o en un archivo propio con el mismo formato. Incluir:
  - las reglas de decisión;
  - la fecha límite y la regla de parada;
  - el entorno;
  - el commit medido.
- [ ] **Hacer el commit del prerregistro antes de la primera sesión.** Este es el paso que responde a la crítica F3/F4.
- [ ] Hacer la sesión piloto del moderador con alguien que no cuente para la muestra, y ajustar solo la logística, no las consignas. Si hay que cambiar una consigna, se cambia **antes** del commit del prerregistro.
- [ ] Si se usa un formulario en línea para el SUS, armarlo según `SUS_ES.md` y verificar que el texto sea idéntico.

### Durante la recolección

- [ ] Consentimiento escrito antes de cada sesión o entrevista. Guardar las aceptaciones en una **carpeta privada fuera del repositorio**, junto con la tabla código ↔ persona.
- [ ] Cargar cada fila en el `planilla.csv` correspondiente **el mismo día**.
- [ ] Revisar el texto libre antes de cada commit: sin nombres, comercios, direcciones ni teléfonos.
- [ ] Registrar todo desvío con fecha y motivo en `docs/research/prerregistro-2026-10/DESVIOS.md`.
- [ ] Estudio 1: codificar las preguntas abiertas a medida que avanzan las entrevistas, para aplicar el criterio de saturación.

### Al cerrar

- [ ] Estudio 2: calcular el SUS con la fórmula de `SUS_ES.md` (completar `sus_puntaje`), los IC de t y de Clopper-Pearson, y aplicar las reglas **tal como se prerregistraron**.
- [ ] Estudio 1: medianas y rangos, más la codificación doble de las preguntas abiertas.
- [ ] Escribir un `RESULTADOS.md` por estudio y actualizar este README («datos cargados; análisis en …»).
- [ ] Actualizar la tesis: el segundo eje del problema (Estudio 1) y VD4 (Estudio 2), con sus limitaciones.

## Dónde guardar cada cosa

| Qué | Dónde |
|---|---|
| Respuestas anonimizadas | `entrevistas-pymes/planilla.csv`, `usabilidad-catalogo/planilla.csv` (se versionan) |
| Hojas SUS en papel (escaneadas) | Carpeta privada. Solo se versiona lo transcripto. |
| Consentimientos, tabla código ↔ persona, grabaciones | Carpeta privada **fuera del repositorio** (por ejemplo, un Drive de los autores). **Nunca** en git. |
| Resultados y análisis | `RESULTADOS.md` dentro de cada carpeta de estudio |
