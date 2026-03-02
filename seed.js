import 'dotenv/config'
import mongoose from 'mongoose'
import Admin from './backend/models/Admin.js'

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  const admin = await Admin.create({
    username: 'admin',
    password: 'password123',
    role: 'admin'
  })
  console.log('✅ Admin created: admin / password123')
  process.exit()
}
seed()
