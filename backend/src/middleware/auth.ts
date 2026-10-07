import { Request, Response, NextFunction } from 'express'
import { createHash, timingSafeEqual } from 'node:crypto'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  adminId?: string
}

export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Token requerido' })
    return
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { adminId: string }
    req.adminId = payload.adminId
    next()
  } catch {
    res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

// Compares hashes so the check takes the same time whatever the input length.
function sameSecret(given: string, expected: string): boolean {
  const a = createHash('sha256').update(given).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

// Routes read by both the admin panel (JWT) and the n8n workflows (shared
// service key in the X-Service-Key header). Without SERVICE_API_KEY set,
// only the JWT path is open.
export function requireAuthOrServiceKey(req: AuthRequest, res: Response, next: NextFunction) {
  const serviceKey = process.env.SERVICE_API_KEY
  const given = req.headers['x-service-key']
  if (serviceKey && typeof given === 'string' && sameSecret(given, serviceKey)) {
    next()
    return
  }
  requireAuth(req, res, next)
}
