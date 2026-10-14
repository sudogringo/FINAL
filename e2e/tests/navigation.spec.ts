import { test, expect } from '@playwright/test'

test('3. deep link: /FINAL/catalogo carga directamente el catálogo', async ({ page }) => {
  const response = await page.goto('catalogo')
  expect(response?.ok()).toBe(true)
  await expect(page).toHaveURL(/\/FINAL\/catalogo$/)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Productos')
  await expect(page.getByTestId('product-card').first()).toBeVisible({ timeout: 20_000 })
})
