import { test } from 'node:test'
import assert from 'node:assert/strict'
import { productSchema } from './productSchema'

const BASE = { name: 'Tomate', line: 'roja', description: 'Tomate entero', sizes: ['1kg'] }

test('keeps the imageUrl the admin panel sends when saving a product', () => {
  const parsed = productSchema.partial().parse({ imageUrl: 'http://localhost:3001/uploads/tomate-pure.jpg' })
  assert.equal(parsed.imageUrl, 'http://localhost:3001/uploads/tomate-pure.jpg')
})

test('accepts null to remove the image ("Quitar" in the panel)', () => {
  const parsed = productSchema.partial().parse({ imageUrl: null })
  assert.equal(parsed.imageUrl, null)
})

test('a product can still be created without an image', () => {
  const parsed = productSchema.parse(BASE)
  assert.equal(parsed.imageUrl, undefined)
})

test('rejects an imageUrl that is not a URL', () => {
  assert.equal(productSchema.partial().safeParse({ imageUrl: 'not a url' }).success, false)
})
