import { test, expect } from '@playwright/test'
import { openCatalog, addVarieties, cartDrawer } from './helpers'

test.describe('Lead-to-Sale', () => {
  test('1. catálogo: filtrar, buscar, agregar 3 variedades con presentación y ajustar cantidad en el carrito', async ({ page }) => {
    await openCatalog(page)
    const cards = page.getByTestId('product-card')
    const total = await cards.count()
    expect(total).toBeGreaterThanOrEqual(3)

    // Filtro por línea
    await page.getByRole('button', { name: /Línea Dorada/ }).click()
    const dorada = await cards.count()
    expect(dorada).toBeGreaterThan(0)
    expect(dorada).toBeLessThan(total)
    await expect(cards.first()).toContainText('Línea Dorada')
    await page.getByRole('button', { name: /^Todo/ }).click()
    await expect(cards).toHaveCount(total)

    // Búsqueda
    await page.getByLabel('Buscar producto').fill('tomate')
    const hits = await cards.count()
    expect(hits).toBeGreaterThan(0)
    expect(hits).toBeLessThanOrEqual(total)
    await page.getByLabel('Buscar producto').fill('zzz-no-existe')
    await expect(page.getByText(/No se encontraron productos/)).toBeVisible()
    await page.getByLabel('Buscar producto').fill('')
    await expect(cards).toHaveCount(total)

    // Agregar 3 variedades con presentación
    const names = await addVarieties(page, 3)

    // Carrito
    await page.getByRole('button', { name: /Ver pedido \(3 items\)/ }).click()
    const drawer = cartDrawer(page)
    const rows = drawer.getByRole('list', { name: 'Productos en el pedido' }).getByRole('listitem')
    await expect(rows).toHaveCount(3)
    for (const n of names) await expect(drawer).toContainText(n)

    // Ajustar cantidad: +1 y -1 en la primera fila
    await rows.first().getByRole('button', { name: 'Aumentar' }).click()
    await expect(rows.first()).toContainText('2')
    await expect(page.getByRole('button', { name: /Ver pedido \(4 items\)/ })).toBeVisible()
    await rows.first().getByRole('button', { name: 'Reducir' }).click()
    await expect(page.getByRole('button', { name: /Ver pedido \(3 items\)/ })).toBeVisible()
  })

  test('2. enviar cotización con datos sintéticos: UI de éxito y respuesta 201 del backend', async ({ page }) => {
    await openCatalog(page)
    const names = await addVarieties(page, 3)
    await page.getByRole('button', { name: /Ver pedido/ }).click()
    await cartDrawer(page).getByRole('button', { name: 'Solicitar Cotización' }).click()

    const dialog = page.getByRole('dialog', { name: 'Formulario de cotización' })
    for (const n of names) await expect(dialog).toContainText(n)
    const stamp = Date.now()
    await dialog.getByLabel(/Nombre completo/).fill('Cliente E2E Sintético')
    await dialog.getByLabel('Empresa').fill('Distribuidora Ejemplo E2E')
    await dialog.getByLabel('Teléfono').fill('261 555-0000')
    await dialog.getByLabel(/Email/).fill(`e2e-${stamp}@example.test`)
    await dialog.getByLabel('Localidad de entrega').fill('Godoy Cruz, Mendoza')
    await dialog.getByLabel('Notas adicionales').fill('Prueba automática E2E (dato sintético)')
    // Ley 25.326: sin aceptar el aviso de privacidad el formulario no envía.
    await dialog.getByRole('checkbox', { name: /Acepto el aviso de privacidad/ }).check()

    const [response] = await Promise.all([
      page.waitForResponse(r => r.url().endsWith('/api/quotes') && r.request().method() === 'POST'),
      dialog.getByRole('button', { name: 'Enviar Cotización' }).click(),
    ])
    expect(response.status()).toBe(201)
    const body = await response.json()
    expect(typeof body.id).toBe('string')

    // El payload enviado contiene los 3 ítems y el contacto sintético
    const sent = response.request().postDataJSON()
    expect(sent.items).toHaveLength(3)
    expect(sent.contact.email).toBe(`e2e-${stamp}@example.test`)
    expect(sent.contact.consentimiento).toMatch(/^\d{4}-\d{2}-\d{2}T/)

    await expect(dialog.getByRole('heading', { name: '¡Cotización enviada!' })).toBeVisible()
  })

  test('2b. validación: el formulario rechaza un email inválido y no llama al backend', async ({ page }) => {
    await openCatalog(page)
    await addVarieties(page, 1)
    await page.getByRole('button', { name: /Ver pedido/ }).click()
    await cartDrawer(page).getByRole('button', { name: 'Solicitar Cotización' }).click()
    const dialog = page.getByRole('dialog', { name: 'Formulario de cotización' })

    let posted = false
    page.on('request', r => { if (r.url().endsWith('/api/quotes') && r.method() === 'POST') posted = true })
    await dialog.getByLabel(/Nombre completo/).fill('Cliente E2E')
    await dialog.getByLabel(/Email/).fill('no-es-un-email')
    await dialog.getByRole('button', { name: 'Enviar Cotización' }).click()
    await expect(dialog.getByText('Email inválido')).toBeVisible()
    expect(posted).toBe(false)
  })
})
