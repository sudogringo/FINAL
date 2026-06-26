const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'

export interface ApiProduct {
  id: string
  name: string
  line: 'roja' | 'dorada'
  description: string
  sizes: string[]
  tag: string | null
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface ProductInput {
  name: string
  line: 'roja' | 'dorada'
  description: string
  sizes: string[]
  tag?: string
  active?: boolean
}

function authHeaders(token: string) {
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
}

export async function fetchProducts(): Promise<ApiProduct[]> {
  const res = await fetch(`${BASE}/api/products`)
  if (!res.ok) throw new Error('Error al obtener productos')
  return res.json()
}

export async function fetchAllProductsAdmin(token: string): Promise<ApiProduct[]> {
  const res = await fetch(`${BASE}/api/products/admin/all`, { headers: authHeaders(token) })
  if (!res.ok) throw new Error('Error al obtener productos')
  return res.json()
}

export async function createProduct(token: string, data: ProductInput): Promise<ApiProduct> {
  const res = await fetch(`${BASE}/api/products/admin`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al crear producto')
  return res.json()
}

export async function updateProduct(token: string, id: string, data: Partial<ProductInput>): Promise<ApiProduct> {
  const res = await fetch(`${BASE}/api/products/admin/${id}`, {
    method: 'PUT',
    headers: authHeaders(token),
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al actualizar producto')
  return res.json()
}

export async function deleteProduct(token: string, id: string): Promise<void> {
  const res = await fetch(`${BASE}/api/products/admin/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  })
  if (!res.ok) throw new Error('Error al eliminar producto')
}

export async function adminLogin(email: string, password: string): Promise<string> {
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Credenciales incorrectas')
  const data = await res.json()
  return data.token
}

export async function submitQuote(payload: {
  sessionId: string
  contact: Record<string, string>
  items: Array<{ id: string; name: string; line: string; size: string; qty: number }>
}): Promise<{ id: string }> {
  const res = await fetch(`${BASE}/api/quotes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('Error al enviar cotización')
  return res.json()
}
