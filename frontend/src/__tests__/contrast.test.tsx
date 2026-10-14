import '@testing-library/jest-dom'
import { readFileSync } from 'fs'
import { join } from 'path'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Production from '../components/Production'
import About from '../components/About'
import Certifications from '../components/Certifications'
import Footer from '../components/layout/Footer'
import CatalogoPage from '../pages/CatalogoPage'
import ProductCard from '../features/products/components/ProductCard'
import { CartProvider } from '../features/cart/CartContext'

jest.mock('../features/admin/api', () => ({
  logInteraction: jest.fn(),
  fetchProducts: jest.fn().mockResolvedValue([
    { id: 'a', name: 'Tomate A', line: 'roja', description: 'd', sizes: ['1kg'], tag: 't', stockBySize: { '1kg': 5 }, imageUrl: null },
  ]),
}))

beforeEach(() => {
  global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({}) }) as unknown as typeof fetch
})

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map(i => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

const css = readFileSync(join(__dirname, '../index.css'), 'utf8')
const token = (name: string) => css.match(new RegExp(`--color-${name}:\\s*(#[0-9A-Fa-f]{6})`))?.[1]

// Alpha-tinted text classes must stay above these floors (computed so the
// result is >= 4.5:1 on the lightest/darkest real backgrounds they sit on).
const MIN_ALPHA_DARK_ON_LIGHT = 65 // text-dark/NN on #EEEBE2 / #FBFBFB / white
const MIN_ALPHA_WHITE_ON_DARK = 50 // text-white/NN on #111 / #1B1B1B / #212121

function alphaClasses(container: HTMLElement, prefix: string) {
  const out: { cls: string; n: number }[] = []
  container.querySelectorAll('[class]').forEach(el => {
    el.getAttribute('class')!.split(/\s+/).forEach(cls => {
      const m = cls.match(new RegExp(`^${prefix}/(\\d+)$`))
      if (m) out.push({ cls, n: Number(m[1]) })
    })
  })
  return out
}

describe('text-safe gold token', () => {
  it('defines --color-gold-text reaching 4.5:1 on cream card (#EEEBE2) and page (#FBFBFB)', () => {
    const t = token('gold-text')
    expect(t).toBeDefined()
    expect(ratio(t!, '#EEEBE2')).toBeGreaterThanOrEqual(4.5)
    expect(ratio(t!, '#FBFBFB')).toBeGreaterThanOrEqual(4.5)
  })

  it('keeps the brand gold untouched for decorative use', () => {
    expect(token('gold')!.toUpperCase()).toBe('#CABC6B')
  })
})

describe('no low-contrast text utilities on light surfaces', () => {
  it('Production (all tabs): no brand-gold text on light cards, no low-alpha dark text', () => {
    const { container } = render(<Production />)
    ;['Tomate', 'Durazno', 'Etiquetado'].forEach(label => {
      fireEvent.click(screen.getByRole('button', { name: new RegExp(label) }))
      container.querySelectorAll<HTMLElement>('[style]').forEach(el => {
        if (el.closest('.bg-\\[\\#1B1B1B\\]')) return // third card is dark
        if (el.closest('button')) return // tab pills handled below
        expect(['rgb(202, 188, 107)', 'rgb(168, 157, 79)']).not.toContain(el.style.color)
      })
    })
    expect(container.innerHTML).not.toMatch(/text-\[#CABC6B\]/)
    expect(alphaClasses(container, 'text-\\[#1B1B1B\\]').filter(a => a.n < 65)).toEqual([])
  })

  it('Production: inactive tab text alpha >= 0.65', () => {
    render(<Production />)
    const inactive = screen.getByRole('button', { name: /Durazno/ })
    const a = Number(inactive.style.color.match(/rgba\(27, 27, 27, ([\d.]+)\)/)?.[1])
    expect(a).toBeGreaterThanOrEqual(0.65)
  })

  it('Production: selected pill never pairs white text with a light gold background', () => {
    render(<Production />)
    ;['Durazno', 'Etiquetado'].forEach(label => {
      const pill = screen.getByRole('button', { name: new RegExp(label) })
      fireEvent.click(pill)
      expect(pill.style.color).not.toBe('white')
    })
  })

  it('Catalogo page + cards: no text-gold, no text-dark below the alpha floor', async () => {
    const { container } = render(<CartProvider><CatalogoPage /></CartProvider>)
    await screen.findByText('Tomate A')
    expect(container.querySelector('.text-gold')).toBeNull()
    expect(container.querySelector('.text-gold-dark')).toBeNull()
    expect(alphaClasses(container, 'text-dark').filter(a => a.n < MIN_ALPHA_DARK_ON_LIGHT)).toEqual([])
  })

  it('ProductCard: no low-alpha text, line label not in raw #A89D4F', () => {
    const { container } = render(
      <CartProvider>
        <ProductCard product={{ id: 'x', name: 'N', line: 'dorada', description: 'd', sizes: ['1kg'], tag: 't', stockBySize: { '1kg': 3 }, imageUrl: null }} />
      </CartProvider>
    )
    expect(alphaClasses(container, 'text-dark').filter(a => a.n < MIN_ALPHA_DARK_ON_LIGHT)).toEqual([])
    expect(screen.getByText('Línea Dorada').style.color).not.toBe('rgb(168, 157, 79)')
  })

  it('About: no brand-gold text on light background', () => {
    const { container } = render(<About />)
    expect(container.innerHTML).not.toMatch(/text-\[#CABC6B\]/)
    expect(container.innerHTML).not.toMatch(/color: rgb\(202, 188, 107\)/)
  })
})

describe('no low-contrast text utilities on dark surfaces', () => {
  it('Certifications: white text alpha >= floor', () => {
    const { container } = render(<Certifications />)
    expect(alphaClasses(container, 'text-white').filter(a => a.n < MIN_ALPHA_WHITE_ON_DARK)).toEqual([])
  })

  it('Footer: white/gold text alpha >= floor', () => {
    const { container } = render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(alphaClasses(container, 'text-white').filter(a => a.n < MIN_ALPHA_WHITE_ON_DARK)).toEqual([])
    expect(alphaClasses(container, 'text-gold')).toEqual([])
  })
})
