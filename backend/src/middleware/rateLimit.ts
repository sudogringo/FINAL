import type { Request, Response, NextFunction, RequestHandler } from 'express'

export interface RateLimitOptions {
  windowMs: number
  max: number
  now?: () => number
  skip?: (req: Request) => boolean
}

// Limitador en memoria por IP (ventana fija). Alcanza para una sola instancia
// (plan gratuito de Render); con varias réplicas habría que moverlo a un store compartido.
export function rateLimit({ windowMs, max, now = Date.now, skip }: RateLimitOptions): RequestHandler {
  const buckets = new Map<string, { count: number; resetAt: number }>()
  return (req: Request, res: Response, next: NextFunction) => {
    if (skip?.(req)) { next(); return }
    const t = now()
    for (const [k, b] of buckets) if (b.resetAt <= t) buckets.delete(k) // evita crecer sin límite
    const key = req.ip ?? 'unknown'
    let b = buckets.get(key)
    if (!b) { b = { count: 0, resetAt: t + windowMs }; buckets.set(key, b) }
    b.count++
    if (b.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((b.resetAt - t) / 1000)))
      res.status(429).json({ error: 'Demasiadas solicitudes. Intentá de nuevo en unos minutos.' })
      return
    }
    next()
  }
}

const num = (v: string | undefined, d: number) => (Number.isFinite(Number(v)) && Number(v) > 0 ? Number(v) : d)

// POST /api/quotes: 10 por IP cada 10 minutos (se desactiva en modo medición de latencia).
export const quoteRateLimit = rateLimit({
  windowMs: 10 * 60_000,
  max: num(process.env.RATE_LIMIT_QUOTES_MAX, 10),
  skip: () => process.env.MEASURE_LATENCY === 'true' || process.env.RATE_LIMIT_DISABLED === 'true',
})

// POST /api/interactions: 120 por IP por minuto (el catálogo registra vistas y carrito).
export const interactionRateLimit = rateLimit({
  windowMs: 60_000,
  max: num(process.env.RATE_LIMIT_INTERACTIONS_MAX, 120),
  skip: () => process.env.RATE_LIMIT_DISABLED === 'true',
})
