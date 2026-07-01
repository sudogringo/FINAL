import { Router, Request, Response } from 'express'
import { prisma } from '../db'
import { requireAuth } from '../middleware/auth'

export const customersRouter = Router()

customersRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  const { tipo } = req.query
  const customers = await prisma.customer.findMany({
    where: tipo ? { tipo: String(tipo) } : undefined,
    orderBy: { nombre: 'asc' },
  })
  res.json(customers)
})

customersRouter.get('/:id', requireAuth, async (req: Request, res: Response) => {
  const customer = await prisma.customer.findUnique({ where: { id: req.params.id } })
  if (!customer) { res.status(404).json({ error: 'Cliente no encontrado' }); return }
  res.json(customer)
})
