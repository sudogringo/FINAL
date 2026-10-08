import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuoteForm from '../features/quote/components/QuoteForm'
import { CartProvider, useCart } from '../features/cart/CartContext'
import { act } from 'react'
import { submitQuote } from '../features/admin/api'

jest.mock('../features/admin/api', () => ({ submitQuote: jest.fn().mockResolvedValue({ id: 'q1' }) }))

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

  it('offers an optional Localidad field', async () => {
    renderForm()
    act(() => { fireEvent.click(screen.getByText('Abrir formulario')) })
    await screen.findByRole('dialog')
    const input = screen.getByLabelText(/Localidad/i)
    expect(input).toBeInTheDocument()
    expect(input).not.toBeRequired()
  })

  it('sends localidad inside contact when the user fills it', async () => {
    const user = userEvent.setup()
    // jsdom lacks crypto.randomUUID(), the fallback when no session id exists yet.
    sessionStorage.setItem('gh_session_id', 'test-session')
    renderForm()
    act(() => { fireEvent.click(screen.getByText('Abrir formulario')) })
    await screen.findByRole('dialog')
    await user.type(screen.getByLabelText(/Nombre completo/i), 'Juan García')
    await user.type(screen.getByLabelText(/Email/i), 'juan@example.com')
    await user.type(screen.getByLabelText(/Localidad/i), 'Godoy Cruz, Mendoza')
    await user.click(screen.getByRole('button', { name: /Enviar Cotización/i }))
    await waitFor(() => expect(submitQuote).toHaveBeenCalled())
    const payload = (submitQuote as jest.Mock).mock.calls.at(-1)[0]
    expect(payload.contact.localidad).toBe('Godoy Cruz, Mendoza')
  })

  it('rejects a localidad longer than 100 characters', async () => {
    const user = userEvent.setup()
    renderForm()
    act(() => { fireEvent.click(screen.getByText('Abrir formulario')) })
    await screen.findByRole('dialog')
    fireEvent.change(screen.getByLabelText(/Localidad/i), { target: { value: 'x'.repeat(101) } })
    await user.click(screen.getByRole('button', { name: /Enviar Cotización/i }))
    expect(await screen.findByText(/Máximo 100 caracteres/i)).toBeInTheDocument()
  })
})
