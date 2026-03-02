import mongoose from 'mongoose'

const connectDB = async () => {
  try {
    mongoose.set('strictQuery', true)

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      autoIndex: true,
    })

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`)

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Retrying...')
    })

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message)
    })

  } catch (err) {
    console.error(`❌ DB Connection Failed: ${err.message}`)
    process.exit(1)
  }
}

export default connectDB
