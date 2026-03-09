import express from 'express'
import { body, param, validationResult } from 'express-validator'
import Course from '../models/Course.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// ── Validation helper ──────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })
  next()
}

// ── Validation rules ───────────────────────────────────
const courseRules = [
  body('name').trim().notEmpty().withMessage('Course name is required')
    .isLength({ max: 100 }).withMessage('Course name too long').escape(),
  body('code').trim().notEmpty().withMessage('Course code is required')
    .isLength({ max: 20 }).withMessage('Course code too long')
    .matches(/^[A-Z0-9 ]+$/i).withMessage('Invalid course code format'),
  body('unit').isInt({ min: 1, max: 6 }).withMessage('Unit must be between 1 and 6'),
  body('lecturer').trim().notEmpty().withMessage('Lecturer name is required')
    .isLength({ max: 100 }).withMessage('Lecturer name too long').escape(),
]

const idRule = [
  param('id').isMongoId().withMessage('Invalid course ID')
]

// ── GET /api/courses ───────────────────────────────────
router.get('/', protect, async (req, res, next) => {
  try {
    const courses = await Course.find().sort('code')
    res.json(courses)
  } catch (err) { next(err) }
})

// ── POST /api/courses ──────────────────────────────────
router.post('/', protect, authorize('admin'), courseRules, validate, async (req, res, next) => {
  try {
    // ── Whitelist fields ───────────────────────────────
    const { name, code, unit, lecturer } = req.body

    const exists = await Course.findOne({ code: code.toUpperCase().trim() })
    if (exists) return res.status(400).json({ error: 'Course code already exists' })

    const course = await Course.create({
      name,
      code:     code.toUpperCase().trim(),
      unit:     Number(unit),
      lecturer,
    })
    res.status(201).json(course)
  } catch (err) { next(err) }
})

// ── PUT /api/courses/:id ───────────────────────────────
router.put('/:id', protect, authorize('admin'), idRule, courseRules, validate, async (req, res, next) => {
  try {
    const { name, unit, lecturer } = req.body
    // ── code is not updatable — it's the unique identifier
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { name, unit: Number(unit), lecturer },
      { new: true, runValidators: true }
    )
    if (!course) return res.status(404).json({ error: 'Course not found' })
    res.json(course)
  } catch (err) { next(err) }
})

// ── DELETE /api/courses/:id ────────────────────────────
router.delete('/:id', protect, authorize('admin'), idRule, validate, async (req, res, next) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id)
    if (!course) return res.status(404).json({ error: 'Course not found' })
    res.json({ message: 'Course deleted successfully' })
  } catch (err) { next(err) }
})

export default router
