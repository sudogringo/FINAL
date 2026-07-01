export type ProductLine = 'roja' | 'dorada'

export interface Product {
  id: string
  name: string
  line: ProductLine
  description: string
  sizes: string[]
  tag: string
  stockBySize: Record<string, number>
  imageUrl?: string | null
}

export const RED_PRODUCTS: Product[] = [
  {
    id: 'tomate-entero',
    name: 'Tomate Entero Pelado',
    line: 'roja',
    description: 'En jugo natural, ideal para guisos y salsas caseras. Sabor auténtico del campo.',
    sizes: ['250g', '1kg', '4kg'],
    tag: 'Clásico',
    stockBySize: {},
  },
  {
    id: 'cubetti',
    name: 'Cubetti di Pomodoro',
    line: 'roja',
    description: 'Tomate en cubos perfectos, ideal para preparaciones rápidas sin perder textura.',
    sizes: ['250g', '1kg'],
    tag: 'Popular',
    stockBySize: {},
  },
  {
    id: 'salsa-clasica',
    name: 'Salsa Clásica',
    line: 'roja',
    description: 'Nuestra receta tradicional con tomates seleccionados y especias naturales.',
    sizes: ['250g', '1kg'],
    tag: 'Premium',
    stockBySize: {},
  },
  {
    id: 'doble-concentrado',
    name: 'Doble Concentrado',
    line: 'roja',
    description: 'Alta concentración para dar color y sabor intenso a tus preparaciones.',
    sizes: ['250g', '1kg', '4kg'],
    tag: 'Profesional',
    stockBySize: {},
  },
]

export const GOLDEN_PRODUCTS: Product[] = [
  {
    id: 'mitades-almibar',
    name: 'Mitades en Almíbar',
    line: 'dorada',
    description: 'Duraznos cortados en mitades, en almíbar suave. El clásico de la mesa argentina.',
    sizes: ['250g', '1kg', '4kg'],
    tag: 'Clásico',
    stockBySize: {},
  },
  {
    id: 'trozos-almibar',
    name: 'Trozos en Almíbar',
    line: 'dorada',
    description: 'Versátil, ideal para postres, repostería y ensaladas de fruta.',
    sizes: ['250g', '1kg'],
    tag: 'Versátil',
    stockBySize: {},
  },
  {
    id: 'durazno-light',
    name: 'Durazno Light',
    line: 'dorada',
    description: 'Menos azúcar, mismo sabor auténtico. Para quienes cuidan su alimentación.',
    sizes: ['250g', '1kg'],
    tag: 'Light',
    stockBySize: {},
  },
  {
    id: 'durazno-natural',
    name: 'Durazno al Natural',
    line: 'dorada',
    description: 'Sin azúcar agregada, en agua. Pureza total del durazno de cosecha propia.',
    sizes: ['250g', '1kg', '4kg'],
    tag: 'Natural',
    stockBySize: {},
  },
]

export const ALL_PRODUCTS: Product[] = [...RED_PRODUCTS, ...GOLDEN_PRODUCTS]
