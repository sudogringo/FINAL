import { test } from 'node:test'
import assert from 'node:assert/strict'
import { planQuoteClose, unknownProductIds } from './quoteClose'

const ITEMS = [
  { id: 'p1', name: 'Tomate', size: '1kg', qty: 3 },
  { id: 'p2', name: 'Durazno', size: '250g', qty: 5 },
]
const PRODUCTS = [
  { id: 'p1', stockBySize: { '1kg': 10, '4kg': 2 } },
  { id: 'p2', stockBySize: { '250g': 4 } },
]

test('deducts each item from the stock of its size, never below zero', () => {
  const plan = planQuoteClose({ items: ITEMS, products: PRODUCTS, orderExists: false })
  assert.deepEqual(plan.stockUpdates, [
    { id: 'p1', stockBySize: { '1kg': 7, '4kg': 2 } },
    { id: 'p2', stockBySize: { '250g': 0 } },
  ])
})

test('builds one order item per quote item', () => {
  const plan = planQuoteClose({ items: ITEMS, products: PRODUCTS, orderExists: false })
  assert.deepEqual(plan.orderItems, [
    { productId: 'p1', nombre: 'Tomate', size: '1kg', cantidad: 3 },
    { productId: 'p2', nombre: 'Durazno', size: '250g', cantidad: 5 },
  ])
})

test('closing a quote that already has an order changes nothing (no double deduction)', () => {
  const plan = planQuoteClose({ items: ITEMS, products: PRODUCTS, orderExists: true })
  assert.deepEqual(plan, { stockUpdates: [], orderItems: [], missingProducts: [] })
})

test('reports items whose product no longer exists and plans nothing', () => {
  const plan = planQuoteClose({ items: ITEMS, products: [PRODUCTS[0]], orderExists: false })
  assert.deepEqual(plan.missingProducts, ['p2'])
  assert.deepEqual(plan.stockUpdates, [])
  assert.deepEqual(plan.orderItems, [])
})

test('unknownProductIds lists the quote items that are not in the catalog', () => {
  assert.deepEqual(unknownProductIds(ITEMS, ['p1']), ['p2'])
  assert.deepEqual(unknownProductIds(ITEMS, ['p1', 'p2']), [])
})

test('two sizes of the same product end up in a single stock update', () => {
  const plan = planQuoteClose({
    items: [
      { id: 'p1', name: 'Tomate', size: '1kg', qty: 3 },
      { id: 'p1', name: 'Tomate', size: '4kg', qty: 1 },
    ],
    products: PRODUCTS,
    orderExists: false,
  })
  assert.deepEqual(plan.stockUpdates, [{ id: 'p1', stockBySize: { '1kg': 7, '4kg': 1 } }])
})
