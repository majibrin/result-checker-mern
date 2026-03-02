import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { rateLimit } from 'express-rate-limit'
import connectDB from './config/db.js'

const app = express()

connectDB()

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}))
app.use(express.json({ limit: '10kb' }))
app.use(express.urlencoded({ extended: false }))
if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'))

// TODO: routes go here

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Result Checker API running 🚀' })
})
app.use((req, res) => res.status(404).json({ error: 'Route not found' }))
app.use((err, req, res, next) => {
  console.error('💥', err.stack)
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
})
