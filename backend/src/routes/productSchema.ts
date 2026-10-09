import { z } from 'zod'

// Producto del panel de administración. Se separa de products.ts para poder
// probarlo sin base de datos.
export const productSchema = z.object({
  name: z.string().min(2),
  line: z.enum(['roja', 'dorada']),
  description: z.string().min(5),
  sizes: z.array(z.string()).min(1),
  tag: z.string().optional(),
  stockBySize: z.record(z.string(), z.number().int().min(0)).optional(),
  active: z.boolean().optional(),
  // URL que devuelve POST /api/upload; null quita la imagen. Sin este campo, Zod
  // descartaba en silencio la imagen que el panel envía al guardar.
  imageUrl: z.string().url().nullable().optional(),
})
