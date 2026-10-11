import { test } from 'node:test'
import assert from 'node:assert/strict'
import express, { Router } from 'express'
import type { AddressInfo } from 'node:net'
import { catchAsyncErrors, errorHandler, errorStatus } from './errors'

function handleOnce(router: Router, method: string, url: string): Promise<unknown> {
  return new Promise((resolve) => {
    const req = { method, url, body: {}, query: {}, params: {} } as never
    const res = { status: () => res, json: () => res } as never
    router(req, res, (err?: unknown) => resolve(err))
  })
}

test('a rejected async handler reaches next(err) instead of crashing the process', async () => {
  const router = Router()
  router.post('/', async () => { throw new Error('boom') })
  catchAsyncErrors(router)
  const err = await handleOnce(router, 'POST', '/')
  assert.equal((err as Error).message, 'boom')
})

test('wraps every handler of a route, including the ones after a middleware', async () => {
  const router = Router()
  router.get('/', (_req, _res, next) => next(), async () => { throw new Error('second') })
  catchAsyncErrors(router)
  const err = await handleOnce(router, 'GET', '/')
  assert.equal((err as Error).message, 'second')
})

test('a foreign-key violation (Prisma P2003) is a client error: 400', () => {
  assert.equal(errorStatus({ code: 'P2003' }), 400)
})

test('a missing record (Prisma P2025) is 404', () => {
  assert.equal(errorStatus({ code: 'P2025' }), 404)
})

test('any other error is 500', () => {
  assert.equal(errorStatus(new Error('db down')), 500)
  assert.equal(errorStatus(undefined), 500)
})

test('an error that already carries a 4xx status keeps it (status or statusCode)', () => {
  assert.equal(errorStatus({ status: 400 }), 400)
  assert.equal(errorStatus({ statusCode: 413 }), 413)
  assert.equal(errorStatus({ status: 404 }), 404)
})

test('5xx, non-integer or out-of-range statuses stay 500', () => {
  assert.equal(errorStatus({ status: 503 }), 500)
  assert.equal(errorStatus({ status: 'abc' }), 500)
  assert.equal(errorStatus({ status: 400.5 }), 500)
  assert.equal(errorStatus({ status: 200 }), 500)
})

test('a unique-constraint violation (Prisma P2002) is 409', () => {
  assert.equal(errorStatus({ code: 'P2002' }), 409)
})

function runHandler(err: unknown) {
  const out: { status?: number; body?: unknown } = {}
  const res = {
    headersSent: false,
    status(s: number) { out.status = s; return res },
    json(b: unknown) { out.body = b; return res },
  } as never
  const original = console.error
  let logged = 0
  console.error = () => { logged++ }
  try { errorHandler(err, {} as never, res, (() => {}) as never) } finally { console.error = original }
  return { ...out, logged }
}

test('the JSON message follows the status: 404, 409, other 4xx, 500', () => {
  assert.deepEqual(runHandler({ code: 'P2025' }).body, { error: 'No encontrado' })
  assert.deepEqual(runHandler({ code: 'P2002' }).body, { error: 'Conflicto' })
  assert.deepEqual(runHandler({ code: 'P2003' }).body, { error: 'Solicitud inválida' })
  assert.deepEqual(runHandler({ status: 400 }).body, { error: 'Solicitud inválida' })
  assert.deepEqual(runHandler(new Error('x')).body, { error: 'Error interno' })
})

test('only 500s are logged', () => {
  assert.equal(runHandler({ status: 400 }).logged, 0)
  assert.equal(runHandler(new Error('x')).logged, 1)
})

test('a malformed JSON body answers 400, not 500', async () => {
  const app = express()
  app.use(express.json())
  app.post('/', (_req, res) => { res.json({ ok: true }) })
  app.use(errorHandler)
  const server = app.listen(0)
  const original = console.error
  console.error = () => {}
  try {
    const { port } = server.address() as AddressInfo
    const res = await fetch(`http://127.0.0.1:${port}/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"a":',
    })
    assert.equal(res.status, 400)
    assert.deepEqual(await res.json(), { error: 'Solicitud inválida' })
  } finally {
    console.error = original
    server.close()
  }
})
