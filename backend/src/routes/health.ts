import { Router, Request, Response } from 'express'
import { prisma } from '../db'

export const healthHandler = (checkDb: () => Promise<void>) => async (_req: Request, res: Response) => {
  try {
    await checkDb()
    res.json({ status: 'ok', db: 'up' })
  } catch {
    res.status(503).json({ status: 'degraded', db: 'down' })
  }
}

export const healthRouter = Router()
healthRouter.get('/', healthHandler(async () => { await prisma.$queryRaw`SELECT 1` }))
