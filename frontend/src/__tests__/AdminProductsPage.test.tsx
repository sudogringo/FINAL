import '@testing-library/jest-dom'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AdminProductsPage from '../pages/admin/AdminProductsPage'
import { AdminProvider } from '../features/admin/AdminContext'
import {
  fetchAllProductsAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  type ApiProduct,
} from '../features/admin/api'

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

jest.mock('../features/admin/api', () => ({
  fetchAllProductsAdmin: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  deleteProduct: jest.fn(),
  uploadImage: jest.fn(),
}))

const mockedFetchAll = fetchAllProductsAdmin as jest.MockedFunction<typeof fetchAllProductsAdmin>
const mockedCreate = createProduct as jest.MockedFunction<typeof createProduct>
const mockedUpdate = updateProduct as jest.MockedFunction<typeof updateProduct>
const mockedDelete = deleteProduct as jest.MockedFunction<typeof deleteProduct>

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

const THREE_PRODUCTS: ApiProduct[] = [
  makeProduct({ id: 'p1', name: 'Tomate Entero Pelado', line: 'roja', active: true }),
  makeProduct({ id: 'p2', name: 'Durazno en Almíbar', line: 'dorada', active: true }),
  makeProduct({ id: 'p3', name: 'Salsa de Tomate', line: 'roja', active: false }),
]

function renderPage() {
  localStorage.setItem(STORAGE_KEY, 'fake-token')
  return render(
    <MemoryRouter>
      <AdminProvider>
        <AdminProductsPage />
      </AdminProvider>
    </MemoryRouter>
  )
}

