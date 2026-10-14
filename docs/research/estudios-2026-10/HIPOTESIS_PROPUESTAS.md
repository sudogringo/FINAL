# Propuesta de hipótesis para el prerregistro del Estudio 2 (usabilidad)

**Estado:** es una **propuesta**. La decisión final la toman los autores al pasarla al prerregistro, con el mismo formato de `docs/research/prerregistro-2026-10/PRERREGISTRO.md`. El commit que fije las hipótesis tiene que ser **anterior a la primera sesión**.

El Estudio 1 (entrevistas) es descriptivo y **no** lleva hipótesis: sus resultados se informan como diagnóstico exploratorio.

## Punto de partida: por qué no sirve un umbral fácil

El estudio de septiembre dio un SUS medio de 94,5 (mediana 97,5) con n = 5. Los participantes eran familiares y parejas de los autores, la moderación estuvo a cargo de los propios autores y se usó una traducción propia. Ese valor tiene un sesgo de deseabilidad social conocido y **no sirve como estimación previa**.

Un umbral como «SUS > 50» o «al menos 1 de 12 completa la tarea» se cumpliría casi seguro y no pondría nada a prueba. Las reglas que siguen pueden fallar si el catálogo es solo **promedio** para compradores reales.

## H-SUS (principal). La usabilidad percibida del catálogo supera el promedio de la industria

- **Referencia:** 68, el SUS promedio de la base de referencia de Sauro y Lewis (2016), que suele usarse como frontera entre por encima y por debajo del promedio.
- **Estadístico:** media del SUS con intervalo de confianza del 95 % basado en t (bilateral, gl = n − 1).
- **Regla de decisión:**
  - **Se confirma** si el **límite inferior del IC del 95 % es mayor que 68**. Equivale a una prueba t unilateral con α = 0,025.
  - **Se refuta** si la **media observada es ≤ 68**.
  - **No es concluyente** si la media es mayor que 68 pero el límite inferior es ≤ 68. Se informa así, **no** como confirmación.
- **Qué la refutaría:** que compradores comerciales, con un moderador neutral y el instrumento validado, den en promedio 68 o menos. Es decir, que el catálogo sea percibido como un sitio promedio o peor.

### Potencia aproximada

Simulación propia: 20 000 réplicas por celda, puntajes normales truncados a 0–100. Se usan dos desviaciones estándar de planificación, 12,5 y 17,7; los autores deben verificarlas en Sauro y Lewis (2016) antes de citarlas.

| SUS medio verdadero | n = 10 (DE 12,5 / 17,7) | n = 12 (DE 12,5 / 17,7) |
|---|---|---|
| 72 | 0,15 / 0,10 | 0,17 / 0,11 |
| 75 | 0,36 / 0,21 | 0,44 / 0,25 |
| 78 | 0,63 / 0,36 | 0,72 / 0,44 |
| 80 | 0,78 / 0,50 | 0,86 / 0,58 |
| 85 | 0,97 / 0,78 | 0,99 / 0,85 |

**Lectura.** Con n = 12, la hipótesis solo tiene una probabilidad razonable de confirmarse (≥ 0,7) si el SUS verdadero ronda 80 o más, que es «bueno a excelente» en la escala de Bangor et al. (2009). Si el catálogo es apenas mejor que el promedio (72–75), lo más probable es un resultado no concluyente. Ese es el **riesgo real** de la hipótesis.

**Alternativa (no recomendada como principal).** Usar el límite inferior del **IC del 90 %**, es decir, una prueba t unilateral con α = 0,05. Sube la potencia, por ejemplo a 0,57–0,83 para un SUS verdadero de 78 con n = 12, a costa de duplicar el error de tipo I. Si los autores la eligen, deben justificarla en el prerregistro **antes** de medir. Se recomienda el 95 %, por coherencia con el resto de la tesis y porque la crítica de los evaluadores apuntó justamente a la falta de rigor de VD4.

## H-T1 (principal). La tarea principal se completa en al menos el 80 % de los casos

