import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

async function main() {
  // Admin por defecto
  const passwordHash = await bcrypt.hash('admin1234', 10)
  await prisma.admin.upsert({
    where: { email: 'admin@goldenharvest.com' },
    update: {},
    create: { email: 'admin@goldenharvest.com', passwordHash },
  })

  // Productos iniciales
  const products = [
    {
      name: 'Tomate Entero Pelado',
      line: 'roja' as const,
      description: 'En jugo natural, ideal para guisos y salsas caseras. Sabor auténtico del campo.',
      sizes: ['250g', '1kg', '4kg'],
      tag: 'Clásico',
    },
    {
      name: 'Cubetti di Pomodoro',
      line: 'roja' as const,
      description: 'Tomate en cubos perfectos, ideal para preparaciones rápidas sin perder textura.',
      sizes: ['250g', '1kg'],
      tag: 'Popular',
    },
    {
      name: 'Salsa Clásica',
      line: 'roja' as const,
      description: 'Nuestra receta tradicional con tomates seleccionados y especias naturales.',
      sizes: ['250g', '1kg'],
      tag: 'Premium',
    },
    {
      name: 'Doble Concentrado',
      line: 'roja' as const,
      description: 'Alta concentración para dar color y sabor intenso a tus preparaciones.',
      sizes: ['250g', '1kg', '4kg'],
      tag: 'Profesional',
    },
    {
      name: 'Mitades en Almíbar',
      line: 'dorada' as const,
      description: 'Duraznos cortados en mitades, en almíbar suave. El clásico de la mesa argentina.',
      sizes: ['250g', '1kg', '4kg'],
      tag: 'Clásico',
    },
    {
      name: 'Trozos en Almíbar',
      line: 'dorada' as const,
      description: 'Versátil, ideal para postres, repostería y ensaladas de fruta.',
      sizes: ['250g', '1kg'],
      tag: 'Versátil',
    },
    {
      name: 'Durazno Light',
      line: 'dorada' as const,
      description: 'Menos azúcar, mismo sabor auténtico. Para quienes cuidan su alimentación.',
      sizes: ['250g', '1kg'],
      tag: 'Light',
    },
    {
      name: 'Durazno al Natural',
      line: 'dorada' as const,
      description: 'Sin azúcar agregada, en agua. Pureza total del durazno de cosecha propia.',
      sizes: ['250g', '1kg', '4kg'],
      tag: 'Natural',
    },
  ]

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: 'seed-' + p.name.toLowerCase().replace(/\s+/g, '-') },
      update: {},
      create: { id: 'seed-' + p.name.toLowerCase().replace(/\s+/g, '-'), ...p },
    })
  }

  console.log('Seed completado:')
  console.log('  Admin: admin@goldenharvest.com / admin1234')
  console.log(`  Productos: ${products.length} cargados`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
