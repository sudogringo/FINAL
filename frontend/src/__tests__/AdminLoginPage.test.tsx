import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminLoginPage from '../pages/admin/AdminLoginPage'
import { AdminProvider } from '../features/admin/AdminContext'
import { adminLogin } from '../features/admin/api'

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
      expect(mockedAdminLogin).toHaveBeenCalledWith('admin@goldenharvest.com', 'secret123')
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
    mockedAdminLogin.mockRejectedValueOnce(new Error('Credenciales incorrectas'))
    renderPage()

    await user.type(screen.getByPlaceholderText('admin@goldenharvest.com'), 'admin@goldenharvest.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'wrongpass')
    await user.click(screen.getByRole('button', { name: /Ingresar/i }))

    expect(await screen.findByText('Email o contraseña incorrectos')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
    expect(localStorage.getItem('gh_admin_token')).toBeNull()
  })
})
