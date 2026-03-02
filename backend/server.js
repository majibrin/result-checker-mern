import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import connectDB from './config/db.js'

import authRoutes from './routes/auth.js'
import studentRoutes from './routes/students.js'
import courseRoutes from './routes/courses.js'
import resultRoutes from './routes/results.js'

const app = express()
connectDB()

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))

app.use(express.json({ limit: '10kb' }))

if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'))

app.use('/api/auth', authRoutes)
app.use('/api/students', studentRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/results', resultRoutes)

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
app.listen(PORT, () => console.log(`🚀 Server on port ${PORT}`))
