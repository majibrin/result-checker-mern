import express from 'express'
import { body, param, validationResult } from 'express-validator'
import Result from '../models/Result.js'
import Course from '../models/Course.js'
import Student from '../models/Student.js'
import { protect, authorize } from '../middleware/auth.js'
import { parseCourseCode, canTakeCourse } from '../utils/courseParser.js'

const router = express.Router()

// ── Validation helper ──────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })
  next()
}

// ── Validation rules ───────────────────────────────────
const resultRules = [
  body('student').isMongoId().withMessage('Invalid student ID'),
  body('course').isMongoId().withMessage('Invalid course ID'),
  body('mark')
    .isFloat({ min: 0, max: 100 }).withMessage('Mark must be between 0 and 100'),
]

// ── POST /api/results ──────────────────────────────────
router.post('/', protect, authorize('admin'), resultRules, validate, async (req, res, next) => {
  try {
    const { student: studentId, course: courseId, mark } = req.body

    // ── Fetch course and student ───────────────────────
    const [course, student] = await Promise.all([
      Course.findById(courseId),
      Student.findById(studentId),
    ])

    if (!course)   return res.status(404).json({ error: 'Course not found' })
    if (!student)  return res.status(404).json({ error: 'Student not found' })

    // ── Auto-detect level + semester from course code ──
    const parsed = parseCourseCode(course.code)
    if (!parsed) {
      return res.status(400).json({
        error: `Cannot parse level/semester from course code "${course.code}". Use format like COSC403.`
      })
    }

    const { level, semester } = parsed

    // ── Carryover check: block ahead-level courses ─────
    if (!canTakeCourse(student.level, level)) {
      return res.status(400).json({
        error: `Student is ${student.level} level and cannot take a ${level} level course. Only current or lower level courses allowed.`
      })
    }

    // ── Upsert: update if exists, create if not ────────
    const result = await Result.findOneAndUpdate(
      { student: studentId, course: courseId, semester },
      { mark: Number(mark), level },
      { new: true, upsert: true, runValidators: true }
    )

    res.status(201).json({
      message:  'Result saved successfully',
      result,
      detected: { level, semester },
    })
  } catch (err) { next(err) }
})

// ── GET /api/results/student/:studentId ───────────────
router.get('/student/:studentId',
  protect,
  param('studentId').isMongoId().withMessage('Invalid student ID'),
  validate,
  async (req, res, next) => {
    try {
      const { studentId } = req.params

      // ── Students can only view their own results ───────
      if (req.user.role === 'student' && req.user.id !== studentId) {
        return res.status(403).json({ error: 'Access denied: You can only view your own results' })
      }

      const results = await Result.find({ student: studentId })
        .populate('course', 'name code unit')
        .sort('semester')

      let totalWeightedPoints = 0
      let totalUnits = 0

      const formattedResults = results.map(r => {
        const { grade, point } = r.getGradeInfo()
        const units = r.course?.unit || 0
        totalWeightedPoints += point * units
        totalUnits += units

        return {
          _id:        r._id,
          courseCode: r.course?.code,
          courseName: r.course?.name,
          units,
          mark:       r.mark,
          grade,
          point,
          semester:   r.semester,
          level:      r.level,
        }
      })

      const gpa = totalUnits > 0
        ? (totalWeightedPoints / totalUnits).toFixed(2)
        : '0.00'

      res.json({
        summary: { gpa, totalUnits, totalResults: results.length },
        results: formattedResults,
      })
    } catch (err) { next(err) }
})

export default router
