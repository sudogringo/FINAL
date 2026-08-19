# Prompt para la próxima sesión — Ronda 4 de corrección de la tesis

Copiar y pegar esto como mensaje inicial:

---

Vengo de una sesión anterior donde trabajamos en `Tesis_Cunto_Rojo_GoldenHarvest_FINAL_v2_.docx`
(raíz del repo) corrigiendo hallazgos de una auditoría (`Auditoria_Tesis_GoldenHarvest_Cunto_Rojo.pdf`,
también en la raíz). El documento pasó por tres rondas de correcciones + re-auditorías:
4,3/10 → 7,2/10 → 7,67/10 (nominal, luego se comprobó inflado) → 7,35/10 (real, tercera
re-auditoría).

## La lección de las rondas anteriores — leé esto antes de tocar nada

Dos rondas seguidas cometieron variantes del mismo error de fondo: **reescribieron secciones
técnicas contra documentación de diseño (`CLAUDE.md`, `docs/architecture/*.md`,
`docs/architecture/n8n_workflows.md`) en vez de contra los artefactos reales del repo.**
`docs/architecture/*.md` describe lo que el proyecto *debería* hacer, no necesariamente lo que
hace. La segunda ronda además tuvo un bug mecánico: un reemplazo de texto insertó contenido
nuevo sin borrar el viejo, dejando el documento con dos versiones contradictorias mezcladas en
la misma sección (se descubrió comparando MD5 de backups — el archivo "corregido" resultó
idéntico al de antes de la edición).

**Regla no negociable para esta ronda: ninguna afirmación técnica se escribe sin haber abierto
primero el archivo fuente real y citado el fragmento exacto que la respalda.** Fuentes de
verdad, en orden de autoridad:

1. `n8n/workflows/*.json` (9 archivos: 01, 02, 03, 04, 05, 06a, 06b, 07, más
   `_TMP_CreateSocialSheet.json` auxiliar) — para CUALQUIER afirmación sobre qué hace un
   workflow, leer el JSON y citar el campo `"url"`, `"type"`, `"name"` real de cada nodo. No
   basta con que el nombre del nodo "suene" razonable — hay que abrir el archivo.
2. `backend/prisma/schema.prisma` — modelo de datos real.
3. `backend/src/routes/*.ts` — endpoints reales (para confirmar que una ruta que un workflow
   dice llamar existe de verdad en el backend, no solo en la documentación).
4. `docker-compose.yml` — nombres de servicio/host/puerto reales (ya se encontró un caso
   donde un workflow llamaba a `golden_harvest_api:8000`, que no existe — el servicio real se
   llama `backend` y escucha en `3001`).
5. `docs/research/lighthouse/results/*.json` — cifras reales de Lighthouse.
6. `docs/research/frontend-tests/*.txt` — output real de tests.
7. `docs/architecture/*.md` — usar solo como *pista* de dónde mirar, nunca como fuente de la
   afirmación final. Si documentación y JSON real no coinciden, gana el JSON, y además hay que
   señalarlo (la documentación también puede estar desactualizada — ya pasó con
   `docs/architecture/n8n.md`, que decía "n8n → Backend: none currently" cuando en realidad
   hay 3 llamadas HTTP reales, y con el Anexo H de la propia tesis, que se autodelata diciendo
   "GH_API_BASE_URL: uso aún no implementado" mientras el cuerpo de la tesis afirma que sí se usa).

## Estado actual conocido (de la tercera re-auditoría — verificar antes de confiar, no asumir)

Hallazgos que quedaron pendientes, en orden de prioridad:

**CRÍTICOS**
- **§5.2.3** afirma que el sistema logístico "demostró su capacidad para generar documentos
  PDF" — pero el nodo PDF real (`PDFMonkey`, en `07._Logistics_Shipping_Automation.json`)
  está en la rama PRODUCCIÓN, deshabilitada, con credencial placeholder sin configurar. La
  rama TESIS (la ejecutada) genera un remito en HTML por Gmail, no un PDF. Esto contradice a
  §4.3, que sí lo dice correctamente. Hay que reescribir §5.2.3 y revisar la Tabla 9 que lo
  acompaña.
- **§4.3 y §4.5** afirman que n8n lee datos reales del backend vía `GET /api/stats/monthly` y
  `/api/orders`. El JSON real de los workflows 05 y 07 apunta a
  `http://golden_harvest_api:8000/...` — host y puerto que no existen en `docker-compose.yml`
  (el servicio real es `backend:3001`). Verificar si esto es un error de configuración real en
  el workflow (en cuyo caso la tesis debería decir que la integración no está verificada
  end-to-end) o si hay otro archivo de config que resuelve ese host — no asumir, comprobar.
- **§4.3** dice que los workflows 06a/06b leen `/api/mock/newsletter-subscribers` y
  `/api/mock/abandoned-carts` del backend propio. Esas rutas no existen en
  `backend/src/routes/*.ts` (verificado por grep, cero resultados). Los JSON reales llaman a
  `jsonplaceholder.typicode.com` (servicio público de datos falsos). Corregir la descripción.

