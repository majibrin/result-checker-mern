import express from 'express'
import Student from '../models/Student.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.use(protect, authorize('admin'))

router.get('/', async (req, res, next) => {
  try {
    const students = await Student.find().sort('-createdAt')
    res.json(students)
  } catch (err) { next(err) }
})

router.post('/', async (req, res, next) => {
  try {
    const rawPin = Math.floor(100000 + Math.random() * 900000).toString()
    const student = await Student.create({ ...req.body, pin_hash: rawPin })

    res.status(201).json({
      message: 'Student created successfully',
      student,
      generated_pin: rawPin
    })
  } catch (err) { next(err) }
})

router.delete('/:id', async (req, res, next) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id)
    if (!student) return res.status(404).json({ error: 'Student not found' })
    res.json({ message: 'Student deleted' })
  } catch (err) { next(err) }
})

export default router
