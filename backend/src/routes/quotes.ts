import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../db'
import { requireAuth } from '../middleware/auth'
import { contactSchema, customerUpsertArgs } from './quoteContact'
import { planQuoteClose, unknownProductIds, type QuoteItem } from './quoteClose'
import { persistQuote } from './quoteCreate'
import { attemptDelivery } from '../webhooks/dispatcher'
import { enqueueDelivery } from '../webhooks/store'
import { orderConfirmedDelivery, DEFAULT_CONFIG } from '../webhooks/outbox'
import { dispatcherDeps } from '../webhooks/runtime'
import { quoteRateLimit } from '../middleware/rateLimit'

export const quotesRouter = Router()

const quoteSchema = z.object({
  sessionId: z.string(),
  // Timestamp capturado en el frontend justo antes del submit — T0 de VD2 (§3.2).
  // Opcional: si falta (llamadas fuera del flujo instrumentado), no rompe el endpoint.
  clientSubmittedAt: z.string().datetime().optional(),
  contact: contactSchema,
  items: z.array(z.object({
    id: z.string(),
    name: z.string(),
    line: z.string(),
    size: z.string(),
    qty: z.number().int().min(1),
  })).min(1),
})

// Public — frontend submits quote
quotesRouter.post('/', quoteRateLimit, async (req: Request, res: Response) => {
  const receivedAt = new Date().toISOString()
  const result = quoteSchema.safeParse(req.body)
  if (!result.success) {
    res.status(400).json({ error: result.error.flatten() })
    return
  }

  const { contact, sessionId, items, clientSubmittedAt } = result.data

  console.log(JSON.stringify({ event: 'quote_received', sessionId, clientSubmittedAt, receivedAt }))

  // Un ítem con un producto inexistente no se puede cerrar después (la orden
  // referencia el producto): se rechaza acá, antes de persistir nada.
  let known
  try {
    known = await prisma.product.findMany({ where: { id: { in: items.map(i => i.id) } }, select: { id: true } })
  } catch (err) {
    console.error(JSON.stringify({ event: 'quote_persist_failed', sessionId, error: String(err) }))
    res.status(503).json({ error: 'No se pudo registrar la solicitud. Intentá de nuevo en unos minutos.' })
    return
  }
  const unknown = unknownProductIds(items, known.map(p => p.id))
  if (unknown.length) {
    res.status(400).json({ error: 'Productos inexistentes en la solicitud', unknown })
    return
  }

  // Persistencia: cliente, cotización y entrega pendiente del webhook van en una
  // sola transacción (outbox). Si la base no responde se informa 503 y no queda
  // nada a medias. La notificación a n8n la hace el dispatcher en segundo plano,
  // con reintentos: la respuesta al cliente nunca espera a n8n.
  const measure = process.env.MEASURE_LATENCY === 'true'
  let persisted
  try {
    persisted = await persistQuote(prisma, { sessionId, contact, items, clientSubmittedAt }, {
      // En modo medición la entrega se "estaciona" (lease) mientras se envía en línea.
      nextAttemptAt: measure ? new Date(Date.now() + DEFAULT_CONFIG.leaseMs) : undefined,
    })
  } catch (err) {
    console.error(JSON.stringify({ event: 'quote_persist_failed', sessionId, error: String(err) }))
    res.status(503).json({ error: 'No se pudo registrar la solicitud. Intentá de nuevo en unos minutos.' })
    return
  }
  const { quote, delivery } = persisted

  // Modo medición VD2 (§3.2): envía la entrega en línea (misma lógica y mismo
  // estado que el dispatcher) y devuelve la respuesta de n8n con t1_start/t1_end,
  // para que el script de docs/research/quote-latency/ calcule la latencia
  // end-to-end. Si el intento falla, la entrega queda PENDING con backoff y el
  // dispatcher la reintenta. Gateado por env var: no afecta a producción.
  if (measure) {
    let n8nResult: unknown = null
    try {
      n8nResult = (await attemptDelivery(delivery, dispatcherDeps)).body
    } catch (err) {
      console.error('[webhook] error en modo medición', err)
    }
    console.log(JSON.stringify({ event: 'quote_notified', quoteId: quote.id, n8nResult }))
    res.status(201).json({ id: quote.id, clientSubmittedAt, receivedAt, n8n: n8nResult })
    return
  }

  res.status(201).json({ id: quote.id })
})

// Admin — list all quotes
quotesRouter.get('/', requireAuth, async (_req: Request, res: Response) => {
  const quotes = await prisma.quote.findMany({
    orderBy: { createdAt: 'desc' },
    include: { customer: { select: { nombre: true, email: true } } },
  })
  res.json(quotes)
})

// Admin — update status (descuenta stock al cerrar, crea Order)
quotesRouter.patch('/:id/status', requireAuth, async (req: Request, res: Response) => {
  const { status } = req.body
  const valid = ['PENDING', 'CONTACTED', 'CLOSED']
  if (!valid.includes(status)) {
    res.status(400).json({ error: 'Estado inválido' }); return
  }

  const id = String(req.params.id)
  try {
    // Descuento de stock, orden y cambio de estado van juntos o no va ninguno.
    const outcome = await prisma.$transaction(async tx => {
      const existing = await tx.quote.findUnique({ where: { id }, include: { order: true } })
      if (!existing) return { kind: 'not_found' as const }

      let order = null
      if (status === 'CLOSED' && existing.status !== 'CLOSED' && existing.customerId) {
        const items = existing.items as unknown as QuoteItem[]
        const products = await tx.product.findMany({
          where:  { id: { in: items.map(i => i.id) } },
          select: { id: true, stockBySize: true },
        })
        const plan = planQuoteClose({ items, products, orderExists: existing.order !== null })
        if (plan.missingProducts.length) return { kind: 'missing' as const, missing: plan.missingProducts }

        for (const u of plan.stockUpdates) {
          await tx.product.update({ where: { id: u.id }, data: { stockBySize: u.stockBySize } })
        }
        if (plan.orderItems.length) {
          order = await tx.order.create({
            data: {
              customerId: existing.customerId,
              quoteId:    existing.id,
              estado:     'CONFIRMADO',
              items:      { create: plan.orderItems },
            },
          })
          // Webhook de logística: se registra en el outbox dentro de la misma
          // transacción que la orden (el dispatcher lo entrega con reintentos).
          await enqueueDelivery(tx, orderConfirmedDelivery({
            orderId: order.id,
            payload: { orderId: order.id, quoteId: id, contact: existing.contact, items: existing.items },
          }))
        }
      }

      const quote = await tx.quote.update({ where: { id }, data: { status } })
      return { kind: 'ok' as const, quote, order, contact: existing.contact, items: existing.items }
    })

    if (outcome.kind === 'not_found') {
      res.status(404).json({ error: 'Cotización no encontrada' }); return
    }
    if (outcome.kind === 'missing') {
      res.status(409).json({ error: 'La cotización incluye productos que ya no existen', missing: outcome.missing }); return
    }

    res.json(outcome.quote)
  } catch (err) {
    console.error(JSON.stringify({ event: 'quote_status_failed', quoteId: id, error: String(err) }))
    res.status(500).json({ error: 'No se pudo actualizar la cotización' })
  }
})
