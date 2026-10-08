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
  const args = customerUpsertArgs({ ...BASE, localidad: 'San Rafael' }, null)
  assert.deepEqual(args.where, { email: 'ana@example.com' })
  assert.equal(args.create.localidad, 'San Rafael')
})

// The quote form is public: whoever knows a customer's email must not be able
// to rewrite that customer's data. An existing customer only gets the fields
// it still lacks; what each quote said stays in Quote.contact.
const STORED = { nombre: 'Ana Pérez', empresa: 'Conservas Ana', telefono: '2610000000', localidad: 'San Rafael' }

test('never overwrites the data of an existing customer', () => {
  const args = customerUpsertArgs(
    { nombre: 'Impostor', email: 'ana@example.com', empresa: 'Otra', telefono: '1100000000', localidad: 'Otra ciudad' },
    STORED,
  )
  assert.deepEqual(args.update, {})
})

test('fills the fields an existing customer is still missing', () => {
  const args = customerUpsertArgs(
    { ...BASE, telefono: '2615555555', localidad: 'Maipú' },
    { ...STORED, telefono: null, localidad: null },
  )
  assert.deepEqual(args.update, { telefono: '2615555555', localidad: 'Maipú' })
})

test('treats an empty stored value as missing', () => {
  const args = customerUpsertArgs({ ...BASE, empresa: 'Conservas Ana' }, { ...STORED, empresa: '' })
  assert.deepEqual(args.update, { empresa: 'Conservas Ana' })
})

test('does not fill a missing field with an absent form value', () => {
  const args = customerUpsertArgs(BASE, { ...STORED, localidad: null })
  assert.deepEqual(args.update, {})
})

test('without a stored customer, the form values go to create', () => {
  const args = customerUpsertArgs({ ...BASE, localidad: 'Maipú' }, null)
  assert.equal(args.create.localidad, 'Maipú')
  assert.deepEqual(args.update, {})
})
