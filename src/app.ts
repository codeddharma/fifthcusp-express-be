import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import mongoSanitize from 'express-mongo-sanitize'
import hpp from 'hpp'
import compression from 'compression'
import morgan from 'morgan'

import env from './config/env'
import v1Router from './routes/v1/index'
import { globalRateLimiter, speedLimiter } from './middleware/rateLimiter'
import { errorHandler } from './middleware/errorHandler'
import { ApiError } from './utils/ApiError'

const app = express()

// Security headers
app.use(helmet())

// CORS
const allowedOrigins = env.CORS_ORIGIN.split(',').map((o) => o.trim())
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
      cb(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true,
  }),
)

// Body parsing with size limit
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: true, limit: '10kb' }))

// Compression
app.use(compression())

// NoSQL injection prevention
app.use(mongoSanitize())

// HTTP Parameter Pollution prevention
app.use(hpp())

// DDoS mitigation (progressive delay)
app.use(speedLimiter)

// Global rate limiter
app.use(globalRateLimiter)

// HTTP logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'))
}

// API routes
app.use('/api/v1', v1Router)

// 404 handler
app.use((_req, _res, next) => {
  next(new ApiError(404, 'Route not found'))
})

// Global error handler
app.use(errorHandler)

export default app
