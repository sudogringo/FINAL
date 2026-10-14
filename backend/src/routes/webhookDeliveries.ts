import { Router, Request, Response } from 'express'
import { prisma } from '../db'
import { requireAuthOrServiceKey } from '../middleware/auth'
import { parseStatusFilter, type DeliveryStatus } from '../webhooks/outbox'

export const listDeliveriesHandler =
  (list: (status: DeliveryStatus | undefined) => Promise<unknown[]>) =>
  async (req: Request, res: Response) => {
    const status = parseStatusFilter(req.query.status)
    if (status === null) { res.status(400).json({ error: 'status inválido (PENDING, DELIVERED, FAILED, SKIPPED)' }); return }
    res.json(await list(status))
  }

export const webhookDeliveriesRouter = Router()

// Observabilidad del outbox: admin (JWT) o n8n/servicios (X-Service-Key).
webhookDeliveriesRouter.get('/', requireAuthOrServiceKey, listDeliveriesHandler(status =>
  prisma.webhookDelivery.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
    take: 200,
  }),
))
