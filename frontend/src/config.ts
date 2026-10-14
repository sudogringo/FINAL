export const N8N_QUOTE_WEBHOOK     = import.meta.env.VITE_N8N_QUOTE_WEBHOOK     ?? ''
export const N8N_ABANDONED_WEBHOOK = import.meta.env.VITE_N8N_ABANDONED_WEBHOOK ?? ''

/**
 * Backend base URL. Taken from the build-time variable VITE_API_URL (a public URL,
 * set in the GitHub Actions workflow). The localhost fallback exists ONLY for dev/test:
 * a production build without the variable yields '' ("backend not configured"), so the
 * published site degrades to a "catálogo no disponible" state instead of calling
 * localhost from a visitor's browser.
 */
export function resolveApiUrl(envUrl: string | undefined, isProd: boolean): string {
  if (envUrl) return envUrl.replace(/\/+$/, '')
  return isProd ? '' : 'http://localhost:3001'
}

export const API_URL = resolveApiUrl(import.meta.env.VITE_API_URL, import.meta.env.PROD)
