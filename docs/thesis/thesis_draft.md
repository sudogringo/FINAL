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

**Contexto y Problemática:**  
Este trabajo aborda la brecha digital en empresas con modelos de negocio tradicionales, tomando como caso de estudio a Golden Harvest S.A. Se identifica que la dependencia de una presencia web estática limita la captura de datos y la eficiencia comercial en un mercado digitalizado.

**Propuesta de Solución:**  
Se propone una transición hacia un ecosistema digital híbrido de alta conversión. El modelo se centra en un catálogo interactivo desarrollado en **React**, el cual prioriza la captura de leads calificados sobre la transacción directa, canalizando el interés del usuario hacia una gestión de ventas personalizada y automatizada.

**Arquitectura de Automatización:**  
La innovación central radica en una capa de orquestación de procesos mediante **n8n**, diseñada bajo principios de modularidad y desacoplamiento. Esta infraestructura actúa como el motor esencial no solo para el mantenimiento técnico del sitio, sino para la gestión integral de la imagen pública de la compañía. Se automatiza la creación y distribución de contenido dinámico a través de múltiples canales críticos: **Sitio Web, Instagram, TikTok, Correo Electrónico, Facebook y WhatsApp**. Esta automatización asegura una identidad de marca coherente y una presencia activa y omnicanal con intervención humana mínima.

**Impacto y Resultados:**  
Los resultados proyectados incluyen la optimización de los tiempos de respuesta comercial, la eliminación de redundancias manuales en la documentación logística y una presencia digital robusta y profesional en todas las plataformas de contacto con el cliente.

**Palabras Clave:**  
Transformación Digital, Automatización de Procesos (BPA), n8n, React, Catálogo Interactivo, Leads, Modularidad, Omnicanalidad.

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

Golden Harvest S.A. es una empresa con una trayectoria consolidada en su sector, pero cuya infraestructura digital ha permanecido estática, funcionando únicamente como un folleto digital informativo. Actualmente, el sitio web presenta una interfaz anticuada y una experiencia de usuario deficiente, siendo notablemente lento y poco optimizado para dispositivos de escritorio. En el ecosistema comercial actual, la falta de interactividad y de mecanismos de captura de datos impide la trazabilidad del interés del cliente y la optimización de la tasa de conversión. La empresa enfrenta el desafío de digitalizarse sin perder el componente de asesoramiento personalizado que caracteriza su modelo de negocio.

### 1.2 Planteamiento del problema

La ausencia de una plataforma interactiva moderna y la dependencia de procesos manuales para la gestión de múltiples canales de comunicación (sitio web, Instagram, TikTok, Facebook, WhatsApp, correo electrónico) limitan la escalabilidad de Golden Harvest S.A. La carga administrativa que representa mantener una presencia activa y coherente en todas estas plataformas de manera tradicional es inmanejable para la estructura actual, lo que deriva en una falta de publicaciones constantes (Stories, posts) que genera desconfianza sobre la actividad real de la empresa. Surge la pregunta: ¿De qué manera la implementación de un catálogo interactivo en React, orquestado por una capa de automatización modular en n8n, puede resolver la ineficiencia operativa, modernizar la imagen digital y asegurar una presencia omnicanal constante y profesional?

### 1.3 Justificación

La elección de un modelo 'Lead-to-Sale' asistido responde a la necesidad de mantener un vínculo consultivo con el cliente, algo que un checkout transaccional frío a veces dificulta en ciertos nichos. La implementación técnica mediante React y n8n ofrece una flexibilidad y modularidad que las plataformas de e-commerce 'cerradas' no permiten, facilitando que las automatizaciones de marketing y logística sean activos digitales reutilizables y escalables, reduciendo la dependencia de intervención humana y minimizando errores operativos. Al automatizar la creación y distribución de contenido dinámico (Social Media Content Engine), se garantiza que la marca mantenga una imagen de actividad constante y profesional sin sobrecargar al equipo humano.

### 1.4 Objetivo general

Diseñar e implementar un ecosistema digital moderno para Golden Harvest S.A. basado en una interfaz de catálogo interactivo en React y un motor de automatización modular con n8n, orientado a la profesionalización de la imagen omnicanal, la optimización de la captura de leads y la eficiencia operativa mediante la reducción de procesos manuales.

### 1.5 Objetivos específicos

