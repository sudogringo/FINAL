import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../db'
import { requireAuth } from '../middleware/auth'
import { contactSchema, customerUpsertArgs } from './quoteContact'
import { planQuoteClose, unknownProductIds, type QuoteItem } from './quoteClose'

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

async function fireWebhook(url: string, payload: unknown) {
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[webhook] error disparando', url, err)
  }
}

// Instrumentación VD2 (§3.2): dispara el webhook y espera la respuesta de n8n,
// que incluye t1_start/t1_end de su propia ejecución. Solo se usa en modo medición
// (MEASURE_LATENCY=true) — en el resto de los casos fireWebhook() sigue siendo
// fire-and-forget para no meterle latencia real a la UX de producción.
async function fireWebhookAndWait(url: string, payload: unknown): Promise<unknown | null> {
  if (!url) return null
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      console.error('[webhook] respuesta no-ok en modo medición', url, res.status)
      return null
    }
    return await res.json()
  } catch (err) {
    console.error('[webhook] error disparando (modo medición)', url, err)
    return null
  }
}

// Public — frontend submits quote
quotesRouter.post('/', async (req: Request, res: Response) => {
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

  // Persistencia: si la base no responde, se informa 503 en lugar de dejar caer el
  // proceso (Express 4 no captura rechazos de handlers async). No se dispara ningún
  // webhook: sin cotización persistida no hay nada que notificar.
  let quote
  try {
    // Upsert customer por email (sin pisar datos de un cliente existente)
    const stored = await prisma.customer.findUnique({
      where:  { email: contact.email },
      select: { empresa: true, telefono: true, localidad: true },
    })
    const customer = await prisma.customer.upsert(customerUpsertArgs(contact, stored))

    quote = await prisma.quote.create({
      data: { sessionId, contact, items, customerId: customer.id },
    })
  } catch (err) {
    console.error(JSON.stringify({ event: 'quote_persist_failed', sessionId, error: String(err) }))
    res.status(503).json({ error: 'No se pudo registrar la solicitud. Intentá de nuevo en unos minutos.' })
    return
  }

  const webhookUrl = process.env.N8N_QUOTE_WEBHOOK ?? ''
  const webhookPayload = {
    quoteId:   quote.id,
    sessionId: quote.sessionId,
    contact,
    items,
    createdAt: quote.createdAt,
    clientSubmittedAt,
  }

  // Modo medición VD2 (§3.2): espera la respuesta de n8n con t1_start/t1_end y la
  // devuelve en la respuesta HTTP, para que el script de docs/research/quote-latency/
  // pueda calcular la latencia end-to-end. Gateado por env var para no afectar el
  // comportamiento normal (fire-and-forget) de la UX de producción.
  if (process.env.MEASURE_LATENCY === 'true') {
    const n8nResult = await fireWebhookAndWait(webhookUrl, webhookPayload)
    console.log(JSON.stringify({ event: 'quote_notified', quoteId: quote.id, n8nResult }))
    res.status(201).json({ id: quote.id, clientSubmittedAt, receivedAt, n8n: n8nResult })
    return
  }

  // Disparar webhook a n8n (sin bloquear la respuesta)
  fireWebhook(webhookUrl, webhookPayload)

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

    // Disparar webhook de logística a n8n solo después de confirmar la transacción
    if (outcome.order) {
      fireWebhook(process.env.N8N_LOGISTICS_WEBHOOK ?? '', {
        orderId: outcome.order.id,
        quoteId: id,
        contact: outcome.contact,
        items:   outcome.items,
      })
    }
    res.json(outcome.quote)
  } catch (err) {
    console.error(JSON.stringify({ event: 'quote_status_failed', quoteId: id, error: String(err) }))
    res.status(500).json({ error: 'No se pudo actualizar la cotización' })
  }
})