**ALTOS**
- Conteo de workflows inconsistente entre secciones: a veces dice "siete", a veces "ocho",
  a veces "nueve" (el repo tiene 8 funcionales — 01,02,03,04,05,06a,06b,07 — más 1 auxiliar
  `_TMP_CreateSocialSheet.json` = 9 archivos totales). Unificar en todo el documento.
- Índice de tablas tiene un hueco: saltaba de Tabla 7 a Tabla 9 con una línea huérfana sin
  título donde estaba la Tabla 8 vieja (ya eliminada del cuerpo en la ronda 3). Renumerar
  Tabla 9 → 8 en el índice y en el cuerpo, y borrar la línea huérfana.
- §3.2 define VD2 con un criterio de aceptación de 15s que §5.2.1 ya declara "no medido" —
  hay que alinear la definición de la variable con lo que realmente se reportó.
- El Resumen (español) todavía dice "positivos en las tres dimensiones evaluadas" y "aumenta
  la tasa de captura de leads calificados" — contradice §5.3/§6.1, que son más honestos.

**MEDIOS / BAJOS** (no bloqueantes, atacar si sobra tiempo): lenguaje no falsable
("garantiza" ×5), "significativamente" sin prueba estadística, fechas de portada (mayo 2026)
vs. datos medidos (agosto 2026), Anexos E/F/J todavía descriptivos en vez de con contenido,
desorden alfabético CLS/CLV en el glosario, índice general del documento sin generar (requiere
abrir en Word manualmente, no es corregible por script).

## Método de edición del .docx (ya validado, usarlo tal cual)

```python
# 1. Copiar el .docx real a un working copy, extraer con unzip -o -q archivo.docx -d extracted
# 2. word/document.xml es un único string sin saltos de línea. Partir en bloques:
import re
blocks = re.findall(r'<w:p\b.*?</w:p>|<w:tbl\b.*?</w:tbl>', xml, re.DOTALL)
# 3. Texto de un bloque: ''.join(re.findall(r'<w:t[^>]*>([^<]*)</w:t>', block))
# 4. Para reemplazar: confirmar unicidad con assert xml.count(texto_viejo) == 1 ANTES de
#    reemplazar (si no es único, ampliar el contexto capturado). Escapar SIEMPRE el texto
#    nuevo con xml.sax.saxutils.escape() antes de insertarlo (un '&' sin escapar rompió el
#    XML en una ronda anterior).
# 5. Validar bien-formado con xml.etree.ElementTree.parse() después de CADA tanda de cambios,
#    no solo al final.
# 6. CRÍTICO — la causa del bug de la ronda 2: cuando se reemplaza una sección completa por
#    una nueva, verificar EXPLÍCITAMENTE después del reemplazo que el texto viejo (headers,
#    frases clave) ya NO aparece en el XML final — no alcanza con confirmar que el texto
#    nuevo sí aparece. Los dos pueden coexistir si el `old_slice` no capturó el rango exacto.
# 7. Reempaquetar: cd extracted && zip -r -X -q ../output.docx . -x ".*"
# 8. Verificar el zip: python3 -c "import zipfile; z=zipfile.ZipFile('output.docx'); print(z.testzip())" → debe imprimir None
# 9. Backup del original ANTES de sobrescribir: cp original.docx original.docx.bak-preN
# 10. Copiar output.docx sobre el archivo real.
# 11. Verificación post-escritura OBLIGATORIA: comparar MD5 del backup nuevo contra backups
#     anteriores — si coinciden, el cp no se aplicó o el output no tenía los cambios (esto
#     pasó en la ronda 2 y no se detectó hasta la ronda 3).
```

## Flujo de trabajo pedido para esta sesión

1. **Agente Fixer** — recibe la lista de hallazgos de arriba (re-verificarlos primero contra
   el estado actual del docx, pueden haber cambiado si hubo edición manual entremedio) y los
   corrige uno por uno, citando el archivo fuente real para cada afirmación técnica que
   escriba. Al terminar, hace su propia verificación de que el texto viejo desapareció (no
   solo que el nuevo apareció) y reporta qué tocó.
2. **Agente Re-auditor** (mismo criterio ya usado, ver `audit_criteria.md` si sigue en el
   scratchpad de la sesión anterior — si no, reconstruir desde
   `Auditoria_Tesis_GoldenHarvest_Cunto_Rojo.pdf`, secciones 1–3, páginas 2–5) — corre después
   del Fixer, sobre el documento completo, con instrucción explícita de verificar
   anti-duplicación y de re-abrir los JSON de n8n/backend por su cuenta para confirmar (no
   creerle al Fixer) que las afirmaciones técnicas nuevas son ciertas.
3. Al final, informame en texto plano: qué se corrigió realmente (con nota de qué se verificó
   contra qué archivo), qué quedó pendiente, y la calificación nueva comparada con el
   historial (4,3 → 7,2 → 7,67 nominal → 7,35 real → nueva).

No asumas que herramientas o rutas del scratchpad de la sesión anterior siguen existiendo —
son temporales. Si hace falta, volvé a extraer el docx y re-generar cualquier archivo de
apoyo desde cero.
