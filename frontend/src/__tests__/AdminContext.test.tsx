import '@testing-library/jest-dom'
import { render, screen, fireEvent } from '@testing-library/react'
import { AdminProvider, useAdmin } from '../features/admin/AdminContext'

const STORAGE_KEY = 'gh_admin_token'

function Harness() {
  const { token, login, logout, isAuthenticated } = useAdmin()
  return (
    <div>
      <p data-testid="token">{token ?? 'null'}</p>
      <p data-testid="auth">{String(isAuthenticated)}</p>
      <button onClick={() => login('abc123')}>Login</button>
      <button onClick={() => logout()}>Logout</button>
    </div>
  )
}

function renderHarness() {
  return render(
    <AdminProvider>
      <Harness />
    </AdminProvider>
  )
}

describe('AdminContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('starts unauthenticated with no token when localStorage is empty', () => {
    renderHarness()
    expect(screen.getByTestId('token')).toHaveTextContent('null')
    expect(screen.getByTestId('auth')).toHaveTextContent('false')
  })

  it('initializes token from localStorage if present', () => {
    localStorage.setItem(STORAGE_KEY, 'preexisting-token')
    renderHarness()
    expect(screen.getByTestId('token')).toHaveTextContent('preexisting-token')
    expect(screen.getByTestId('auth')).toHaveTextContent('true')
  })

  it('login persists token to localStorage and flips isAuthenticated to true', () => {
    renderHarness()
    fireEvent.click(screen.getByText('Login'))
    expect(screen.getByTestId('token')).toHaveTextContent('abc123')
    expect(screen.getByTestId('auth')).toHaveTextContent('true')
    expect(localStorage.getItem(STORAGE_KEY)).toBe('abc123')
  })

  it('logout clears localStorage and flips isAuthenticated to false', () => {
    renderHarness()
    fireEvent.click(screen.getByText('Login'))
    expect(localStorage.getItem(STORAGE_KEY)).toBe('abc123')

    fireEvent.click(screen.getByText('Logout'))
    expect(screen.getByTestId('token')).toHaveTextContent('null')
    expect(screen.getByTestId('auth')).toHaveTextContent('false')
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('useAdmin throws when used outside AdminProvider', () => {
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    expect(() => render(<Harness />)).toThrow('useAdmin debe usarse dentro de AdminProvider')
    spy.mockRestore()
  })
})
