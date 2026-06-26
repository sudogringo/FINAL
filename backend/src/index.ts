import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { authRouter } from './routes/auth'
import { productsRouter } from './routes/products'
import { quotesRouter } from './routes/quotes'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: process.env.FRONTEND_URL ?? 'http://localhost:5173' }))
app.use(express.json())

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/quotes', quotesRouter)

app.listen(PORT, () => {
  console.log(`Golden Harvest API corriendo en http://localhost:${PORT}`)
})
