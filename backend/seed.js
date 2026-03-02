import 'dotenv/config'
import mongoose from 'mongoose'
import Admin from './models/Admin.js'

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    
    // Check if admin already exists to prevent duplicates
    const existing = await Admin.findOne({ username: 'admin' })
    if (existing) {
      console.log('ℹ️ Admin already exists.')
      process.exit()
    }

    await Admin.create({
      username: 'admin',
      password: 'password123',
      role: 'admin'
    })
    
    console.log('✅ Admin created: admin / password123')
    process.exit()
  } catch (err) {
    console.error('❌ Error seeding:', err.message)
    process.exit(1)
  }
}
seed()
