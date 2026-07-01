import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuoteForm from '../features/quote/components/QuoteForm'
import { CartProvider, useCart } from '../features/cart/CartContext'
import { act } from 'react'

function QuoteFormWithOpenState() {
  const { addItem, openQuote } = useCart()
  return (
    <>
      <button onClick={() => { addItem({ id: 'p1', name: 'Tomate', line: 'roja', size: '1kg' }); openQuote() }}>
        Abrir formulario
      </button>
      <QuoteForm />
    </>
  )
}

function renderForm() {
  return render(
    <CartProvider>
      <QuoteFormWithOpenState />
    </CartProvider>
  )
}

describe('QuoteForm', () => {
  it('is not rendered when quoteOpen is false', () => {
    render(<CartProvider><QuoteForm /></CartProvider>)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders the form when quote is open', async () => {
    renderForm()
    act(() => { fireEvent.click(screen.getByText('Abrir formulario')) })
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByLabelText(/Nombre completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
  })

  it('shows validation error for empty nombre', async () => {
    const user = userEvent.setup()
    renderForm()
    act(() => { fireEvent.click(screen.getByText('Abrir formulario')) })
    await screen.findByRole('dialog')
    await user.click(screen.getByRole('button', { name: /Enviar Cotización/i }))
    expect(await screen.findByText(/al menos 2 caracteres/i)).toBeInTheDocument()
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    renderForm()
    act(() => { fireEvent.click(screen.getByText('Abrir formulario')) })
    await screen.findByRole('dialog')
    await user.type(screen.getByLabelText(/Nombre completo/i), 'Juan')
    await user.type(screen.getByLabelText(/Email/i), 'not-an-email')
    await user.click(screen.getByRole('button', { name: /Enviar Cotización/i }))
    expect(await screen.findByText(/Email inválido/i)).toBeInTheDocument()
  })

  it('shows notas max 500 chars label', async () => {
    renderForm()
    act(() => { fireEvent.click(screen.getByText('Abrir formulario')) })
    await screen.findByRole('dialog')
    expect(screen.getByText(/Máximo 500 caracteres/i)).toBeInTheDocument()
  })

  it('closes the form when X button is clicked', async () => {
    renderForm()
    act(() => { fireEvent.click(screen.getByText('Abrir formulario')) })
    await screen.findByRole('dialog')
    fireEvent.click(screen.getByLabelText('Cerrar'))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
