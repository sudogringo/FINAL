// Dependency 01 -> 04 (the only inter-workflow dependency of the design): 01 persists the palette
// it extracted to a JSON file in the n8n files folder and 04 reads the latest one and uses it in
// the posts it generates. Receiver of the frontend "Publicar en redes" button
// (frontend/src/pages/admin/AdminProductsPage.tsx, triggerSocialMedia) is tested here too.
// Code nodes are run straight from the exported JSON, outside n8n.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const load = f => JSON.parse(readFileSync(new URL(`../workflows/${f}`, import.meta.url), 'utf8'))
const wf01 = load('01._Automated_Branding.json')
const wf04 = load('04._Social_Media_Content_Engine.json')
const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor
const node = (wf, name) => wf.nodes.find(n => n.name === name)
const code = (wf, name) => node(wf, name).parameters.jsCode

// ---------------------------------------------------------------- 01: persist the palette
async function preparar(json) {
  const $ = () => ({ first: () => ({ json }) })
  const ctx = { helpers: { prepareBinaryData: async (buf, name, mime) => ({ data: buf.toString('base64'), fileName: name, mimeType: mime }) } }
  return new AsyncFunction('$', code(wf01, 'Preparar Paleta (01 → 04)')).call(ctx, $)
}
const EXTRACTED = { url: 'https://sudogringo.github.io/FINAL/', primary: '#1a472a', secondary: '#c8a951', palette: ['#1a472a', '#c8a951', '#8b6914'], background: '#fff', emailHtml: '<p/>', email: 'x' }

test('01 saves the palette, url and extraction time as a JSON file', async () => {
  const [out] = await preparar(EXTRACTED)
  const saved = JSON.parse(Buffer.from(out.binary.data.data, 'base64').toString('utf8'))
  assert.deepEqual(saved.palette, ['#1a472a', '#c8a951', '#8b6914'])
  assert.equal(saved.url, EXTRACTED.url)
  assert.ok(!Number.isNaN(Date.parse(saved.extractedAt)))
  assert.equal(out.binary.data.fileName, 'brand_palette.json')
  assert.equal(out.binary.data.mimeType, 'application/json')
})

test('01 never overwrites the saved palette with an empty extraction', async () => {
  assert.deepEqual(await preparar({ ...EXTRACTED, palette: [] }), [])
  assert.deepEqual(await preparar({ ...EXTRACTED, palette: undefined }), [])
})

test('01 writes the file where 04 reads it (same absolute path) and still sends its e-mail', () => {
  const write = node(wf01, 'Guardar Paleta (archivo)')
  const read = node(wf04, 'Leer Paleta de Marca (01)')
  assert.equal(write.parameters.fileName, read.parameters.fileSelector)
  assert.match(write.parameters.fileName, /^\/home\/node\/\.n8n-files\/brand_palette\.json$/)
  const outs = wf01.connections['Extract Colors'].main[0].map(c => c.node)
  assert.deepEqual(outs, ['Preparar Paleta (01 → 04)', 'Send Email'])
  assert.deepEqual(wf01.connections['Preparar Paleta (01 → 04)'].main[0].map(c => c.node), ['Guardar Paleta (archivo)'])
})

// ---------------------------------------------------------------- 04: read and apply the palette
const BASE = { source: 'sheet', producto: 'Tomate Entero', descripcion: 'Tomate pelado en lata', imagen_url_final: 'https://picsum.photos/x', email: '', fecha: '2026-11-01', row_number: 2 }
async function aplicar(binary, base = BASE) {
  const $ = name => { assert.equal(name, 'Resolver Imagen (Unsplash)'); return { item: { json: base } } }
  const ctx = { helpers: { getBinaryDataBuffer: async () => Buffer.from(binary.data, 'base64') } }
  const $input = { item: { json: { mimeType: 'application/json' }, binary: binary.has === false ? undefined : { data: {} } } }
  return (await new AsyncFunction('$input', '$', '$itemIndex', code(wf04, 'Aplicar Paleta de Marca')).call(ctx, $input, $, 0)).json
}
const file = obj => ({ data: Buffer.from(typeof obj === 'string' ? obj : JSON.stringify(obj)).toString('base64') })
const SAVED = { url: 'https://sudogringo.github.io/FINAL/', extractedAt: '2026-10-14T10:00:00.000Z', palette: ['#112233', '#445566', '#778899'] }

test('04 takes the palette saved by 01', async () => {
  const r = await aplicar(file(SAVED))
  assert.deepEqual(r.palette, ['#112233', '#445566', '#778899'])
  assert.equal(r.palette_source, 'workflow-01')
  assert.equal(r.palette_url, SAVED.url)
  assert.equal(r.palette_extracted_at, SAVED.extractedAt)
  assert.equal(r.producto, BASE.producto)
})

test('04 follows a newer palette (no hard-coded colours)', async () => {
  const r = await aplicar(file({ ...SAVED, palette: ['#abcdef'] }))
  assert.deepEqual(r.palette, ['#abcdef'])
})

