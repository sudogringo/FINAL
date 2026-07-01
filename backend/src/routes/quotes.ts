import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../db'
import { requireAuth } from '../middleware/auth'

export const quotesRouter = Router()

const quoteSchema = z.object({
  sessionId: z.string(),
  contact: z.object({
    nombre: z.string(),
    empresa: z.string().optional(),
    telefono: z.string().optional(),
    email: z.string().email(),
    notas: z.string().optional(),
  }),
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    line: z.string(),
    size: z.string(),
    qty: z.number().int().min(1),
  })).min(1),
})

// Public — frontend submits quote
quotesRouter.post('/', async (req: Request, res: Response) => {
  const result = quoteSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() })
    return
  }
  const quote = await prisma.quote.create({ data: result.data })
  res.status(201).json({ id: quote.id })
})

// Admin — list all quotes
quotesRouter.get('/', requireAuth, async (_req: Request, res: Response) => {
  const quotes = await prisma.quote.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(quotes)
})

// Admin — update status (descuenta stock al cerrar)
quotesRouter.patch('/:id/status', requireAuth, async (req: Request, res: Response) => {
  const { status } = req.body
  const valid = ['PENDING', 'CONTACTED', 'CLOSED']
  if (!valid.includes(status)) {
    res.status(400).json({ error: 'Estado inválido' })
    return
  }

  const existing = await prisma.quote.findUnique({ where: { id: req.params.id } })
  if (!existing) {
    res.status(404).json({ error: 'Cotización no encontrada' })
    return
  }

  // Descontar stock solo cuando se cierra (y no estaba ya cerrada)
  if (status === 'CLOSED' && existing.status !== 'CLOSED') {
    const items = existing.items as Array<{ id: string; size: string; qty: number }>

    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } })
      if (!product) continue

      const stockBySize = (product.stockBySize ?? {}) as Record<string, number>
      const current = stockBySize[item.size] ?? 0
      const next = Math.max(0, current - item.qty)

      await prisma.product.update({
        where: { id: item.id },
        data: { stockBySize: { ...stockBySize, [item.size]: next } },
      })
    }
  }

  const quote = await prisma.quote.update({ where: { id: req.params.id }, data: { status } })
  res.json(quote)
})