- Desarrollar una aplicación web (React) con una interfaz optimizada para dispositivos móviles y de escritorio, reemplazando el diseño actual lento y anticuado.
- Implementar un sistema de catálogo y carrito de compras 'Lead-to-Sale' que automatice el envío de leads calificados al equipo de ventas.
- Diseñar y desplegar una arquitectura modular de flujos en n8n que automatice la gestión de imagen pública en redes sociales (Instagram, TikTok, Facebook, WhatsApp, etc.).
- Automatizar la generación de documentación logística y reportes de actividad para reducir la carga administrativa y el error humano.
- Establecer un sistema de vigilancia y respuesta para la reputación online (Google Maps) integrado en el orquestador n8n.

### 1.6 Alcance y limitaciones

El proyecto comprende el desarrollo completo del frontend interactivo, la configuración de la instancia de n8n y la implementación de todos los flujos de automatización definidos. No incluye el manejo físico de productos ni la contratación de terceros logísticos, enfocándose exclusivamente en la capa técnica y digital del negocio. El alcance omnicanal abarca los canales de comunicación más relevantes para el mercado local (WhatsApp, Redes Sociales, Email).

---

## CAPÍTULO 2: Marco Teórico

### 2.1 Modelos de E-commerce y Catálogos Digitales

La evolución del comercio electrónico ha derivado en modelos que priorizan la calidad del lead sobre la inmediatez de la transacción directa. El modelo "Lead-to-Sale" asistido permite un cierre de venta más consultivo y personalizado, fundamental en sectores industriales o de alto valor donde el asesoramiento es clave para la conversión. Tecnológicamente, este enfoque se soporta en arquitecturas de Single Page Application (SPA) utilizando **React**, lo que permite el desarrollo de interfaces rápidas, dinámicas y altamente responsivas, garantizando una experiencia de usuario fluida tanto en dispositivos móviles como en configuraciones de escritorio.

### 2.2 Automatización Modular de Procesos (BPA)

La Automatización de Procesos de Negocio (BPA) mediante herramientas de bajo código (Low-code) se ha consolidado como un estándar para la agilidad empresarial. El uso de **n8n** como orquestador central de flujos de trabajo facilita el desacoplamiento de la lógica de negocio; esto permite el diseño de arquitecturas modulares donde cada función (branding, logística, gestión de redes sociales) opera de manera independiente pero integrada. Este enfoque no solo mejora el mantenimiento, sino que convierte a las automatizaciones en activos digitales escalables y replicables para diversas unidades de negocio o proyectos futuros.

### 2.3 Marketing de Automatización y Omnicanalidad

En un mercado saturado de información, una presencia omnicanal coherente y constante es esencial para generar confianza en el consumidor. La automatización mediante n8n permite que una marca mantenga una identidad profesional y activa en múltiples plataformas simultáneamente (**Instagram, TikTok, WhatsApp, Facebook, Email**) con una intervención humana mínima. El concepto de "Lead Nurturing" se integra aquí como el proceso automatizado de acompañar al prospecto desde su interés inicial en el catálogo interactivo hasta la conversión final asistida por un representante de ventas, optimizando el ciclo de vida del cliente (LTV).

### 2.4 SEO, Performance y UX

El rendimiento técnico de un sitio web, medido a través de métricas estandarizadas como los **Core Web Vitals** (LCP, FID, CLS), influye directamente en el posicionamiento en buscadores (SEO) y en la percepción de profesionalismo de la empresa. Un diseño anticuado, lento o "clunky" impacta negativamente en la tasa de rebote y en la credibilidad de la marca. La modernización de la experiencia de usuario (UX) y la optimización de la velocidad de carga son necesidades estratégicas para reducir la fricción en el proceso de captura de leads y asegurar la competitividad en el ecosistema digital actual.

---

## CAPÍTULO 3: Marco Metodológico

### 3.1 Tipo de investigación

Este trabajo se enmarca en la **Investigación Aplicada y el Desarrollo Tecnológico**. Se busca no solo la comprensión teórica de la transformación digital, sino la aplicación práctica de una solución técnica (React + n8n) para resolver el problema de ineficiencia operativa y falta de presencia activa de Golden Harvest S.A. El enfoque principal es la creación de un ecosistema funcional, escalable y replicable que resuelva la brecha digital de la empresa.

### 3.2 Enfoque metodológico

Se adopta una **Metodología Ágil (Scrum/Kanban)** para permitir un desarrollo iterativo y adaptativo. El desarrollo del frontend en React se divide en hitos (UI, Catálogo, Carrito, Integración de Leads), mientras que los flujos de n8n se diseñan como subrutinas independientes que se prueban y refinan progresivamente. Este proceso se complementa con la integración de **prácticas de IA de vanguardia** (Bleeding-edge AI) para optimizar la generación de código y la creación de flujos inteligentes, asegurando que cada componente sea sometido a un riguroso proceso de **revisión manual y pruebas (manual revision and testing)** para garantizar la calidad final.

