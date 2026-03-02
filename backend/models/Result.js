import mongoose from 'mongoose'

const resultSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  mark: {
    type: Number,
    required: [true, 'Mark is required'],
    min: [0, 'Mark cannot be less than 0'],
    max: [100, 'Mark cannot exceed 100'],
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    trim: true,
  },
  level: {
    type: Number,
    required: true,
    enum: [100, 200, 300, 400, 500],
  },
}, { timestamps: true })

// Unique result per student per course per semester
resultSchema.index({ student: 1, course: 1, semester: 1 }, { unique: true })

// Grade calculator (ported from PHP getGradeInfo)
resultSchema.methods.getGradeInfo = function () {
  const mark = this.mark
  if (mark >= 70) return { grade: 'A', point: 5 }
  if (mark >= 60) return { grade: 'B', point: 4 }
  if (mark >= 50) return { grade: 'C', point: 3 }
  if (mark >= 45) return { grade: 'D', point: 2 }
  if (mark >= 40) return { grade: 'E', point: 1 }
  return { grade: 'F', point: 0 }
}

// Static version for use without instance
resultSchema.statics.getGradeInfo = function (mark) {
  if (mark >= 70) return { grade: 'A', point: 5 }
  if (mark >= 60) return { grade: 'B', point: 4 }
  if (mark >= 50) return { grade: 'C', point: 3 }
  if (mark >= 45) return { grade: 'D', point: 2 }
  if (mark >= 40) return { grade: 'E', point: 1 }
  return { grade: 'F', point: 0 }
}

export default mongoose.model('Result', resultSchema)
