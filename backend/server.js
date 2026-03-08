import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'
import connectDB from './config/db.js'

import authRoutes    from './routes/auth.js'
import studentRoutes from './routes/students.js'
import courseRoutes  from './routes/courses.js'
import resultRoutes  from './routes/results.js'

const app = express()

// ── Connect DB ─────────────────────────────────────────
connectDB()

// ── Security Headers (helmet) ──────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:'],
    }
  }
}))

// ── CORS ───────────────────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS blocked: ${origin}`))
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

// ── Global Rate Limiter ────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests. Please try again later.' },
}))

// ── Strict Auth Rate Limiter (login routes only) ───────
export const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,                    // 5 attempts only
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please wait 10 minutes.' },
})

// ── Body Parser ────────────────────────────────────────
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: false, limit: '10kb' }))

// ── Disable fingerprinting ─────────────────────────────
app.disable('x-powered-by')

// ── Logger (dev only) ──────────────────────────────────
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'))

// ── Routes ─────────────────────────────────────────────
app.use('/api/auth',     authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/courses',  courseRoutes)
app.use('/api/results',  resultRoutes)

// ── Health Check ───────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Result Checker API running 🚀' })
})

// ── 404 Handler ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ── Global Error Handler ───────────────────────────────
app.use((err, req, res, next) => {
  console.error('💥', err.stack)
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production'
      ? 'Something went wrong'
      : err.message
  })
})

// ── Start Server ───────────────────────────────────────
const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
})
