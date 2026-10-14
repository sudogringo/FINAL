/**
 * GitHub Pages SPA deep links: public/404.html encodes the requested path into the
 * query string and redirects to /FINAL/; the script in index.html decodes it and
 * restores the real URL with history.replaceState. These tests execute the REAL inline
 * scripts (extracted from the HTML files) against a fake `window.location`, so the
 * round trip is verified without a browser.
 */
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'

const read = (rel: string) => fs.readFileSync(path.resolve(__dirname, '../..', rel), 'utf8')
const inlineScript = (html: string) => {
  const m = html.match(/<script type="text\/javascript">([\s\S]*?)<\/script>/)
  if (!m) throw new Error('inline script not found')
  return m[1]
}

interface Loc { protocol: string; hostname: string; port: string; pathname: string; search: string; hash: string }
function parse(url: string): Loc {
  const u = new URL(url)
  return { protocol: u.protocol, hostname: u.hostname, port: u.port, pathname: u.pathname, search: u.search, hash: u.hash }
}

/** Runs public/404.html for a requested URL and returns the URL it redirects to. */
function run404(url: string): string {
  let target = ''
  const location = { ...parse(url), replace: (u: string) => { target = u } }
  vm.runInNewContext(inlineScript(read('public/404.html')), { window: { location }, location })
  return target
}

/** Runs index.html's restore script at a URL and returns the URL passed to replaceState. */
function runIndex(url: string): string | null {
  let restored: string | null = null
  const location = parse(url)
  const history = { replaceState: (_s: unknown, _t: unknown, u: string) => { restored = u } }
  vm.runInNewContext(inlineScript(read('index.html')), { window: { location, history }, location })
  return restored
}

describe('GitHub Pages SPA fallback (404.html -> index.html)', () => {
  it('404.html turns /FINAL/catalogo into /FINAL/?/catalogo', () => {
    expect(run404('https://sudogringo.github.io/FINAL/catalogo'))
      .toBe('https://sudogringo.github.io/FINAL/?/catalogo')
  })

  it('index.html restores /FINAL/?/catalogo to /FINAL/catalogo', () => {
    expect(runIndex('https://sudogringo.github.io/FINAL/?/catalogo')).toBe('/FINAL/catalogo')
  })

  it('round-trips nested paths, query strings and hashes', () => {
    const redirected = run404('https://sudogringo.github.io/FINAL/admin/productos?x=1&y=2#top')
    expect(redirected).toBe('https://sudogringo.github.io/FINAL/?/admin/productos&x=1~and~y=2#top')
    expect(runIndex(redirected)).toBe('/FINAL/admin/productos?x=1&y=2#top')
  })

  it('does nothing on a normal load of /FINAL/ (no encoded path)', () => {
    expect(runIndex('https://sudogringo.github.io/FINAL/')).toBeNull()
  })
})
