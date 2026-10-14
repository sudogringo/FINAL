import type { Prisma, PrismaClient } from '@prisma/client'
import type { DeliveryStore } from './dispatcher'
import type { DeliveryRecord, NewDelivery } from './outbox'

/** Cliente raíz o de transacción: lo único que el outbox necesita. */
export interface OutboxClient {
  webhookDelivery: { create: (args: { data: any }) => Promise<any> }
}

/** Registra un webhook pendiente. Se llama con el cliente de la transacción de negocio. */
export function enqueueDelivery(client: OutboxClient, d: NewDelivery, nextAttemptAt?: Date): Promise<DeliveryRecord> {
  return client.webhookDelivery.create({
    data: { ...d, payload: d.payload as Prisma.InputJsonValue, ...(nextAttemptAt ? { nextAttemptAt } : {}) },
  })
}

export function prismaDeliveryStore(prisma: PrismaClient): DeliveryStore {
  return {
    async claimDue(now, limit, leaseMs) {
      const candidates = await prisma.webhookDelivery.findMany({
        where: { status: 'PENDING', nextAttemptAt: { lte: now } },
        orderBy: { nextAttemptAt: 'asc' },
        take: limit,
      })
      const claimed: DeliveryRecord[] = []
      for (const c of candidates) {
        // El updateMany condicional hace de lock optimista: solo un ciclo lo gana.
        const won = await prisma.webhookDelivery.updateMany({
          where: { id: c.id, status: 'PENDING', nextAttemptAt: c.nextAttemptAt },
          data: { nextAttemptAt: new Date(now.getTime() + leaseMs) },
        })
        if (won.count === 1) claimed.push(c as DeliveryRecord)
      }
      return claimed
    },
    async save(id, patch) {
      await prisma.webhookDelivery.update({ where: { id }, data: patch })
    },
  }
}
