import { test } from 'node:test'
import assert from 'node:assert/strict'
import { contactSchema, customerUpsertArgs } from './quoteContact'

const BASE = { nombre: 'Ana Pérez', email: 'ana@example.com' }

test('accepts a contact without localidad (the field is optional)', () => {
  const parsed = contactSchema.safeParse(BASE)
  assert.equal(parsed.success, true)
})

test('keeps a trimmed localidad when provided', () => {
  const parsed = contactSchema.parse({ ...BASE, localidad: '  Godoy Cruz, Mendoza ' })
  assert.equal(parsed.localidad, 'Godoy Cruz, Mendoza')
})

test('treats a blank localidad as absent', () => {
  const parsed = contactSchema.parse({ ...BASE, localidad: '   ' })
  assert.equal(parsed.localidad, undefined)
})

test('rejects a localidad longer than 100 characters', () => {
  const parsed = contactSchema.safeParse({ ...BASE, localidad: 'x'.repeat(101) })
  assert.equal(parsed.success, false)
})

test('writes localidad when creating the customer', () => {
  const args = customerUpsertArgs({ ...BASE, localidad: 'San Rafael' })
  assert.deepEqual(args.where, { email: 'ana@example.com' })
  assert.equal(args.create.localidad, 'San Rafael')
})

test('updates localidad of an existing customer when the form provides it', () => {
  const args = customerUpsertArgs({ ...BASE, localidad: 'San Rafael' })
  assert.equal(args.update.localidad, 'San Rafael')
})

// Prisma ignores undefined fields in `update`, so the stored value survives.
test('leaves the stored localidad untouched when the form omits it', () => {
  const args = customerUpsertArgs(BASE)
  assert.equal(args.create.localidad, undefined)
  assert.equal(args.update.localidad, undefined)
})
