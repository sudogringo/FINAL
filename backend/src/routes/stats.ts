import { Router, Request, Response } from 'express'
import { prisma } from '../db'
import { requireAuth } from '../middleware/auth'

export const statsRouter = Router()

// GET /api/stats/monthly?month=YYYY-MM
statsRouter.get('/monthly', async (req: Request, res: Response) => {
  const month = String(req.query.month ?? new Date().toISOString().slice(0, 7))
  const [year, m] = month.split('-').map(Number)
  const from = new Date(year, m - 1, 1)
  const to   = new Date(year, m, 1)

  const [quotes, orders, interactions] = await Promise.all([
    prisma.quote.findMany({
      where: { createdAt: { gte: from, lt: to } },
      select: { status: true, createdAt: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: from, lt: to } },
      include: { items: true },
    }),
    prisma.webInteraction.groupBy({
      by: ['tipo'],
      where: { createdAt: { gte: from, lt: to } },
      _count: { tipo: true },
    }),
  ])

  const itemTotals: Record<string, number> = {}
  for (const order of orders) {
    for (const item of order.items) {
      itemTotals[item.nombre] = (itemTotals[item.nombre] ?? 0) + item.cantidad
    }
  }
  const topProducts = Object.entries(itemTotals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([nombre, units]) => ({ nombre, units }))

  res.json({
    month,
    quotes: {
      total: quotes.length,
      pending:   quotes.filter(q => q.status === 'PENDING').length,
      contacted: quotes.filter(q => q.status === 'CONTACTED').length,
      closed:    quotes.filter(q => q.status === 'CLOSED').length,
    },
    orders: { total: orders.length },
    topProducts,
    webInteractions: interactions.map(i => ({ tipo: i.tipo, count: i._count.tipo })),
  })
})

// GET /api/stats/abandoned-carts
// Cotizaciones PENDING de más de 2 horas sin cerrar
statsRouter.get('/abandoned-carts', async (req: Request, res: Response) => {
  const thresholdMs = Number(process.env.ABANDONED_CART_THRESHOLD_MS ?? 2 * 60 * 60 * 1000)
  const twoHoursAgo = new Date(Date.now() - thresholdMs)

  const quotes = await prisma.quote.findMany({
    where: {
      status: 'PENDING',
      createdAt: { lte: twoHoursAgo },
    },
    include: {
      customer: { select: { nombre: true, email: true, telefono: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json(
    quotes.map(q => ({
      quoteId:    q.id,
      sessionId:  q.sessionId,
      createdAt:  q.createdAt,
      contact:    q.contact,
      items:      q.items,
      customer:   q.customer,
    }))
  )
})
