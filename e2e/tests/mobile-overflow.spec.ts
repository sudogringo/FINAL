import { test, expect } from '@playwright/test'

test.use({ viewport: { width: 390, height: 844 } })

for (const [name, path] of [['home', ''], ['catálogo', 'catalogo']] as const) {
  test(`5. sin desborde horizontal a 390 px: "${name}"`, async ({ page }) => {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    )
    expect(overflow).toBe(0)
  })
}
