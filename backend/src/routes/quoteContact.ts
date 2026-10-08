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

export function customerUpsertArgs(contact: QuoteContact) {
  return {
    where: { email: contact.email },
    update: {
      nombre:    contact.nombre,
      empresa:   contact.empresa,
      telefono:  contact.telefono,
      localidad: contact.localidad,
    },
    create: {
      nombre:    contact.nombre,
      email:     contact.email,
      empresa:   contact.empresa,
      telefono:  contact.telefono,
      localidad: contact.localidad,
    },
  }
}
