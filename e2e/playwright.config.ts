import { defineConfig, devices } from '@playwright/test'

const API_URL = process.env.E2E_API_URL ?? 'http://localhost:3001'
const PORT = Number(process.env.E2E_PORT ?? 4180)

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: `http://localhost:${PORT}/FINAL/`,
    headless: true,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Production build of the frontend (the same artifact GitHub Pages serves) pointed
  // at the local backend, served by `vite preview`.
  webServer: {
    command: `npm --prefix ../frontend run build && npm --prefix ../frontend run preview -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}/FINAL/`,
    reuseExistingServer: false,
    timeout: 180_000,
    env: { VITE_API_URL: API_URL },
  },
})
