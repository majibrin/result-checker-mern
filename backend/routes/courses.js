import express from 'express'
import Course from '../models/Course.js'
import { protect, authorize } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, async (req, res, next) => {
  try {
    const courses = await Course.find().sort('code')
    res.json(courses)
  } catch (err) { next(err) }
})

router.post('/', protect, authorize('admin'), async (req, res, next) => {
  try {
    const course = await Course.create(req.body)
    res.status(201).json(course)
  } catch (err) { next(err) }
})

router.delete('/:id', protect, authorize('admin'), async (req, res, next) => {
  try {
    await Course.findByIdAndDelete(req.params.id)
    res.json({ message: 'Course deleted' })
  } catch (err) { next(err) }
})

export default router
