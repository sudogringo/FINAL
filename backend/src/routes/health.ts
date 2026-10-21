import { Router, Request, Response } from 'express'
import { prisma } from '../db'

// commit: the deployed git commit (Render sets RENDER_GIT_COMMIT); omitted when unknown.
export const healthHandler = (checkDb: () => Promise<void>, commit?: string) => async (_req: Request, res: Response) => {
  const version = commit ? { commit: commit.slice(0, 7) } : {}
  try {
    await checkDb()
    res.json({ status: 'ok', db: 'up', ...version })
  } catch {
    res.status(503).json({ status: 'degraded', db: 'down', ...version })
  }
}

export const healthRouter = Router()
healthRouter.get('/', healthHandler(async () => { await prisma.$queryRaw`SELECT 1` }, process.env.RENDER_GIT_COMMIT))
