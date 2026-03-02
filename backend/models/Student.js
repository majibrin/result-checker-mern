import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const studentSchema = new mongoose.Schema({
  reg_no: {
    type: String,
    required: [true, 'Registration number is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  first_name: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  last_name: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true,
  },
  level: {
    type: Number,
    required: true,
    enum: [100, 200, 300, 400, 500],
    default: 100,
  },
  pin_hash: {
    type: String,
    select: false,
  },
}, { timestamps: true })

// Hash PIN before save
studentSchema.pre('save', async function (next) {
  if (!this.isModified('pin_hash')) return next()
  if (this.pin_hash) {
    this.pin_hash = await bcrypt.hash(this.pin_hash, 12)
  }
  next()
})

// Compare PIN
studentSchema.methods.comparePin = async function (pin) {
  return bcrypt.compare(pin, this.pin_hash)
}

export default mongoose.model('Student', studentSchema)
