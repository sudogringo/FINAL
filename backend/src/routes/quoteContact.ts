import { z } from 'zod'

// Contacto del formulario público de cotización. Se separa de quotes.ts para
// poder probarlo sin base de datos.
export const contactSchema = z.object({
  nombre: z.string(),
  empresa: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email(),
  notas: z.string().optional(),
  // Opcional: destino del pedido, que usa el resumen de despacho del workflow 07.
  // Un valor en blanco cuenta como ausente.
  localidad: z.string().trim().max(100).optional()
    .transform(v => (v ? v : undefined)),
})

export type QuoteContact = z.infer<typeof contactSchema>

// Campos del cliente que el formulario puede completar. El nombre no está: un
// cliente existente siempre lo tiene y el formulario no debe cambiarlo.
const FILLABLE = ['empresa', 'telefono', 'localidad'] as const
type Fillable = typeof FILLABLE[number]
export type StoredCustomer = Partial<Record<Fillable, string | null>>

// El formulario es público: quien conozca el email de un cliente no debe poder
// reescribir sus datos. A un cliente existente solo se le completan los campos
// vacíos; lo que dijo cada cotización queda en Quote.contact.
export function customerUpsertArgs(contact: QuoteContact, stored: StoredCustomer | null) {
  const update: Partial<Record<Fillable, string>> = {}
  if (stored) {
    for (const field of FILLABLE) {
      const value = contact[field]
      if (value && !stored[field]) update[field] = value
    }
  }
  return {
    where: { email: contact.email },
    update,
    create: {
      nombre:    contact.nombre,
      email:     contact.email,
      empresa:   contact.empresa,
      telefono:  contact.telefono,
      localidad: contact.localidad,
    },
  }
}
