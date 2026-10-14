# Estudio 2 — Usabilidad confirmatoria del catálogo: protocolo

**Estado:** materiales listos; datos pendientes. Las hipótesis y las reglas de decisión se fijan en el prerregistro (ver `../HIPOTESIS_PROPUESTAS.md`) **antes** de la primera sesión.
**Investigadores:** Cunto Boberg, Tiago y Rojo, Emiliano (UTN).
**Antecedente:** el estudio SUS de septiembre de 2026 (`docs/research/usability/`).

## 1. Objetivo

Reemplazar la evidencia de VD4 (usabilidad del catálogo) por un estudio que corrija las debilidades del anterior:

| Debilidad del estudio anterior | Corrección en este estudio |
|---|---|
| n = 5 | n ≥ 10, objetivo 12 |
| Participantes familiares, amigos y parejas de los autores | Personas con perfil de comprador comercial; se excluyen familiares directos y parejas |
| Moderación a cargo de los autores (dos moderadores distintos) | Un único moderador neutral que no participó del desarrollo, con guion literal |
| SUS con traducción propia | Versión en español validada (Sevilla-Gonzalez et al., 2020) |
| Reglas de decisión fijadas después de ver los datos | Hipótesis y reglas prerregistradas |
| Consentimiento verbal | Consentimiento escrito |
| Una sola tarea, con un criterio de éxito ambiguo («al menos tres productos») | Tres tareas con criterio objetivo y verificable |

## 2. Participantes

### 2.1 Criterios de inclusión

- Mayor de 18 años.
- **Perfil de comprador comercial:** compra o compró mercadería para un negocio (comercio, almacén, restaurante, bar, distribuidora, kiosco u otro) **o** gestionó alguna vez compras a proveedores, como empleado o como dueño.
- Usa internet de forma habitual.

### 2.2 Criterios de exclusión

- Familiares directos (padres, hijos, hermanos, abuelos) o parejas de cualquiera de los autores.
- Participantes del estudio de septiembre de 2026 (P1–P5).
- Personas que participaron en el desarrollo del sistema o que ya lo conocen en detalle.
- Personas vinculadas laboralmente con Golden Harvest S.A.

Las relaciones de amistad o de compañeros de estudio no excluyen, pero se registran en la columna `vinculo_autores` (`ninguno`, `conocido`, `amigo`) y se informan.

### 2.3 Tamaño de muestra: n ≥ 10, objetivo 12

- **Nielsen y Landauer (1993)** muestran que unos 5 usuarios bastan para **descubrir** la mayoría de los problemas frecuentes en una prueba formativa. Ese argumento no sirve para **estimar** una tasa de éxito ni un puntaje SUS con precisión, que es lo que exige un estudio confirmatorio.
- **Sauro y Lewis (2016)** tratan el tamaño de muestra para estimación y contraste. Con muestras de 10 a 12, el intervalo de confianza del 95 % del SUS medio tiene un margen de unos ±8 a ±13 puntos, si la desviación estándar está entre 12,5 y 17,7 (cálculo propio: t × DE / √n). Alcanza para distinguir un sistema claramente por encima del promedio de uno promedio, pero no diferencias finas.
- **Potencia aproximada de las hipótesis con n = 10–12:** ver `../HIPOTESIS_PROPUESTAS.md`.
- **Por qué no más.** Zero budget y plazos de la tesis: 12 es el máximo realista con un moderador voluntario. Se declara como limitación.
- **Regla de parada (prerregistrada):** se termina al llegar a 12 sesiones válidas o en la fecha límite que fijen los autores en el prerregistro, lo que ocurra primero. Si en la fecha límite hay menos de 10, se informa el n alcanzado y el estudio se declara **subpotenciado**: no se reinterpreta como confirmatorio.
- **Sesión válida:** la que completó el consentimiento y al menos la tarea 1. Las sesiones interrumpidas por fallas del entorno (ver §4.3) no cuentan y se registran como incidencias.

## 3. Moderador

- Un **único moderador** para todas las sesiones: un compañero o compañera de la carrera que **no participó** del desarrollo del sistema.
- Antes de empezar, hace **una sesión piloto** con alguien que no cuenta para la muestra, siguiendo `GUION_MODERADOR.md`.
- Los autores **no están presentes** en la sala ni en la llamada durante la sesión. Pueden preparar el entorno antes y retirarse.
- El moderador no conoce las hipótesis prerregistradas, más allá de lo que figura en el guion.

## 4. Entorno de prueba

### 4.1 Sitio

