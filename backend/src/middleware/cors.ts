type CorsOriginFn = (origin: string | undefined, cb: (err: Error | null, allow?: boolean) => void) => void

export function parseAllowedOrigins(raw: string | undefined): string[] {
  return (raw ?? '').split(',').map(s => s.trim().replace(/\/+$/, '')).filter(Boolean)
}

// Orígenes permitidos: los de FRONTEND_URL (lista separada por comas) y, fuera de
// producción, cualquier localhost. Sin cabecera Origin (curl, n8n) se permite.
export function corsOrigin(env: Record<string, string | undefined>): CorsOriginFn {
  const allowed = new Set(parseAllowedOrigins(env.FRONTEND_URL))
  const allowLocalhost = env.NODE_ENV !== 'production'
  return (origin, cb) => {
    if (!origin) return cb(null, true)
    if (allowed.has(origin)) return cb(null, true)
    if (allowLocalhost && /^http:\/\/localhost:\d+$/.test(origin)) return cb(null, true)
    cb(null, false)
  }
}
