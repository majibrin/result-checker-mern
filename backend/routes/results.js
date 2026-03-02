import express from 'express'
import Result from '../models/Result.js'
import Course from '../models/Course.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// @route   POST /api/results
// @desc    Add a result (Admin only)
router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const { student, course, mark, semester, level } = req.body

    // Validate course exists to ensure we have units for GPA calc
    const courseData = await Course.findById(course)
    if (!courseData) return res.status(404).json({ error: 'Course not found' })

    const result = await Result.create({ student, course, mark, semester, level })
    res.status(201).json(result)
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Result already exists for this student in this course/semester' })
    }
    next(err)
  }
})

// @route   GET /api/results/student/:studentId
// @desc    Get all results for a student + GPA calc
router.get('/student/:studentId', protect, async (req, res, next) => {
  try {
    const { studentId } = req.params

    // Security Check: Students can only view THEIR own results
    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ error: 'Access denied: You can only view your own results' })
    }

    const results = await Result.find({ student: studentId })
      .populate('course', 'name code unit')
      .sort('semester')

    // GPA Calculation Logic
    let totalWeightedPoints = 0
    let totalUnits = 0

    const formattedResults = results.map(r => {
      const { grade, point } = r.getGradeInfo()
      const units = r.course?.unit || 0
      
      totalWeightedPoints += (point * units)
      totalUnits += units
      
      return {
        _id: r._id,
        courseCode: r.course?.code,
        courseName: r.course?.name,
        units,
        mark: r.mark,
        grade,
        point,
        semester: r.semester,
        level: r.level
      }
    })

    const gpa = totalUnits > 0 ? (totalWeightedPoints / totalUnits).toFixed(2) : "0.00"

    res.json({
      summary: {
        gpa,
        totalUnits,
        totalResults: results.length
      },
      results: formattedResults
    })
  } catch (err) { next(err) }
})

export default router
