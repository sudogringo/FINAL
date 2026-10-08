// Plan de cierre de una cotización: qué stock descontar y qué ítems de orden
// crear. Es puro para poder probarlo sin base de datos; la ruta lo aplica
// dentro de una transacción.

export interface QuoteItem { id: string; name: string; size: string; qty: number }
export interface StockedProduct { id: string; stockBySize: unknown }

export function unknownProductIds(items: Pick<QuoteItem, 'id'>[], knownIds: string[]): string[] {
  const known = new Set(knownIds)
  return [...new Set(items.map(i => i.id).filter(id => !known.has(id)))]
}

export function planQuoteClose({ items, products, orderExists }: {
  items: QuoteItem[]
  products: StockedProduct[]
  orderExists: boolean
}) {
  const empty = { stockUpdates: [] as { id: string; stockBySize: Record<string, number> }[], orderItems: [] as { productId: string; nombre: string; size: string; cantidad: number }[], missingProducts: [] as string[] }
  // Una cotización reabierta y vuelta a cerrar ya tiene su orden: no se descuenta dos veces.
  if (orderExists) return empty

  const missingProducts = unknownProductIds(items, products.map(p => p.id))
  if (missingProducts.length) return { ...empty, missingProducts }

  const stock = new Map(products.map(p => [p.id, { ...((p.stockBySize ?? {}) as Record<string, number>) }]))
  for (const item of items) {
    const bySize = stock.get(item.id)!
    bySize[item.size] = Math.max(0, (bySize[item.size] ?? 0) - item.qty)
  }
  const touched = [...new Set(items.map(i => i.id))]

  return {
    stockUpdates: touched.map(id => ({ id, stockBySize: stock.get(id)! })),
    orderItems: items.map(i => ({ productId: i.id, nombre: i.name, size: i.size, cantidad: i.qty })),
    missingProducts: [],
  }
}
