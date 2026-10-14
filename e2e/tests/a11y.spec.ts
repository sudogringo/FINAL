import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

for (const [name, path] of [['home', ''], ['catálogo', 'catalogo']] as const) {
  test(`4. accesibilidad (axe): "${name}" sin violaciones serious/critical`, async ({ page }) => {
    await page.goto(path)
    if (path === 'catalogo') await expect(page.getByTestId('product-card').first()).toBeVisible({ timeout: 20_000 })
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const blocking = results.violations.filter(v => v.impact === 'serious' || v.impact === 'critical')
    expect(blocking.map(v => `${v.id}: ${v.nodes.length} nodo(s)`)).toEqual([])
  })
}
