import { prisma } from '../db'
import type { DispatcherDeps } from './dispatcher'
import { prismaDeliveryStore } from './store'

/** Dependencias reales del dispatcher (Prisma, fetch global, reloj, URLs desde el entorno). */
export const dispatcherDeps: DispatcherDeps = {
  store: prismaDeliveryStore(prisma),
  fetch: (...args) => fetch(...args),
  now: () => new Date(),
  resolveUrl: target => process.env[target] || undefined,
}
