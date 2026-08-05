import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../db'
import { requireAuth } from '../middleware/auth'

export const interactionsRouter = Router()

const interactionSchema = z.object({
  sessionId: z.string(),
  productId: z.string().optional(),
  tipo: z.enum(['vista', 'carrito', 'compra']),
})

// Public — frontend logs events
interactionsRouter.post('/', async (req: Request, res: Response) => {
  const result = interactionSchema.safeParse(req.body)
  if (!result.success) { res.status(400).json({ error: result.error.flatten() }); return }

  const interaction = await prisma.webInteraction.create({ data: result.data })
  res.status(201).json({ id: interaction.id })
})

// Admin — read interactions
interactionsRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  const { tipo, sessionId } = req.query
  const interactions = await prisma.webInteraction.findMany({
    where: {
      ...(tipo ? { tipo: String(tipo) } : {}),
      ...(sessionId ? { sessionId: String(sessionId) } : {}),
    },
    include: {
      customer: { select: { nombre: true, email: true } },
      product:  { select: { name: true, line: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  })
  res.json(interactions)
})
