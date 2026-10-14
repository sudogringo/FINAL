import { expect, type Page } from '@playwright/test'

/** Opens /catalogo and waits for the real catalog (products from the backend API). */
export async function openCatalog(page: Page) {
  await page.goto('catalogo')
  await expect(page.getByTestId('product-card').first()).toBeVisible({ timeout: 20_000 })
}

/** Adds the first `n` products with their SECOND presentation (when they have one). */
export async function addVarieties(page: Page, n: number) {
  const cards = page.getByTestId('product-card')
  expect(await cards.count()).toBeGreaterThanOrEqual(n)
  const names: string[] = []
  for (let i = 0; i < n; i++) {
    const card = cards.nth(i)
    names.push((await card.getByRole('heading', { level: 2 }).textContent())!.trim())
    const sizes = card.locator('button[aria-pressed]')
    if ((await sizes.count()) > 1) await sizes.nth(1).click()
    await card.getByTestId('add-to-cart').click()
  }
  return names
}

export const cartDrawer = (page: Page) => page.getByRole('complementary', { name: 'Carrito de pedido' })
