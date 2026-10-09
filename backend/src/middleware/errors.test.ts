import { test } from 'node:test'
import assert from 'node:assert/strict'
import { Router } from 'express'
import { catchAsyncErrors, errorStatus } from './errors'

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
