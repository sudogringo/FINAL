import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminQuotesPage from '../pages/admin/AdminQuotesPage'
import { AdminProvider } from '../features/admin/AdminContext'
import { fetchQuotes, updateQuoteStatus, type ApiQuote } from '../features/admin/api'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('../features/admin/api', () => ({
  fetchQuotes: jest.fn(),
  updateQuoteStatus: jest.fn(),
}))

const mockedFetchQuotes = fetchQuotes as jest.MockedFunction<typeof fetchQuotes>
const mockedUpdateQuoteStatus = updateQuoteStatus as jest.MockedFunction<typeof updateQuoteStatus>

const STORAGE_KEY = 'gh_admin_token'

function makeQuote(overrides: Partial<ApiQuote> = {}): ApiQuote {
  return {
    id: 'q1',
    sessionId: 's1',
    contact: { nombre: 'Juan Pérez', email: 'juan@test.com' },
    items: [{ id: 'p1', name: 'Tomate', line: 'roja', size: '1kg', qty: 3 }],
    status: 'PENDING',
    customerId: null,
    customer: null,
    createdAt: new Date('2026-01-01T10:00:00Z').toISOString(),
    updatedAt: new Date('2026-01-01T10:00:00Z').toISOString(),
    ...overrides,
  }
}

function renderPage() {
  localStorage.setItem(STORAGE_KEY, 'fake-token')
  return render(
    <MemoryRouter>
      <AdminProvider>
        <AdminQuotesPage />
      </AdminProvider>
    </MemoryRouter>
  )
}

describe('AdminQuotesPage', () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
    mockedFetchQuotes.mockReset()
    mockedUpdateQuoteStatus.mockReset()
  })

  it('redirects to /admin/login when not authenticated', async () => {
    // No token set → isAuthenticated is false
    render(
      <MemoryRouter>
        <AdminProvider>
          <AdminQuotesPage />
        </AdminProvider>
      </MemoryRouter>
    )
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin/login'))
  })

  it('loads and displays quotes on mount', async () => {
    mockedFetchQuotes.mockResolvedValueOnce([makeQuote()])
    renderPage()

    expect(await screen.findByText('Juan Pérez')).toBeInTheDocument()
    expect(mockedFetchQuotes).toHaveBeenCalledWith('fake-token')
  })

  it('clicking status-advance calls updateQuoteStatus with PENDING -> CONTACTED and updates the list', async () => {
    const user = userEvent.setup()
    mockedFetchQuotes.mockResolvedValueOnce([makeQuote({ status: 'PENDING' })])
    mockedUpdateQuoteStatus.mockResolvedValueOnce(makeQuote({ status: 'CONTACTED' }))
    renderPage()

    await screen.findByText('Juan Pérez')
    const advanceBtn = screen.getByRole('button', { name: 'Marcar Contactado' })
    await user.click(advanceBtn)

    await waitFor(() => {
      expect(mockedUpdateQuoteStatus).toHaveBeenCalledWith('fake-token', 'q1', 'CONTACTED')
    })
    expect(await screen.findByText('Contactado')).toBeInTheDocument()
  })

  it('closing a quote (CONTACTED -> CLOSED) is gated behind window.confirm: confirmed proceeds', async () => {
    const user = userEvent.setup()
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)
    mockedFetchQuotes.mockResolvedValueOnce([makeQuote({ status: 'CONTACTED' })])
    mockedUpdateQuoteStatus.mockResolvedValueOnce(makeQuote({ status: 'CLOSED' }))
    renderPage()

    await screen.findByText('Juan Pérez')
    await user.click(screen.getByRole('button', { name: 'Cerrar Pedido' }))

    await waitFor(() => {
      expect(mockedUpdateQuoteStatus).toHaveBeenCalledWith('fake-token', 'q1', 'CLOSED')
    })
    expect(await screen.findByText('Cerrado')).toBeInTheDocument()
    confirmSpy.mockRestore()
  })

  it('closing a quote is a no-op when window.confirm is cancelled', async () => {
    const user = userEvent.setup()
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false)
    mockedFetchQuotes.mockResolvedValueOnce([makeQuote({ status: 'CONTACTED' })])
    renderPage()

    await screen.findByText('Juan Pérez')
    await user.click(screen.getByRole('button', { name: 'Cerrar Pedido' }))

    expect(mockedUpdateQuoteStatus).not.toHaveBeenCalled()
    expect(screen.getByText('Contactado')).toBeInTheDocument()
    confirmSpy.mockRestore()
  })

  it('CLOSED quotes have no advance action button', async () => {
    mockedFetchQuotes.mockResolvedValueOnce([makeQuote({ status: 'CLOSED' })])
    renderPage()

    await screen.findByText('Juan Pérez')
    expect(screen.queryByRole('button', { name: 'Marcar Contactado' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Cerrar Pedido' })).not.toBeInTheDocument()
  })
})