### 3.3 Técnicas de recolección de datos

Para el diagnóstico inicial y el diseño de la solución, se emplearon tres técnicas principales:
- **Análisis de la Infraestructura Existente:** Auditoría técnica del sitio actual para identificar cuellos de botella en performance (Core Web Vitals) y deficiencias en el diseño de escritorio.
- **Entrevistas Estructuradas:** Diálogo con los responsables de Golden Harvest S.A. para definir el flujo ideal del "Lead-to-Sale" y las necesidades de imagen omnicanal.
- **Mapeo de Procesos Manuales:** Registro de las tareas repetitivas en logística y creación de contenido para transformarlas en flujos lógicos dentro de n8n.

### 3.4 Herramientas e Instrumentos Tecnológicos

Para la ejecución de este proyecto, se ha definido un ecosistema de herramientas que se dividen en dos categorías fundamentales: el **Stack Tecnológico** (componentes estructurales de la solución) y las **Herramientas de Soporte y Desarrollo** (instrumentos para la optimización y validación).

**Stack Tecnológico (Estructura):**
- **Frontend:** React (SPA) para interfaces dinámicas y responsivas.
- **Orquestador de Procesos:** n8n para la automatización modular de flujos de negocio.
- **Bases de Datos:** PostgreSQL/MongoDB para el almacenamiento persistente de leads y configuraciones.

**Herramientas de Soporte (Instrumentación):**
- **Asistencia de IA de Vanguardia:** Integración de modelos de lenguaje de última generación para la generación de código y optimización de flujos lógicos.
- **Control de Versiones y CI/CD:** GitHub para la gestión del ciclo de vida del software.
- **Entorno de Pruebas:** Procesos de **revisión manual exhaustiva** y entornos de prueba controlados para asegurar la integridad de cada automatización.

---

## CAPÍTULO 4: Desarrollo de la Investigación

### 4.1 Arquitectura del Sistema (Diseño Técnico)

La arquitectura de la solución se basa en un desacoplamiento entre la capa de presentación y la lógica de negocio. El frontend, desarrollado en **React/Next.js**, se encarga de la interacción fluida con el usuario y la gestión del estado del catálogo y el carrito. El backend actúa como un orquestador ligero que comunica las acciones del cliente (como el envío de una solicitud de pedido) hacia **n8n**, el motor de automatización central alojado en un contenedor Docker para garantizar portabilidad y control total sobre los datos. El stack se complementa con **PostgreSQL/MongoDB** para el almacenamiento de leads y configuraciones.

### 4.2 Desarrollo del Catálogo Interactivo (React)

Se diseñó una interfaz moderna y centrada en la conversión, optimizada tanto para dispositivos móviles como para resoluciones de escritorio, reemplazando el diseño anticuado y lento del sitio original. A diferencia de un e-commerce tradicional, el sistema de carrito de compras no redirige a una pasarela de pago, sino que recopila los productos de interés y genera una solicitud de cotización estructurada (modelo "Lead-to-Sale"). Esta solicitud se envía mediante un webhook a n8n, iniciando el proceso de venta asistida y garantizando un asesoramiento personalizado.

### 4.3 Implementación de la Capa de Automatización (n8n)

Los flujos de n8n se desarrollaron bajo un esquema modular y desacoplado, permitiendo su reutilización en otros proyectos:
- **Engine de Redes Sociales:** Utiliza los datos del catálogo y la identidad visual extraída dinámicamente para crear piezas gráficas automáticas (Stories y Posts), manteniendo la presencia de la marca en Instagram, TikTok y Facebook.
- **Módulo de Omnicanalidad:** Orquesta el envío de notificaciones automáticas por WhatsApp, Email y otras plataformas tanto para el cliente como para el representante de ventas.
- **Automatización Logística:** Genera archivos PDF de etiquetas y remitos basados en la información validada del pedido tras la confirmación del equipo comercial.

### 4.4 Desarrollo Asistido por IA y Validación Manual

Durante el proceso de desarrollo, se emplearon **prácticas de IA de vanguardia** para la generación de scripts complejos dentro de los nodos de n8n y para la optimización de componentes de React. Este enfoque permitió acelerar el prototipado de flujos inteligentes y mejorar la eficiencia del código. No obstante, cada módulo fue sometido a un riguroso proceso de **revisión manual y pruebas (manual revision and testing)**, donde se simularon interacciones críticas y posibles fallos de red para asegurar la resiliencia y profesionalismo del ecosistema digital final.

---

## CAPÍTULO 5: Resultados y Análisis

(A completar tras la implementación)

---

## CAPÍTULO 6: Conclusiones y Recomendaciones

(A completar al finalizar el proyecto)
