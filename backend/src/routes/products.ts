import { Router, Request, Response } from 'express'
import { prisma } from '../db'
import { requireAuth } from '../middleware/auth'
import { productSchema } from './productSchema'

export const productsRouter = Router()

// ─── Public ────────────────────────────────────────────────────────────────

productsRouter.get('/', async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: 'asc' },
  })
  res.json(products)
})

productsRouter.get('/:id', async (req: Request, res: Response) => {
  const product = await prisma.product.findUnique({ where: { id: String(req.params.id) } })
  if (!product || !product.active) {
    res.status(404).json({ error: 'Producto no encontrado' })
    return
  }
  res.json(product)
})

// ─── Admin (protected) ──────────────────────────────────────────────────────


productsRouter.get('/admin/all', requireAuth, async (_req: Request, res: Response) => {
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(products)
})

productsRouter.post('/admin', requireAuth, async (req: Request, res: Response) => {
  const result = productSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() })
    return
  }
  const product = await prisma.product.create({ data: result.data })
  res.status(201).json(product)
})

productsRouter.put('/admin/:id', requireAuth, async (req: Request, res: Response) => {
  const result = productSchema.partial().safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() })
    return
  }
  try {
    const product = await prisma.product.update({
      where: { id: String(req.params.id) },
      data: result.data,
    })
    res.json(product)
  } catch {
    res.status(404).json({ error: 'Producto no encontrado' })
  }
})

productsRouter.delete('/admin/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    await prisma.product.update({
      where: { id: String(req.params.id) },
      data: { active: false },
    })
    res.json({ ok: true })
  } catch {
    res.status(404).json({ error: 'Producto no encontrado' })
  }
})
