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
import { healthRouter } from './routes/health'
import { webhookDeliveriesRouter } from './routes/webhookDeliveries'
import { corsOrigin } from './middleware/cors'
import { startDispatcher } from './webhooks/dispatcher'
import { dispatcherDeps } from './webhooks/runtime'
import { catchAsyncErrors, errorHandler } from './middleware/errors'

const app = express()
const PORT = process.env.PORT ?? 3001

// Detrás del proxy de Render: req.ip debe ser la IP real del cliente (rate limit).
if (process.env.NODE_ENV === 'production') app.set('trust proxy', 1)

app.use(cors({ origin: corsOrigin(process.env) }))
app.use(express.json())
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.get('/health', (_req, res) => res.json({ ok: true }))
app.use('/api/health', catchAsyncErrors(healthRouter))
app.use('/api/auth', catchAsyncErrors(authRouter))
app.use('/api/products', catchAsyncErrors(productsRouter))
app.use('/api/quotes', catchAsyncErrors(quotesRouter))
app.use('/api/upload', catchAsyncErrors(uploadRouter))
app.use('/api/customers', catchAsyncErrors(customersRouter))
app.use('/api/orders', catchAsyncErrors(ordersRouter))
app.use('/api/interactions', catchAsyncErrors(interactionsRouter))
app.use('/api/stats', catchAsyncErrors(statsRouter))
app.use('/api/webhook-deliveries', catchAsyncErrors(webhookDeliveriesRouter))
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Golden Harvest API corriendo en http://localhost:${PORT}`)
})

// Worker del outbox: entrega los webhooks pendientes hacia n8n con reintentos.
startDispatcher(dispatcherDeps)
