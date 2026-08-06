import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { authRouter } from './routes/auth'
import { productsRouter } from './routes/products'
import { quotesRouter } from './routes/quotes'
import { uploadRouter } from './routes/upload'
import { customersRouter } from './routes/customers'
import { ordersRouter } from './routes/orders'
import { interactionsRouter } from './routes/interactions'
import { statsRouter } from './routes/stats'

const app = express()
const PORT = process.env.PORT ?? 3001

app.use(cors({ origin: /^http:\/\/localhost:\d+$/ }))
app.use(express.json())
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/products', productsRouter)
app.use('/api/quotes', quotesRouter)
app.use('/api/upload', uploadRouter)
app.use('/api/customers', customersRouter)
app.use('/api/orders', ordersRouter)
app.use('/api/interactions', interactionsRouter)
app.use('/api/stats', statsRouter)

app.listen(PORT, () => {
  console.log(`Golden Harvest API corriendo en http://localhost:${PORT}`)
})
