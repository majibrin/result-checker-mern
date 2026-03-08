import express from 'express'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import Admin from '../models/Admin.js'
import Student from '../models/Student.js'
import { loginLimiter } from '../middleware/rateLimiter.js'

const router = express.Router()

// ── Helpers ────────────────────────────────────────────
const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
    algorithm: 'HS256',
  })

const sendToken = (res, status, token, user) =>
  res.status(status).json({ token, user })

// ── Validation Rules ───────────────────────────────────
const adminLoginRules = [
  body('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 50 }).withMessage('Invalid username')
    .escape(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 100 }).withMessage('Invalid password length'),
]

const studentLoginRules = [
  body('reg_no')
    .trim()
    .notEmpty().withMessage('Registration number is required')
    .isLength({ min: 5, max: 30 }).withMessage('Invalid registration number')
    .matches(/^[A-Z0-9/\-]+$/i).withMessage('Invalid characters in registration number'),
  body('pin')
    .notEmpty().withMessage('PIN is required')
    .isLength({ min: 4, max: 10 }).withMessage('PIN must be 4-10 digits')
    .isNumeric().withMessage('PIN must contain numbers only'),
]

// ── Validation Error Handler ───────────────────────────
const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(422).json({ error: errors.array()[0].msg })
  }
  next()
}

// ── POST /api/auth/admin/login ─────────────────────────
router.post('/admin/login', loginLimiter, adminLoginRules, validate, async (req, res, next) => {
  try {
    const { username, password } = req.body
    const admin = await Admin.findOne({ username }).select('+password')

    if (!admin) {
      await new Promise(r => setTimeout(r, 300))
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    const isMatch = await admin.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }

    const token = signToken(admin._id, admin.role)
    sendToken(res, 200, token, {
      id:       admin._id,
      username: admin.username,
      role:     admin.role,
    })
  } catch (err) { next(err) }
})

// ── POST /api/auth/student/login ───────────────────────
router.post('/student/login', loginLimiter, studentLoginRules, validate, async (req, res, next) => {
  try {
    const { reg_no, pin } = req.body

    const student = await Student.findOne({
      reg_no: reg_no.toUpperCase().trim()
    }).select('+pin_hash')

    if (!student) {
      await new Promise(r => setTimeout(r, 300))
      return res.status(401).json({ error: 'Invalid Registration Number or PIN' })
    }

    if (!student.pin_hash) {
      return res.status(401).json({ error: 'PIN not set. Contact your administrator.' })
    }

    const isMatch = await student.comparePin(pin)
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid Registration Number or PIN' })
    }

    const token = signToken(student._id, 'student')
    sendToken(res, 200, token, {
      id:         student._id,
      reg_no:     student.reg_no,
      first_name: student.first_name,
      last_name:  student.last_name,
      role:       'student',
    })
  } catch (err) { next(err) }
})

export default router
