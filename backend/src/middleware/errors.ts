import { Router, Request, Response, NextFunction } from 'express'

type Handler = (req: Request, res: Response, next: NextFunction) => unknown

// Express 4 does not catch rejected promises: an async handler that throws
// leaves an unhandled rejection, and Node terminates the process. This wraps
// every route handler of the router so the error reaches next(err) instead.
export function catchAsyncErrors(router: Router): Router {
  for (const layer of router.stack) {
    for (const routeLayer of layer.route?.stack ?? []) {
      const handle: Handler = routeLayer.handle
      routeLayer.handle = (req: Request, res: Response, next: NextFunction) => {
        try {
          const out = handle(req, res, next)
          if (out instanceof Promise) out.catch(next)
        } catch (err) {
          next(err)
        }
      }
    }
  }
  return router
}

export function errorStatus(err: unknown): number {
  const e = (err ?? {}) as { code?: unknown; status?: unknown; statusCode?: unknown }
  if (e.code === 'P2003') return 400 // foreign key: references a record that does not exist
  if (e.code === 'P2025') return 404 // record to update or delete not found
  if (e.code === 'P2002') return 409 // unique constraint violated
  // Errors from middleware (body-parser, etc.) already carry their HTTP status.
  for (const s of [e.status, e.statusCode]) {
    if (Number.isInteger(s) && (s as number) >= 400 && (s as number) <= 499) return s as number
  }
  return 500
}

function errorMessage(status: number): string {
  if (status === 404) return 'No encontrado'
  if (status === 409) return 'Conflicto'
  return status === 500 ? 'Error interno' : 'Solicitud inválida'
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = errorStatus(err)
  if (status === 500) console.error(err)
  if (res.headersSent) return
  res.status(status).json({ error: errorMessage(status) })
}
