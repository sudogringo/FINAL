# Archivo de trabajo interno

Documentos de seguimiento que el equipo usó durante la redacción de la tesis. Se conservan por
trazabilidad del proceso, pero **no son afirmaciones vigentes del proyecto**: describen versiones
anteriores del documento y pueden contradecir la versión final.

| Archivo | Qué es | Por qué no es vigente |
|---|---|---|
| `promises.md` | Auditoría interna de la versión 2 de la tesis contra el repositorio. | Enumera resultados de la versión 2 que se retiraron después (n=50, 8,3 s, 100 % de éxito, líneas de base atribuidas al personal de la empresa). La versión final no los sostiene. |
| `citations.md` | Informe de validez de citas del primer borrador (23/06/2026), generado con asistencia de IA para detectar referencias dudosas. | Se refiere a la bibliografía de la versión 1. La versión final no incluye la referencia que el informe marcaba como fabricada (Bhattacharya y Bhattacharya, 2019) ni las inverificables (Accenture, 2023; Hammer y Champy, 2009; Ministerio de Desarrollo Productivo, 2022). De las señaladas para revisión manual conserva solo Aghaei et al. (2012), cuyo DOI resuelve y coincide en Crossref. |
| `thesis_draft.md` | Borrador temprano de la tesis en Markdown. | El documento entregado es el `.docx` que se presenta al tribunal; el borrador no se actualizó después de junio de 2026. |
| `next-session-prompt.md` | Notas de traspaso entre sesiones de trabajo (03/09/2026), con rutas locales, puntajes de una autoauditoría y pendientes de la devolución de segunda instancia. | Refleja el estado de un día; los pendientes que lista se resolvieron o reformularon en versiones posteriores. |
| `db-api-prototipo/` | Primera API de datos simulados (FastAPI + SQLite, puerto 8000, 16/06/2026) y su archivo de pruebas `test.http`. | La reemplazó el backend Express + Prisma + PostgreSQL. Era el host `golden_harvest_api:8000` al que apuntaban los workflows 05 y 07 antes de corregirse (`docs/architecture/n8n.md`). Ningún servicio del `docker-compose.yml` la usa. |

Para el estado actual del proyecto, ver el `README.md` de la raíz y `docs/architecture/`.
