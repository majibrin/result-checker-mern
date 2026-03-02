import mongoose from 'mongoose'

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true,
  },
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    trim: true,
    uppercase: true,
  },
  unit: {
    type: Number,
    required: [true, 'Credit unit is required'],
    min: [1, 'Unit must be at least 1'],
    max: [6, 'Unit cannot exceed 6'],
  },
  lecturer: {
    type: String,
    required: [true, 'Lecturer name is required'],
    trim: true,
  },
}, { timestamps: true })

export default mongoose.model('Course', courseSchema)
