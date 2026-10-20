import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Hero from '../components/Hero'

jest.mock('../assets/hero-banner.jpg', () => 'hero-banner.jpg')

const renderHero = () => render(<MemoryRouter><Hero /></MemoryRouter>)

describe('Hero - marca y aviso', () => {
  it('no afirma "marca registrada"', () => {
    const { container } = renderHero()
    expect(container.textContent ?? '').not.toMatch(/marca registrada/i)
  })

  it('muestra la ubicación neutra MENDOZA · ARGENTINA', () => {
    renderHero()
    expect(screen.getByText(/Mendoza · Argentina/i)).toBeInTheDocument()
  })

  it('muestra el aviso de prototipo académico sin vínculo comercial', () => {
    renderHero()
    expect(screen.getByText(/Prototipo académico \(UTN FRM\)/i)).toBeInTheDocument()
    expect(screen.getByText(/sin vínculo comercial con Golden Harvest S\.A\./i)).toBeInTheDocument()
  })

  it('el aviso no usa text-xs ni tamaños menores a 14px', () => {
    renderHero()
    const notice = screen.getByText(/Prototipo académico/i)
    expect(notice.className).not.toMatch(/text-xs|text-\[(\d|1[0-3])px\]/)
  })
})
