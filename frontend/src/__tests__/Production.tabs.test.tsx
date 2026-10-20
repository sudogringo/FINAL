import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Production from '../components/Production'

describe('Production - fila de pestañas en móvil', () => {
  it('la fila de botones hace wrap para no desbordar la página', () => {
    render(<Production />)
    const row = screen.getByRole('button', { name: /Etiquetado/ }).parentElement!
    expect(row.className).toMatch(/\bflex-wrap\b/)
  })

  it('las 3 pestañas están en la misma fila contenedora', () => {
    render(<Production />)
    const row = screen.getByRole('button', { name: /Etiquetado/ }).parentElement!
    expect(row.querySelectorAll('button')).toHaveLength(3)
  })
})
