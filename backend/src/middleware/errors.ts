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
  const code = (err as { code?: unknown } | undefined)?.code
  if (code === 'P2003') return 400 // foreign key: references a record that does not exist
  if (code === 'P2025') return 404 // record to update or delete not found
  return 500
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  const status = errorStatus(err)
  if (status === 500) console.error(err)
  if (res.headersSent) return
  res.status(status).json({ error: status === 500 ? 'Error interno' : 'Solicitud inválida' })
}
