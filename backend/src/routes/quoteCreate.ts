import type { Prisma } from '@prisma/client'
import { customerUpsertArgs } from './quoteContact'
import { enqueueDelivery, type OutboxClient } from '../webhooks/store'
import { quoteCreatedDelivery } from '../webhooks/outbox'

export interface QuoteInput {
  sessionId: string
  clientSubmittedAt?: string
  contact: { email: string; [k: string]: unknown }
  items: unknown[]
}

// Lo que persistQuote necesita de Prisma (se reemplaza por un doble en los tests).
type Tx = OutboxClient & {
  customer: { findUnique: (a: any) => Promise<any>; upsert: (a: any) => Promise<{ id: string }> }
  quote: { create: (a: any) => Promise<{ id: string; sessionId: string; createdAt: Date }> }
}
export interface QuoteDb extends Tx {
  $transaction: <T>(fn: (tx: Tx) => Promise<T>) => Promise<T>
}

/**
 * Guarda cliente + cotización + entrega pendiente del webhook en UNA transacción:
 * si algo falla no queda nada, y si todo sale bien la notificación ya está
 * garantizada en el outbox (la entrega la hace el dispatcher, con reintentos).
 */
export async function persistQuote(db: QuoteDb, input: QuoteInput, opts: { nextAttemptAt?: Date } = {}) {
  const { sessionId, contact, items, clientSubmittedAt } = input
  return db.$transaction(async tx => {
    const stored = await tx.customer.findUnique({
      where:  { email: contact.email },
      select: { empresa: true, telefono: true, localidad: true },
    })
    const customer = await tx.customer.upsert(customerUpsertArgs(contact as any, stored))
    const quote = await tx.quote.create({
      data: { sessionId, contact: contact as Prisma.InputJsonValue, items: items as Prisma.InputJsonValue, customerId: customer.id },
    })
    const delivery = await enqueueDelivery(tx, quoteCreatedDelivery({
      quoteId: quote.id,
      payload: {
        quoteId:   quote.id,
        sessionId: quote.sessionId,
        contact,
        items,
        createdAt: quote.createdAt,
        clientSubmittedAt,
      },
    }), opts.nextAttemptAt)
    return { quote, delivery }
  })
}
