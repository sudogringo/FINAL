# Tesis de Grado: Transformación Digital y Automatización de Procesos para Golden Harvest S.A.

## Portada

**Universidad Tecnológica Nacional**  
**Facultad de Ingeniería**  
**Carrera:** Técnicatura Universitaria en Programación

**Título:** Transformación Digital mediante un Catálogo Interactivo y Automatización de Procesos con n8n: El Caso de Golden Harvest S.A.

**Autor:**

- Cunto Boberg, Tiago
- Rojo, Emiliano

**Director de Tesis:** Prof. Alberto Cortez  
**Fecha:** 2026

---

## Resumen

Este trabajo presenta el proyecto de transformación digital de Golden Harvest S.A., migrando de una presencia web estática a un catálogo digital interactivo con sistema de gestión de pedidos asistido. El desarrollo integra un frontend moderno orientado a la conversión (Product List, Cart) que automatiza el cierre de venta mediante el envío de leads calificados a la fuerza de ventas. Se complementa con una arquitectura de automatización modular en n8n, diseñada para ser replicable en diversos entornos de negocio, optimizando procesos de marketing, logística y reputación online de manera eficiente y escalable.

---

## Índice General

1. [Introducción](#capítulo-1-introducción)
2. [Marco Teórico](#capítulo-2-marco-teórico)
3. [Marco Metodológico](#capítulo-3-marco-metodológico)
4. [Desarrollo de la Investigación](#capítulo-4-desarrollo-de-la-investigación)
5. [Resultados y Análisis](#capítulo-5-resultados-y-análisis)
6. [Conclusiones y Recomendaciones](#capítulo-6-conclusiones-y-recomendaciones)
7. [Referencias Bibliográficas](#capítulo-7-referencias-bibliográficas)

---

## CAPÍTULO 1: Introducción

### 1.1 Contexto del problema

Golden Harvest S.A. opera en un mercado cada vez más digitalizado. Sin embargo, su infraestructura tecnológica actual se limita a un sitio web informativo ("estático"), lo que impide la captura de datos de clientes, la venta directa y la fidelización automatizada. Esta brecha digital genera ineficiencias operativas y pérdida de oportunidades frente a competidores con presencia transaccional.

### 1.2 Planteamiento del problema

La ausencia de un sistema de e-commerce integrado y la dependencia de procesos manuales para la gestión de clientes y logística limitan el crecimiento de Golden Harvest S.A. ¿Cómo puede una arquitectura basada en micro-automatizaciones (n8n) y una plataforma transaccional moderna transformar la eficiencia operativa y el alcance comercial de la empresa?

### 1.3 Justificación

La implementación de un ecosistema digital no solo permite la venta directa (D2C), sino que mediante la automatización se eliminan errores humanos en la generación de documentación logística y se personaliza la comunicación con el cliente, aumentando el valor de vida del cliente (LTV) y reduciendo costos operativos.

### 1.4 Objetivo general

Diseñar e implementar un ecosistema digital para Golden Harvest S.A. basado en un catálogo interactivo de productos y un motor de automatización modular (n8n) que optimice la captura de leads y la gestión operativa.

### 1.5 Objetivos específicos

- Desarrollar una interfaz de catálogo con sistema de carrito de compras que finalice en una solicitud de cotización/pedido vía email interno.
- Diseñar una arquitectura de flujos en n8n con enfoque modular y desacoplado, facilitando su reutilización en otros proyectos web.
- Implementar automatizaciones para la gestión de leads, seguimiento de interés de compra y marketing directo.
- Automatizar la generación de documentación logística a partir de la confirmación del equipo de ventas.
- Integrar sistemas de respuesta automática para reseñas y generación de contenido visual dinámico.

### 1.6 Alcance y limitaciones

El proyecto abarca desde el diseño de la arquitectura web hasta la puesta en marcha de los flujos de automatización críticos. No incluye la gestión física de depósitos ni la contratación de servicios de logística de terceros, limitándose a la integración de datos con los mismos.

---

## CAPÍTULO 2: Marco Teórico

### 2.1 Modelos de E-commerce y Catálogos Digitales

Evolución del B2C: del "Check-out" transaccional al "Lead-to-Sale" asistido. Arquitecturas web modernas (Single Page Applications, APIs REST).

### 2.2 Automatización Modular de Procesos (BPA)

Concepto de Low-code/No-code. Introducción a n8n como orquestador de flujos de trabajo y la importancia del diseño de flujos genéricos/reutilizables.

### 2.3 Marketing de Automatización y CRM

Fidelización, recuperación de carritos y personalización de ofertas basadas en datos de comportamiento.

### 2.4 SEO y Performance Web

Importancia de la velocidad de carga y la uniformidad técnica en la conversión de ventas.

---

## CAPÍTULO 3: Marco Metodológico

### 3.1 Tipo de investigación

Investigación aplicada y tecnológica, centrada en la resolución de un problema de negocio real mediante el desarrollo de software.

### 3.2 Enfoque metodológico

Ágil (Scrum/Kanban) para el desarrollo del sitio web y diseño iterativo para los flujos de n8n.

### 3.3 Técnicas de recolección de datos

Análisis de la web actual de Golden Harvest, entrevistas con stakeholders y relevamiento de requerimientos logísticos.

---

## CAPÍTULO 4: Desarrollo de la Investigación

### 4.1 Arquitectura del Sistema

- **Frontend:** React/Next.js (propuesto).
- **Backend:** Node.js / Express.
- **Automatización:** n8n (Instancia Docker/Cloud).
- **Base de Datos:** PostgreSQL/MongoDB.

### 4.2 Implementación de Flujos n8n (Arquitectura Modular)

- _Core de Notificaciones:_ Sistema genérico de envío de leads (Email/WhatsApp).
- _Módulo Branding:_ Extracción agnóstica de identidad visual para adaptación dinámica.
- _Módulo Social Media:_ Generador de contenido visual basado en templates configurables.
- _Módulo Logística:_ Generación de documentación basada en esquemas de datos estándar.

---

## CAPÍTULO 5: Resultados y Análisis

(A completar tras la implementación)

---

## CAPÍTULO 6: Conclusiones y Recomendaciones

(A completar al finalizar el proyecto)
