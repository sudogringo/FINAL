import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AdminProvider } from '../features/admin/AdminContext'
import type { ApiProduct } from '../features/admin/api'

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}))

jest.mock('../features/admin/api', () => ({
  fetchAllProductsAdmin: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
  uploadImage: jest.fn(),
}))

// AdminProductsPage reads VITE_N8N_WF4_WEBHOOK from import.meta.env (compiled by
// babel-plugin-transform-vite-meta-env to process.env) once at module import time. Static
// `import` statements are hoisted above ordinary statements by ESM/Babel semantics, so setting
// process.env here and then statically importing the page would silently run the import first.
// Using require() (not hoisted) after setting the env var guarantees ordering.
process.env.VITE_N8N_WF4_WEBHOOK = 'https://n8n.example.com/webhook/wf4'
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AdminProductsPage = require('../pages/admin/AdminProductsPage').default as typeof import('../pages/admin/AdminProductsPage').default

import { fetchAllProductsAdmin } from '../features/admin/api'

const mockedFetchAll = fetchAllProductsAdmin as jest.MockedFunction<typeof fetchAllProductsAdmin>

const STORAGE_KEY = 'gh_admin_token'

function makeProduct(overrides: Partial<ApiProduct> = {}): ApiProduct {
  return {
    id: 'p1',
    name: 'Tomate Entero Pelado',
    line: 'roja',
    description: 'Tomate clásico',
    sizes: ['1kg'],
    tag: null,
    stockBySize: { '1kg': 50 },
    imageUrl: null,
    active: true,
    createdAt: new Date('2026-01-01').toISOString(),
    updatedAt: new Date('2026-01-01').toISOString(),
    ...overrides,
  }
}

describe('AdminProductsPage — triggerSocialMedia with VITE_N8N_WF4_WEBHOOK configured', () => {
  beforeEach(() => {
    localStorage.clear()
    mockedFetchAll.mockReset()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('POSTs to the configured webhook and shows the success alert', async () => {
    const user = userEvent.setup()
    const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({ ok: true })
    mockedFetchAll.mockResolvedValueOnce([makeProduct()])

    localStorage.setItem(STORAGE_KEY, 'fake-token')
    render(
      <MemoryRouter>
        <AdminProvider>
          <AdminProductsPage />
        </AdminProvider>
      </MemoryRouter>
    )

    await screen.findByText('Tomate Entero Pelado')
    await user.click(screen.getByRole('button', { name: 'Publicar Tomate Entero Pelado en redes' }))

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        'https://n8n.example.com/webhook/wf4',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Tomate Entero Pelado',
            description: 'Tomate clásico',
            line: 'roja',
            tag: null,
            imageUrl: null,
          }),
        })
      )
    })
    expect(alertSpy).toHaveBeenCalledWith('¡Workflow disparado! n8n generará el contenido para redes.')

    confirmSpy.mockRestore()
    alertSpy.mockRestore()
  })
})
