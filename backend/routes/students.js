import express from 'express'
import { body, param, validationResult } from 'express-validator'
import Student from '../models/Student.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

// ── All routes: admin only ─────────────────────────────
router.use(protect, authorize('admin'))

// ── Validation helper ──────────────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(422).json({ error: errors.array()[0].msg })
  next()
}

// ── Validation rules ───────────────────────────────────
const studentRules = [
  body('reg_no').notEmpty().withMessage('Registration number is required')
    .isLength({ min: 5, max: 30 }).withMessage('Invalid registration number'),
  body('first_name').trim().notEmpty().withMessage('First name is required')
    .isLength({ max: 50 }).withMessage('First name too long').escape(),
  body('last_name').trim().notEmpty().withMessage('Last name is required')
    .isLength({ max: 50 }).withMessage('Last name too long').escape(),
  body('department').trim().notEmpty().withMessage('Department is required')
    .isLength({ max: 100 }).withMessage('Department name too long').escape(),
  body('level').isIn([100, 200, 300, 400, 500]).withMessage('Level must be 100-500'),
]

const idRule = [
  param('id').isMongoId().withMessage('Invalid student ID')
]

// ── GET /api/students ──────────────────────────────────
router.get('/', async (req, res, next) => {
  try {
    const students = await Student.find()
      .select('-pin_hash')
      .sort('-createdAt')
    res.json(students)
  } catch (err) { next(err) }
})

// ── POST /api/students ─────────────────────────────────
router.post('/', studentRules, validate, async (req, res, next) => {
  try {
    // ── Whitelist only allowed fields ──────────────────
    const { first_name, last_name, department, level } = req.body
    // ── Read reg_no directly to avoid validator encoding ──
    const reg_no = req.body.reg_no.toUpperCase().trim()

    // ── Check duplicate reg_no ─────────────────────────
    const exists = await Student.findOne({ reg_no })
    if (exists) return res.status(400).json({ error: 'Registration number already exists' })

    // ── Generate 6-digit PIN ───────────────────────────
    const rawPin = Math.floor(100000 + Math.random() * 900000).toString()

    const student = await Student.create({
      reg_no,
      first_name,
      last_name,
      department,
      level:      Number(level),
      pin_hash:   rawPin,
    })

    // ── Never return pin_hash from DB ──────────────────
    const studentOut = student.toObject()
    delete studentOut.pin_hash

    res.status(201).json({
      message:       'Student created successfully',
      student:       studentOut,
      generated_pin: rawPin,
    })
  } catch (err) { next(err) }
})

// ── PUT /api/students/:id ──────────────────────────────
router.put('/:id', idRule, studentRules, validate, async (req, res, next) => {
  try {
    const { first_name, last_name, department, level } = req.body

    // ── Whitelist: never allow reg_no or pin change here
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { first_name, last_name, department, level: Number(level) },
      { new: true, runValidators: true }
    ).select('-pin_hash')

    if (!student) return res.status(404).json({ error: 'Student not found' })
    res.json({ message: 'Student updated', student })
  } catch (err) { next(err) }
})

// ── POST /api/students/:id/reset-pin ──────────────────
router.post('/:id/reset-pin', idRule, validate, async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id)
    if (!student) return res.status(404).json({ error: 'Student not found' })

    // ── Generate new PIN, pre-save hook hashes it ──────
    const newPin = Math.floor(100000 + Math.random() * 900000).toString()
    student.pin_hash = newPin
    await student.save()

    res.json({
      message:   'PIN reset successfully',
      reg_no:    student.reg_no,
      new_pin:   newPin,
    })
  } catch (err) { next(err) }
})

// ── DELETE /api/students/:id ───────────────────────────
router.delete('/:id', idRule, validate, async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id)
    if (!student) return res.status(404).json({ error: 'Student not found' })
    res.json({ message: 'Student deleted successfully' })
  } catch (err) { next(err) }
})

export default router
