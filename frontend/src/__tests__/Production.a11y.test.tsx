import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import Production from '../components/Production'

describe('Production carousel dots', () => {
  it('exposes each dot as a named button', () => {
    render(<Production />)
    const dots = screen.getAllByRole('button', { name: /^Ir a la imagen \d de 3$/ })
    expect(dots).toHaveLength(3)
    expect(dots.map(d => d.getAttribute('aria-label'))).toEqual([
      'Ir a la imagen 1 de 3',
      'Ir a la imagen 2 de 3',
      'Ir a la imagen 3 de 3',
    ])
  })

  it('marks only the active dot with aria-current and follows selection', () => {
    render(<Production />)
    const dot = (n: number) => screen.getByRole('button', { name: `Ir a la imagen ${n} de 3` })
    expect(dot(1)).toHaveAttribute('aria-current', 'true')
    expect(dot(2)).not.toHaveAttribute('aria-current')
    fireEvent.click(dot(3))
    expect(dot(3)).toHaveAttribute('aria-current', 'true')
    expect(dot(1)).not.toHaveAttribute('aria-current')
  })

  it('gives each dot a 24x24 hit area while the visible dot stays 8x8', () => {
    render(<Production />)
    const dot = screen.getByRole('button', { name: 'Ir a la imagen 2 de 3' })
    expect(dot).toHaveClass('w-6', 'h-6')
    const visible = dot.querySelector('span')
    expect(visible).not.toBeNull()
    expect(visible).toHaveClass('w-2', 'h-2', 'rounded-full')
  })
})