- **Previsto:** el sitio publicado, https://sudogringo.github.io/FINAL/.
- **Bloqueante detectado el 14/10/2026.** El build publicado en GitHub Pages llama a la API en `http://localhost:3001`, porque `deploy.yml` no define `VITE_API_URL`. Además, el backend solo acepta CORS de orígenes `http://localhost:*`. En consecuencia, desde cualquier dispositivo de un participante **el catálogo aparece vacío y la cotización no se puede enviar**.

  Mientras los autores no lo resuelvan, el estudio **no puede hacerse sobre el sitio publicado**. Hay dos opciones; los autores eligen una y la fijan en el prerregistro.

  - **Opción A — staging local (no requiere cambiar código).** El estudio se hace en la notebook del moderador con el stack local:
    1. `docker compose up -d` en la raíz;
    2. `npm run db:seed` en `backend/`;
    3. `npm run build && npm run preview` en `frontend/`;
    4. abrir `http://localhost:4173/FINAL/`.

    Esta opción admite la modalidad presencial y la remota con **control remoto** del navegador del moderador (por ejemplo, la función de control remoto de Zoom). Una pantalla compartida de solo lectura **no alcanza**, porque el participante tiene que operar la interfaz.
  - **Opción B — publicar un backend accesible.** Implica cambiar código y configuración: `VITE_API_URL` en el build y el origen CORS del backend. Requiere un nuevo commit del artefacto antes de congelarlo (§4.2). Con zero budget, solo es viable con un servicio de alojamiento gratuito.

    Al 14/10/2026 hay **cambios sin commitear** en el árbol de trabajo que apuntan a esta opción:

    - `docs/architecture/deploy-remoto.md` (Render + Neon) y `render.yaml`;
    - `VITE_API_URL` en `deploy.yml` y un middleware CORS nuevo (`backend/src/middleware/cors.ts`).

    Si se adopta, hay que agregar dos verificaciones:

    1. **Arranque en frío.** El plan gratuito de Render suspende el servicio inactivo. El moderador debe abrir el catálogo **varios minutos antes** de cada sesión y confirmar que cargan los 8 productos. Si no, la primera espera contamina el tiempo de la tarea 1.
    2. **n8n no recibe los avisos.** n8n queda local y no alcanzable, así que las cotizaciones no disparan el correo del workflow 00. Esto no afecta lo que ve el participante.

### 4.2 Congelamiento del artefacto

- Se registra el **commit medido** en el prerregistro.
- No se modifica `frontend/` ni `backend/` hasta terminar todas las sesiones. Si fuera imprescindible, se informa como desvío.
- **Validación del teléfono.** El campo Teléfono acepta de 8 a 15 **dígitos**, con un `+` inicial opcional y espacios o guiones como separadores (`frontend/src/features/quote/phone.ts`). El ejemplo de la interfaz, `+54 9 11 0000-0000`, es válido. La corrección se publica con el próximo deploy, antes de las sesiones. El moderador verifica que el commit medido la incluya. Si un participante igual ve un mensaje de validación, se registra como error de formulario.

### 4.3 Verificación previa a cada sesión (checklist del moderador)

- Abrir la portada y luego Catálogo: deben verse **8 productos** («Todo · 8»).
- Agregar un producto, abrir «Mi Pedido» y recargar la página: el pedido debe quedar vacío.
- Si se usa la opción A con n8n en marcha, cada cotización dispara el workflow 00, que envía un correo de aviso. Es esperable. Las cotizaciones del estudio se identifican por el correo ficticio de `DATOS_FICTICIOS.md`.
- Navegador: Chrome o Edge actualizado, ventana maximizada, zoom al 100 %, sin extensiones que modifiquen páginas, en una ventana de incógnito nueva para cada participante.

### 4.4 Dispositivo

Notebook o PC, para mantener la comparabilidad con el estudio anterior. La versión móvil queda fuera de alcance y se declara como limitación. Se registran el dispositivo y el navegador.

## 5. Tareas

Se presentan **en este orden fijo**. La tarea 1 es la **tarea principal** y es comparable con la única tarea del estudio anterior, que también era la primera. Las consignas literales están en `GUION_MODERADOR.md`, y los datos para el participante, en `DATOS_FICTICIOS.md`.

| Tarea | Inicio | Consigna (resumen) | Criterio de éxito (objetivo y verificable) | Límite |
|---|---|---|---|---|
| **T1 — Pedido y cotización (principal)** | Portada (`/FINAL/`) | Armar un pedido con 3 productos en presentaciones y cantidades indicadas y enviar la solicitud de cotización con los datos ficticios | **Éxito estricto:** aparece «¡Cotización enviada!» **y** la cotización registrada contiene exactamente **Tomate Entero Pelado 4 kg × 3**, **Mitades en Almíbar 1 kg × 6** y **Doble Concentrado 250 g × 12**, sin otras líneas. Se verifica en el resumen «Productos solicitados» antes del envío o en el panel `/admin/cotizaciones` después. **Criterio comparable** (el del estudio anterior): la solicitud se envía con al menos 3 variedades distintas. Se registra aparte. | 8 min |
| **T2 — Encontrar un producto** | Catálogo (`/FINAL/catalogo`), recargado | Un cliente pide «tomate en cubos»: encontrarlo y decir su nombre y sus presentaciones | El participante dice **«Cubetti di Pomodoro»** y las presentaciones **250 g y 1 kg** (las dos, sin agregar otras). | 3 min |
| **T3 — Modificar el pedido** | Catálogo, recargado (pedido vacío) | Agregar Salsa Clásica 1 kg × 2 y Durazno al Natural 250 g × 4; luego cambiar la salsa a 5 unidades y quitar el durazno, sin enviar | Al decir «terminé», «Mi Pedido» contiene **solo Salsa Clásica 1 kg × 5**. | 4 min |