- **Referencia:** alrededor de 78 %, la tasa media de completitud de tareas que difunde Sauro como punto de comparación. Los autores deben verificar la cita exacta antes de usarla. Se fija como objetivo de diseño **80 %**.
- **Medida:** éxito **estricto** en la tarea 1: cotización enviada con exactamente los 3 productos, presentaciones y cantidades indicados. El criterio comparable con septiembre se informa aparte y **no** decide.
- **Problema de n pequeño.** Con n = 12, aun con 12/12 éxitos, el límite inferior de Clopper-Pearson del 95 % es 0,735, y el unilateral del 95 % es 0,779. Exigir que el límite inferior supere 0,80 sería **imposible de cumplir**, así que no tiene sentido como regla.
- **Regla de decisión propuesta:** H-T1 **se confirma** si se cumplen las dos condiciones:
  1. la proporción observada es **≥ 80 %**;
  2. el **límite inferior unilateral del 95 % de Clopper-Pearson es mayor que 0,50**. Equivale a una prueba binomial exacta unilateral de H0: p ≤ 0,5 con α = 0,05, y descarta que la tarea se complete por azar o la mitad de las veces.

  En la práctica:

  | n | Se confirma con | Límite inferior (unilateral 95 %) |
  |---|---|---|
  | 12 | **≥ 10 éxitos** | 0,562 con 10/12 |
  | 11 | **≥ 9 éxitos** | 0,530 con 9/11 |
  | 10 | **≥ 9 éxitos** | 0,606 con 9/10 (8/10 da 0,493 y no alcanza) |

  - **Se refuta** si la proporción observada es **< 80 %**. Con n = 12, eso es 9 éxitos o menos.
  - Siempre se informa también el **IC bilateral del 95 % de Clopper-Pearson**. Por ejemplo, 10/12 da 0,516–0,979.
- **Qué la refutaría:** que 3 o más de 12 compradores no logren armar y enviar el pedido indicado sin ayuda, ya sea por presentaciones o cantidades mal cargadas, por errores del formulario o por no encontrar dónde enviar.

### Probabilidad de confirmar según la tasa verdadera (binomial exacta)

| Tasa verdadera | n = 10 (≥ 9 éxitos) | n = 12 (≥ 10 éxitos) |
|---|---|---|
| 0,60 | 0,05 | 0,08 |
| 0,70 | 0,15 | 0,25 |
| 0,80 | 0,38 | 0,56 |
| 0,90 | 0,74 | 0,89 |
| 0,95 | 0,91 | 0,98 |

**Lectura.** La regla es exigente: si la tasa verdadera es exactamente 80 %, se confirma solo un poco más de la mitad de las veces con n = 12. Un catálogo con 70 % de completitud real se confirmaría por error 1 de cada 4 veces con n = 12. Se declara como limitación del n disponible.

**Riesgo específico del criterio estricto.** La tarea 1 pide cantidades de hasta 12 unidades y presentaciones distintas de la seleccionada por defecto: el selector de cada tarjeta arranca en la primera presentación, 250 g. Es una prueba más dura que la de septiembre, donde la elección era libre. Si los autores quieren conservar el criterio laxo como principal, deben decidirlo **antes** de medir, sabiendo que es más fácil de cumplir.

## Análisis exploratorios (no decisorios)

Se informan sin regla de decisión:

- completitud y tiempos de las tareas 2 y 3;
- tiempos de la tarea 1, con media geométrica e IC;
- errores por tarea;
- el SUS por ítem;
- la comparación con el estudio de septiembre: SUS 94,5 frente al nuevo, y 4/5 frente a la tasa nueva con el criterio comparable. Los instrumentos, las muestras y la moderación difieren, así que **no** se plantea como contraste.

## Corrección por multiplicidad

Hay dos hipótesis principales. Se proponen como **hipótesis separadas con conclusiones separadas**, sin una conclusión conjunta del tipo «VD4 confirmada si ambas…».

Si los autores quieren una conclusión conjunta sobre VD4, la regla debe ser **conjuntiva**: VD4 se confirma solo si se confirman H-SUS y H-T1. Una regla conjuntiva no infla el error de tipo I, pero la potencia conjunta es aproximadamente el producto de las dos, por ejemplo 0,72 × 0,89 ≈ 0,64 en el escenario favorable con n = 12. Debe declararse así.

## Desvíos previsibles que conviene prerregistrar

- **Si se llega a la fecha límite con n < 10:** se informa el n y el estudio se declara subpotenciado. Las reglas se aplican igual, pero el resultado se presenta como exploratorio.
- **Sesiones con falla del entorno:** no cuentan y se reemplazan por **otra persona**.
- **Bloqueante del sitio publicado** (ver `usabilidad-catalogo/PROTOCOLO.md`, §4.1): fijar en el prerregistro si el estudio se hace en el entorno local (opción A) o con un backend publicado (opción B), y el commit medido.
- **SUS con ítems faltantes:** se excluye del análisis confirmatorio y se informa.
