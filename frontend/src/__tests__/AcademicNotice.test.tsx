import '@testing-library/jest-dom'
import { readFileSync } from 'fs'
import { join } from 'path'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Footer from '../components/layout/Footer'
import Contact from '../components/Contact'

// The published site is an academic prototype modeled on a real company.
// It must say so on every page and must not present itself as the company
// (no real contact address, no Organization structured data).

describe('Aviso de proyecto académico', () => {
  it('el pie de página declara que es un proyecto académico sin vínculo con la empresa', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.getByText(/proyecto académico/i)).toBeInTheDocument()
    expect(screen.getByText(/sin vínculo con Golden Harvest S\.A\./i)).toBeInTheDocument()
  })

  it('el pie de página no reclama derechos en nombre de la empresa', () => {
    render(<MemoryRouter><Footer /></MemoryRouter>)
    expect(screen.queryByText(/derechos reservados/i)).not.toBeInTheDocument()
  })

  it('la página de contacto no enlaza el correo real de la empresa', () => {
    const { container } = render(<MemoryRouter><Contact /></MemoryRouter>)
    expect(container.querySelector('a[href^="mailto:"]')).toBeNull()
    expect(screen.queryByText(/info@goldenharvest\.com\.ar/i)).not.toBeInTheDocument()
  })

  it('index.html no declara datos estructurados de organización ni autoría de la empresa', () => {
    const html = readFileSync(join(process.cwd(), 'index.html'), 'utf8')
    expect(html).not.toMatch(/application\/ld\+json/)
    expect(html).not.toMatch(/"@type":\s*"Organization"/)
    expect(html).not.toMatch(/name="author" content="Golden Harvest/)
  })
})
