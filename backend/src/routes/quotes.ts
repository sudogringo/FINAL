import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../db'
import { requireAuth } from '../middleware/auth'

export const quotesRouter = Router()

const quoteSchema = z.object({
  sessionId: z.string(),
  // Timestamp capturado en el frontend justo antes del submit — T0 de VD2 (§3.2).
  // Opcional: si falta (llamadas fuera del flujo instrumentado), no rompe el endpoint.
  clientSubmittedAt: z.string().datetime().optional(),
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

  // Upsert customer por email
  const customer = await prisma.customer.upsert({
    where: { email: contact.email },
    update: {
      nombre:   contact.nombre,
      empresa:  contact.empresa,
      telefono: contact.telefono,
    },
    create: {
      nombre:   contact.nombre,
      email:    contact.email,
      empresa:  contact.empresa,
      telefono: contact.telefono,
    },
  })

  const quote = await prisma.quote.create({
    data: { sessionId, contact, items, customerId: customer.id },
  })

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

  const existing = await prisma.quote.findUnique({
    where: { id: String(req.params.id) },
    include: { customer: true },
  })
  if (!existing) {
    res.status(404).json({ error: 'Cotización no encontrada' }); return
  }

  if (status === 'CLOSED' && existing.status !== 'CLOSED') {
    const items = existing.items as Array<{ id: string; name: string; size: string; qty: number }>

    // Descontar stock
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.id } })
      if (!product) continue
      const stockBySize = (product.stockBySize ?? {}) as Record<string, number>
      const next = Math.max(0, (stockBySize[item.size] ?? 0) - item.qty)
      await prisma.product.update({
        where: { id: item.id },
        data: { stockBySize: { ...stockBySize, [item.size]: next } },
      })
    }

    // Crear Order si hay customer
    if (existing.customerId) {
      const order = await prisma.order.create({
        data: {
          customerId: existing.customerId,
          quoteId:    existing.id,
          estado:     'CONFIRMADO',
          items: {
            create: items.map(i => ({
              productId: i.id,
              nombre:    i.name,
              size:      i.size,
              cantidad:  i.qty,
            })),
          },
        },
      })

      // Disparar webhook de logística a n8n
      fireWebhook(process.env.N8N_LOGISTICS_WEBHOOK ?? '', {
        orderId:    order.id,
        quoteId:    existing.id,
        contact:    existing.contact,
        items,
      })
    }
  }

  const quote = await prisma.quote.update({ where: { id: String(req.params.id) }, data: { status } })
  res.json(quote)
})
