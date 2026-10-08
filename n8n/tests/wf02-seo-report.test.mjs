// Runs the "Generar Reporte SEO" Code node of workflow 02 outside n8n, straight
// from the exported JSON, and checks what the PSI nodes ask PageSpeed for.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const wf = JSON.parse(readFileSync(new URL('../workflows/02._Website_Health_SEO_Monitor.json', import.meta.url), 'utf8'))
const byName = name => wf.nodes.find(n => n.name === name)
const report = byName('Generar Reporte SEO')

function run(mobile, desktop) {
  const $input = { all: () => [{ json: mobile }, { json: desktop }] }
  return new Function('$input', report.parameters.jsCode)($input)[0].json
}

const psi = cats => ({
  lighthouseResult: {
    categories: Object.fromEntries(Object.entries(cats).map(([k, s]) => [k, { score: s }])),
    audits: { 'largest-contentful-paint': { displayValue: '2.7 s' } },
  },
})
const FULL = psi({ performance: 0.92, accessibility: 0.83, 'best-practices': 1, seo: 1 })

test('reports the four categories when PageSpeed returns them', () => {
  const r = run(FULL, psi({ performance: 0.98, accessibility: 0.83, 'best-practices': 1, seo: 1 }))
  assert.equal(r.mobileScore, 92)
  assert.equal(r.desktopScore, 98)
  assert.equal(r.mobileAccess, 83)
  assert.equal(r.desktopSEO, 100)
})

test('a category PageSpeed did not return is reported as missing, never as 0/100', () => {
  const r = run(psi({ performance: 0.92 }), psi({ performance: 0.69 }))
  assert.equal(r.mobileAccess, null)
  assert.equal(r.desktopBP, null)
  assert.doesNotMatch(r.htmlEmail, /0\/100/)
  assert.match(r.htmlEmail, /N\/D/)
})

test('a missing performance score does not raise a false alert by counting as 0', () => {
  const r = run(psi({}), psi({ performance: 0.95 }))
  assert.equal(r.mobileScore, null)
  assert.equal(r.alerta, false)
})

test('alerts when a measured performance score is below 80', () => {
  const r = run(FULL, psi({ performance: 0.69, accessibility: 0.83, 'best-practices': 1, seo: 1 }))
  assert.equal(r.alerta, true)
})

for (const name of ['PSI Mobile', 'PSI Desktop']) {
  test(`${name} asks PageSpeed for the four Lighthouse categories`, () => {
    const url = new URL(byName(name).parameters.url)
    assert.deepEqual(url.searchParams.getAll('category').sort(), ['ACCESSIBILITY', 'BEST_PRACTICES', 'PERFORMANCE', 'SEO'])
  })
}
