# Hoja para el participante

*Se imprime o se muestra en una ventana aparte durante las tareas. Todos los datos son inventados: no corresponden a ninguna persona ni comercio real.*

---

## Tarea 1 — Productos a pedir

| Producto | Presentación | Cantidad |
|---|---|---|
| Tomate Entero Pelado | 4 kg | 3 |
| Mitades en Almíbar | 1 kg | 6 |
| Doble Concentrado | 250 g | 12 |

## Tarea 1 — Datos de contacto para enviar la solicitud

| Dato | Valor |
|---|---|
| Nombre completo | Laura Benítez |
| Empresa | Almacén Los Álamos |
| Teléfono | +54 261 555-0142 |
| Email | compras@almacenlosalamos.example |
| Localidad de entrega | Luján de Cuyo, Mendoza |
| Notas | Entregar martes o jueves por la mañana. |

## Tarea 2

Un cliente pidió **«tomate en cubos»**. Busque el producto y diga su nombre y sus presentaciones.

## Tarea 3

1. Agregar **Salsa Clásica**, presentación **1 kg**, **2** unidades.
2. Agregar **Durazno al Natural**, presentación **250 g**, **4** unidades.
3. Cambio del cliente: Salsa Clásica pasa a **5** unidades y el Durazno al Natural **se quita**.
4. **No enviar.** Decir «terminé».

---

### Notas para los autores (no mostrar al participante)

- El teléfono `+54 261 555-0142` tiene 12 dígitos y cumple la validación del formulario: de 8 a 15 dígitos, con `+` opcional y separadores (`frontend/src/features/quote/phone.ts`).
- El dominio `.example` está reservado para documentación (RFC 2606): ningún correo llega a un destinatario real. Todas las cotizaciones del estudio se identifican por ese correo.
- El stock simulado del seed va de 20 a 99 unidades por presentación, así que ninguna cantidad pedida choca con el límite de stock.
- Los nombres de los productos, las presentaciones y la búsqueda («cubos» aparece en la descripción de Cubetti di Pomodoro) se verificaron contra `backend/src/seed.ts` y `frontend/src/features/products/components/ProductList.tsx` el 14/10/2026.
