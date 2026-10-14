import { resolveApiUrl } from '../config'

describe('resolveApiUrl', () => {
  it('uses the build-time VITE_API_URL when set (trailing slash trimmed)', () => {
    expect(resolveApiUrl('https://api.example.test/', true)).toBe('https://api.example.test')
    expect(resolveApiUrl('https://api.example.test', false)).toBe('https://api.example.test')
  })

  it('falls back to localhost in dev / test', () => {
    expect(resolveApiUrl(undefined, false)).toBe('http://localhost:3001')
  })

  it('has NO fallback in a production build: empty string means "backend not configured"', () => {
    expect(resolveApiUrl(undefined, true)).toBe('')
    expect(resolveApiUrl('', true)).toBe('')
  })
})