**El tiempo se toma** desde que el participante dice «listo» o «empiezo», después de leer la consigna, hasta que:

- aparece «¡Cotización enviada!» (T1);
- termina de decir la respuesta (T2);
- dice «terminé» (T3).

Se registra en segundos.

**Tarea fallida** si ocurre cualquiera de estas condiciones:

1. se alcanza el límite de tiempo;
2. el participante pide ayuda sobre **cómo usar la interfaz** y, después de la respuesta neutral del guion, insiste o dice que no puede seguir;
3. abandona («no sé», «paso»);
4. declara terminada la tarea sin cumplir el criterio.

Las preguntas sobre la **consigna** («¿era 1 kg?») se responden releyendo la consigna o señalando la hoja de datos, sin dar indicaciones sobre la interfaz, y **no** cuentan como pedido de ayuda.

Se registra el motivo del fallo: `tiempo`, `ayuda`, `abandono` o `criterio`.

**Errores** (se cuentan, no hacen fallar la tarea por sí solos):

- agregar un producto, presentación o cantidad incorrectos y luego corregirlos;
- un mensaje de validación del formulario;
- abrir una sección equivocada y volver;
- usar el botón «Atrás» del navegador para deshacer.

Se registran como conteo y con una descripción breve.

## 6. Instrumento SUS

- Versión en español validada de Sevilla-Gonzalez et al. (2020), copiada **literalmente** en `SUS_ES.md`. La fuente es el Apéndice multimedia 2 del artículo, guardado en `fuente/`.
- Se administra **después de las tres tareas**, autoadministrado en papel o en un formulario. El moderador no mira mientras el participante responde.
- Antes de entregar el cuestionario, el moderador aclara que «la herramienta» es el catálogo web que acaba de usar. La frase está en el guion.
- **Limitaciones del instrumento a declarar:**
  - fue validado en Ciudad de México y con herramientas electrónicas de salud (n = 88, α de Cronbach = 0,812);
  - el ítem 9 está redactado en masculino («Me sentí muy confiado»). Se mantiene literal para no alterar el instrumento validado.

## 7. Métricas y análisis

| Métrica | Unidad | Análisis |
|---|---|---|
| Completitud por tarea (éxito estricto) | Proporción | x/n, con IC de Clopper-Pearson del 95 % |
| Completitud T1, criterio comparable | Proporción | x/n, solo para comparar con el estudio de septiembre (4/5 según su criterio) |
| Tiempo por tarea | Segundos | Mediana, mínimo y máximo, y media geométrica con IC del 95 % sobre log(tiempo) (Sauro y Lewis, 2016), solo para las tareas exitosas; los fallos se informan aparte |
| Errores | Conteo por tarea | Total, participantes con al menos un error y descripción |
| SUS | 0–100 | Media con IC del 95 % (t), mediana y rango, y distribución por participante |

El contraste confirmatorio se limita a las hipótesis prerregistradas. Todo lo demás, incluida la comparación con el SUS de 94,5 del estudio anterior, se informa como **exploratorio**.

## 8. Ética y manejo de datos

- **Consentimiento escrito** (`CONSENTIMIENTO.md`) antes de empezar. La grabación de pantalla es opcional y requiere una aceptación aparte.
- Cada participante se identifica como `U01`…`U12`. La correspondencia entre código y persona se guarda **fuera del repositorio**.
- **Se publica:** `planilla.csv` con el código, la fecha, la modalidad, el perfil en categoría amplia, el tramo etario, los resultados, los tiempos, las observaciones anonimizadas y las respuestas SUS.
- **No se publica:** nombres, contactos, grabaciones ni capturas con datos personales.
- Las grabaciones, si las hay, se usan solo para verificar tiempos y criterios, y se borran cuando se aprueba la tesis.
- Sin compensación. Sin revisión de un comité de ética, lo que se declara en la tesis.

## 9. Referencias

- Bangor, A., Kortum, P., & Miller, J. (2009). Determining what individual SUS scores mean: Adding an adjective rating scale. *Journal of Usability Studies, 4*(3), 114–123.
- Brooke, J. (1996). SUS: A "quick and dirty" usability scale. En P. W. Jordan et al. (Eds.), *Usability evaluation in industry* (pp. 189–194). Taylor & Francis.
- Nielsen, J., & Landauer, T. K. (1993). A mathematical model of the finding of usability problems. En *Proceedings of INTERCHI '93* (pp. 206–213). ACM.
- Sauro, J., & Lewis, J. R. (2016). *Quantifying the user experience: Practical statistics for user research* (2.ª ed.). Morgan Kaufmann.
- Sevilla-Gonzalez, M. del R., Moreno Loaeza, L., Lazaro-Carrera, L. S., Bourguet Ramirez, B., Vázquez Rodríguez, A., Peralta-Pedrero, M. L., & Almeda-Valdes, P. (2020). Spanish version of the System Usability Scale for the assessment of electronic tools: Development and validation. *JMIR Human Factors, 7*(4), e21161. https://doi.org/10.2196/21161
