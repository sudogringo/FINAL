import { Router, Request, Response } from 'express'
import { prisma } from '../db'
import { requireAuth } from '../middleware/auth'

export const ordersRouter = Router()

ordersRouter.get('/', requireAuth, async (req: Request, res: Response) => {
  const { month, estado } = req.query

  const orders = await prisma.order.findMany({
    where: {
      ...(estado ? { estado: String(estado) as any } : {}),
      ...(month
        ? {
            createdAt: {
              gte: new Date(`${month}-01T00:00:00.000Z`),
              lt:  new Date(
                new Date(`${month}-01`).getFullYear() +
                '-' +
                String(new Date(`${month}-01`).getMonth() + 2).padStart(2, '0') +
                '-01T00:00:00.000Z'
              ),
            },
          }
        : {}),
    },
    include: {
      customer: { select: { nombre: true, email: true, localidad: true } },
      items: { include: { product: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const result = orders.map(o => ({
    id: o.id,
    estado: o.estado,
    createdAt: o.createdAt,
    customer_nombre: o.customer.nombre,
    customer_email: o.customer.email,
    localidad: o.customer.localidad,
    total: o.items.reduce((sum, i) => sum + i.cantidad, 0),
  }))

  res.json(result)
})

ordersRouter.get('/:id/items', requireAuth, async (req: Request, res: Response) => {
  const items = await prisma.orderItem.findMany({
    where: { orderId: req.params.id },
    include: { product: { select: { name: true, line: true } } },
  })
  if (!items.length) { res.status(404).json({ error: 'Orden no encontrada o sin items' }); return }
  res.json(items.map(i => ({
    cantidad: i.cantidad,
    nombre: i.nombre,
    size: i.size,
    product_name: i.product.name,
    product_line: i.product.line,
  })))
})