describe('AdminProductsPage', () => {
  const originalEnv = { ...import.meta.env }

  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
    mockedFetchAll.mockReset()
    mockedCreate.mockReset()
    mockedUpdate.mockReset()
    mockedDelete.mockReset()
    global.fetch = jest.fn()
  })

  afterEach(() => {
    Object.assign(import.meta.env, originalEnv)
    jest.restoreAllMocks()
  })

  it('redirects to /admin/login when not authenticated', async () => {
    render(
      <MemoryRouter>
        <AdminProvider>
          <AdminProductsPage />
        </AdminProvider>
      </MemoryRouter>
    )
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin/login'))
  })

  it('loads and displays products on mount (active filter default)', async () => {
    mockedFetchAll.mockResolvedValueOnce(THREE_PRODUCTS)
    renderPage()

    expect(await screen.findByText('Tomate Entero Pelado')).toBeInTheDocument()
    expect(screen.getByText('Durazno en Almíbar')).toBeInTheDocument()
    // p3 is inactive, default filter is 'active' so it should be hidden
    expect(screen.queryByText('Salsa de Tomate')).not.toBeInTheDocument()
  })

  describe('handleSave', () => {
    it('create branch: opens empty modal via "Nuevo producto" and calls createProduct (no id)', async () => {
      const user = userEvent.setup()
      mockedFetchAll.mockResolvedValue(THREE_PRODUCTS)
      mockedCreate.mockResolvedValueOnce(makeProduct({ id: 'new1', name: 'Nuevo Producto' }))
      renderPage()

      await screen.findByText('Tomate Entero Pelado')
      await user.click(screen.getByRole('button', { name: /Nuevo producto/i }))

      expect(await screen.findByRole('heading', { name: 'Nuevo producto' })).toBeInTheDocument()
      await user.type(screen.getByPlaceholderText('Tomate Entero Pelado'), 'Nuevo Producto')
      await user.type(screen.getByPlaceholderText('Descripción del producto...'), 'Una descripción')
      await user.type(screen.getByPlaceholderText('250g, 1kg, 4kg'), '1kg')

      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      await waitFor(() => {
        expect(mockedCreate).toHaveBeenCalledWith(
          'fake-token',
          expect.objectContaining({ name: 'Nuevo Producto', sizes: ['1kg'] })
        )
      })
      expect(mockedUpdate).not.toHaveBeenCalled()
    })

    it('edit branch: opens modal via edit pencil (with id) and calls updateProduct with existing id', async () => {
      const user = userEvent.setup()
      mockedFetchAll.mockResolvedValue(THREE_PRODUCTS)
      mockedUpdate.mockResolvedValueOnce(makeProduct({ id: 'p1', name: 'Tomate Editado' }))
      renderPage()

      await screen.findByText('Tomate Entero Pelado')
      await user.click(screen.getByRole('button', { name: 'Editar Tomate Entero Pelado' }))

      expect(await screen.findByText('Editar producto')).toBeInTheDocument()
      const nameInput = screen.getByDisplayValue('Tomate Entero Pelado')
      await user.clear(nameInput)
      await user.type(nameInput, 'Tomate Editado')

      await user.click(screen.getByRole('button', { name: 'Guardar' }))

      await waitFor(() => {
        expect(mockedUpdate).toHaveBeenCalledWith(
          'fake-token',
          'p1',
          expect.objectContaining({ name: 'Tomate Editado' })
        )
      })
      expect(mockedCreate).not.toHaveBeenCalled()
    })
  })

  describe('handleDelete', () => {
    it('proceeds when window.confirm returns true', async () => {
      const user = userEvent.setup()
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)
      mockedFetchAll.mockResolvedValue(THREE_PRODUCTS)
      mockedDelete.mockResolvedValueOnce(undefined)
      renderPage()

      await screen.findByText('Tomate Entero Pelado')
      await user.click(screen.getByRole('button', { name: 'Desactivar Tomate Entero Pelado' }))

      await waitFor(() => {
        expect(mockedDelete).toHaveBeenCalledWith('fake-token', 'p1')
      })
      confirmSpy.mockRestore()
    })

    it('is a no-op when window.confirm returns false', async () => {
      const user = userEvent.setup()
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(false)
      mockedFetchAll.mockResolvedValue(THREE_PRODUCTS)
      renderPage()

      await screen.findByText('Tomate Entero Pelado')
      await user.click(screen.getByRole('button', { name: 'Desactivar Tomate Entero Pelado' }))

      expect(mockedDelete).not.toHaveBeenCalled()
      confirmSpy.mockRestore()
    })
  })

  describe('handleRestore', () => {
    it('calls updateProduct with active: true for an inactive product', async () => {
      const user = userEvent.setup()
      mockedFetchAll.mockResolvedValue(THREE_PRODUCTS)
      mockedUpdate.mockResolvedValueOnce(makeProduct({ id: 'p3', active: true }))
      renderPage()

      // switch to a filter that shows inactive products
      await screen.findByText('Tomate Entero Pelado')
      await user.click(screen.getByRole('button', { name: /Todos/i }))

      const restoreBtn = await screen.findByRole('button', { name: 'Restaurar Salsa de Tomate' })
      await user.click(restoreBtn)

      await waitFor(() => {
        expect(mockedUpdate).toHaveBeenCalledWith('fake-token', 'p3', { active: true })
      })
    })
  })

  describe('search / line / status filters', () => {
    it('search input narrows the list by name', async () => {
      const user = userEvent.setup()
      mockedFetchAll.mockResolvedValue(THREE_PRODUCTS)
      renderPage()

      await screen.findByText('Tomate Entero Pelado')
      await user.type(screen.getByPlaceholderText(/Buscar por nombre/i), 'durazno')

      expect(screen.queryByText('Tomate Entero Pelado')).not.toBeInTheDocument()
      expect(screen.getByText('Durazno en Almíbar')).toBeInTheDocument()
    })

    it('line filter narrows the list to "roja" only', async () => {
      const user = userEvent.setup()
      mockedFetchAll.mockResolvedValue(THREE_PRODUCTS)
      renderPage()

      await screen.findByText('Tomate Entero Pelado')
      await user.click(screen.getByRole('button', { name: 'Línea Roja' }))

      expect(screen.getByText('Tomate Entero Pelado')).toBeInTheDocument()
      expect(screen.queryByText('Durazno en Almíbar')).not.toBeInTheDocument()
    })

    it('status filter "all" reveals inactive products, combined with line filter "roja"', async () => {
      const user = userEvent.setup()
      mockedFetchAll.mockResolvedValue(THREE_PRODUCTS)
      renderPage()

      await screen.findByText('Tomate Entero Pelado')
      await user.click(screen.getByRole('button', { name: /Todos/i }))
      await user.click(screen.getByRole('button', { name: 'Línea Roja' }))

      // Both roja products should show (active Tomate + inactive Salsa), dorada Durazno hidden
      expect(screen.getByText('Tomate Entero Pelado')).toBeInTheDocument()
      expect(screen.getByText('Salsa de Tomate')).toBeInTheDocument()
      expect(screen.queryByText('Durazno en Almíbar')).not.toBeInTheDocument()
    })
  })

  describe('triggerSocialMedia (via "Publicar en redes" button)', () => {
    // WF4_WEBHOOK is read from import.meta.env once at module load time, so to exercise
    // both branches we must reset the module registry and re-import with the env var set
    // beforehand — mutating import.meta.env after import has no effect on the bound const.
    // The "webhook configured" branch is covered in AdminProductsPage.webhookConfigured.test.tsx:
    // WF4_WEBHOOK is read from import.meta.env (compiled to process.env by
    // babel-plugin-transform-vite-meta-env) once at module import time, so it can only be
    // exercised by setting process.env.VITE_N8N_WF4_WEBHOOK before this module is first
    // imported anywhere in the process — which requires a dedicated test file (Jest gives
    // each test file its own fresh module registry) rather than a jest.resetModules() dance
    // inside this file, which was found to duplicate the React/react-dom instances used by
    // the already-rendered tree above and throw "invalid hook call".

    it('calls window.alert when the webhook env var is unset/empty', async () => {
      // AdminProductsPage reads WF4_WEBHOOK once at module load, defaulting to '' when unset.
      // Since it's already unset in this test env, no need to delete/mutate.
      const user = userEvent.setup()
      const confirmSpy = jest.spyOn(window, 'confirm').mockReturnValue(true)
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {})
      mockedFetchAll.mockResolvedValue(THREE_PRODUCTS)
      renderPage()

      await screen.findByText('Tomate Entero Pelado')
      await user.click(screen.getByRole('button', { name: 'Publicar Tomate Entero Pelado en redes' }))

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('Variable VITE_N8N_WF4_WEBHOOK no configurada')
      })
      expect(global.fetch).not.toHaveBeenCalled()

      confirmSpy.mockRestore()
      alertSpy.mockRestore()
    })
  })
})