test('04 falls back to the default palette, flagged as such, when 01 never saved one', async () => {
  const r = await aplicar({ has: false })
  assert.equal(r.palette_source, 'default')
  assert.ok(r.palette.length >= 1)
})

test('04 falls back when the file is corrupt or holds invalid colours', async () => {
  assert.equal((await aplicar(file('{not json'))).palette_source, 'default')
  assert.equal((await aplicar(file({ palette: ['red'] }))).palette_source, 'default')
  assert.equal((await aplicar(file({ palette: [] }))).palette_source, 'default')
})

async function formatear(extra = {}) {
  const input = { ...BASE, hashtags: '#a #b', hashtags_array: ['#a', '#b'], plataformas: 'x', ...(await aplicar(file(SAVED))), ...extra }
  return new Function('$input', code(wf04, 'Formatear Posts'))({ item: { json: input } })
}

test('04 puts the palette colours in the three posts', async () => {
  const p = await formatear()
  for (const post of [p.post_instagram, p.post_facebook]) {
    assert.match(post, /#112233/); assert.match(post, /#445566/); assert.match(post, /#778899/)
  }
  assert.match(p.post_whatsapp, /#112233/)
})

test('04 offers an image prompt that names the palette colours', async () => {
  const p = await formatear()
  assert.match(p.imagen_prompt, /Tomate Entero/)
  assert.match(p.imagen_prompt, /#112233/)
})

test('04 keeps the existing post content and fields', async () => {
  const p = await formatear()
  assert.match(p.post_instagram, /Tomate pelado en lata/)
  assert.match(p.post_instagram, /#a #b/)
  assert.equal(p.row_number, 2)
  assert.equal(p.hashtags, '#a #b')
  assert.equal(p.palette_source, 'workflow-01')
})

test('04 reads the file between the image resolver and the hashtags, tolerating a missing file', () => {
  const read = node(wf04, 'Leer Paleta de Marca (01)')
  assert.equal(read.type, 'n8n-nodes-base.readWriteFile')
  assert.equal(read.typeVersion, 1.1)
  assert.equal(read.onError, 'continueRegularOutput')
  const to = from => wf04.connections[from].main[0].map(c => c.node)
  assert.deepEqual(to('Resolver Imagen (Unsplash)'), ['Leer Paleta de Marca (01)'])
  assert.deepEqual(to('Leer Paleta de Marca (01)'), ['Aplicar Paleta de Marca'])
  assert.deepEqual(to('Aplicar Paleta de Marca'), ['Generar Hashtags (Rule-based)'])
})

// ---------------------------------------------------------------- 04: "Publicar en redes" receiver
const validar = body => new Function('$input', code(wf04, 'Validar producto (webhook)'))({ item: { json: { headers: {}, body } } }).json
const PUBLISH = { name: 'Doble Concentrado', description: 'Concentrado de tomate', line: 'roja', tag: 'Nuevo', imageUrl: 'https://img/x.png' }

test('accepts the payload of the "Publicar en redes" button and maps it to the engine fields', () => {
  const r = validar(PUBLISH)
  assert.equal(r.valid, true)
  assert.equal(r.source, 'webhook')
  assert.equal(r.producto, 'Doble Concentrado')
  assert.equal(r.descripcion, 'Concentrado de tomate')
  assert.equal(r.imagen_url, 'https://img/x.png')
  assert.equal(r.plataformas, 'Instagram,WhatsApp Story,Facebook')
})

test('a product without description or image is still publishable (nulls become empty text)', () => {
  const r = validar({ ...PUBLISH, description: null, imageUrl: null, tag: null })
  assert.equal(r.valid, true)
  assert.equal(r.descripcion, '')
  assert.equal(r.imagen_url, '')
})

test('rejects a payload without a product name or that is not an object', () => {
  assert.equal(validar({ ...PUBLISH, name: '' }).valid, false)
  assert.equal(validar({ description: 'x' }).valid, false)
  assert.equal(validar(undefined).valid, false)
  assert.match(validar({ description: 'x' }).error, /name/)
})

test('the webhook receiver is enabled on /social-content and answers before the engine runs', () => {
  const hook = wf04.nodes.find(n => n.type === 'n8n-nodes-base.webhook' && !n.disabled)
  assert.equal(hook.parameters.path, 'social-content')
  assert.equal(hook.parameters.responseMode, 'responseNode')
  const to = from => wf04.connections[from].main.map(o => o.map(c => c.node))
  assert.deepEqual(to(hook.name), [['Validar producto (webhook)']])
  assert.deepEqual(to('Validar producto (webhook)'), [['¿Producto válido?']])
  assert.deepEqual(to('¿Producto válido?'), [['Responder 202 (producto recibido)'], ['Responder 400 (producto inválido)']])
  assert.deepEqual(to('Responder 202 (producto recibido)'), [['Resolver Imagen (Unsplash)']])
})

test('webhook posts are e-mailed (not written to the content sheet): only sheet rows are written back', () => {
  const cond = node(wf04, '¿Enviar email o escribir sheet?').parameters.conditions.conditions[0]
  assert.equal(cond.rightValue, 'sheet')
  assert.equal(cond.operator.operation, 'notEquals')
})
