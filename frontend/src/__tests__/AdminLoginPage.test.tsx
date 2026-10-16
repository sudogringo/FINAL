import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminLoginPage from '../pages/admin/AdminLoginPage'
import { AdminProvider } from '../features/admin/AdminContext'
import { adminLogin } from '../features/admin/api'
import { HttpError } from '../lib/fetchWithRetry'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('../features/admin/api', () => ({
  adminLogin: jest.fn(),
}))

const mockedAdminLogin = adminLogin as jest.MockedFunction<typeof adminLogin>

function renderPage() {
  return render(
    <MemoryRouter>
      <AdminProvider>
        <AdminLoginPage />
      </AdminProvider>
    </MemoryRouter>
  )
}

describe('AdminLoginPage', () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
    mockedAdminLogin.mockReset()
  })

  it('calls adminLogin with entered email/password on submit', async () => {
    const user = userEvent.setup()
    mockedAdminLogin.mockResolvedValueOnce('fake-token')
    renderPage()

    await user.type(screen.getByPlaceholderText('admin@goldenharvest.com'), 'admin@goldenharvest.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'secret123')
    await user.click(screen.getByRole('button', { name: /Ingresar/i }))

    await waitFor(() => {
      expect(mockedAdminLogin).toHaveBeenCalledWith('admin@goldenharvest.com', 'secret123', expect.any(AbortSignal))
    })
  })

  it('success path stores the token and navigates away from login', async () => {
    const user = userEvent.setup()
    mockedAdminLogin.mockResolvedValueOnce('fake-token')
    renderPage()

    await user.type(screen.getByPlaceholderText('admin@goldenharvest.com'), 'admin@goldenharvest.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'secret123')
    await user.click(screen.getByRole('button', { name: /Ingresar/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/admin/productos')
    })
    expect(localStorage.getItem('gh_admin_token')).toBe('fake-token')
  })

  it('failure path shows the Spanish error message and does not navigate', async () => {
    const user = userEvent.setup()
    mockedAdminLogin.mockRejectedValueOnce(new HttpError(401, 'Credenciales incorrectas'))
    renderPage()

    await user.type(screen.getByPlaceholderText('admin@goldenharvest.com'), 'admin@goldenharvest.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /Ingresar/i }))

    expect(await screen.findByText('Email o contraseña incorrectos')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(localStorage.getItem('gh_admin_token')).toBeNull()
  })

  it('treats a 400 (missing fields) as a credentials error, without retrying', async () => {
    const user = userEvent.setup()
    mockedAdminLogin.mockRejectedValueOnce(new HttpError(400, 'Email y contraseña requeridos'))
    renderPage()

    await submit(user, 'secret123')

    expect(await screen.findByText('Email o contraseña incorrectos')).toBeInTheDocument()
    expect(mockedAdminLogin).toHaveBeenCalledTimes(1)
  })

  it('retries a network failure (cold start) and logs in when the server answers', async () => {
    const user = userEvent.setup()
    mockedAdminLogin
      .mockRejectedValueOnce(new TypeError('Failed to fetch'))
      .mockResolvedValueOnce('fake-token')
    renderPage()

    await submit(user, 'secret123')

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin/productos'), { timeout: 4000 })
    expect(mockedAdminLogin).toHaveBeenCalledTimes(2)
    expect(screen.queryByText('Email o contraseña incorrectos')).not.toBeInTheDocument()
  })

  it('tells the user the server is waking up while the login is still pending', async () => {
    const user = userEvent.setup()
    mockedAdminLogin.mockReturnValue(new Promise(() => {}))
    renderPage()

    await submit(user, 'secret123')

    expect(await screen.findByText(/servidor se está iniciando/i, {}, { timeout: 6000 })).toBeInTheDocument()
  }, 10000)

  it('shows a server error, not a credentials error, when the server fails', async () => {
    const user = userEvent.setup()
    mockedAdminLogin.mockRejectedValueOnce(new HttpError(429, 'Too Many Requests'))
    renderPage()

    await submit(user, 'secret123')

    expect(await screen.findByText(/No se pudo conectar con el servidor/i)).toBeInTheDocument()
    expect(screen.queryByText('Email o contraseña incorrectos')).not.toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })
})

async function submit(user: ReturnType<typeof userEvent.setup>, password: string) {
  await user.type(screen.getByPlaceholderText('admin@goldenharvest.com'), 'admin@goldenharvest.com')
  await user.type(screen.getByPlaceholderText('••••••••'), password)
  await user.click(screen.getByRole('button', { name: /Ingresar/i }))
}
