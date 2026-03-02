import express from 'express'
import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import Student from '../models/Student.js'

const router = express.Router()

const signToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '1d' })
}

router.post('/admin/login', async (req, res, next) => {
  try {
    const { username, password } = req.body
    const admin = await Admin.findOne({ username }).select('+password')
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid username or password' })
    }
    const token = signToken(admin._id, admin.role)
    res.json({
      token,
      user: { id: admin._id, username: admin.username, role: admin.role }
    })
  } catch (err) { next(err) }
})

router.post('/student/login', async (req, res, next) => {
  try {
    const { reg_no, pin } = req.body
    const student = await Student.findOne({ reg_no }).select('+pin_hash')
    
    if (!student || !(await student.comparePin(pin))) {
      return res.status(401).json({ error: 'Invalid Registration Number or PIN' })
    }

    const token = signToken(student._id, 'student')
    res.json({
      token,
      user: { 
        id: student._id, 
        reg_no: student.reg_no, 
        first_name: student.first_name, // ADDED THIS
        last_name: student.last_name,   // ADDED THIS
        role: 'student' 
      }
    })
  } catch (err) { next(err) }
})

export default router
