import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API, { authHeader } from '../../api.js'

// ── Client-side course parser (mirrors backend) ────────
const parseCourseCode = (code) => {
  if (!code) return null
  const digits = code.replace(/\D/g, '')
  if (!digits.length) return null
  const level    = parseInt(digits[0], 10) * 100
  const semester = parseInt(digits[digits.length - 1], 10) % 2 !== 0 ? 'First' : 'Second'
  if (![100, 200, 300, 400, 500].includes(level)) return null
  return { level, semester }
}

const getGrade = (mark) => {
  if (mark >= 70) return 'A'
  if (mark >= 60) return 'B'
  if (mark >= 50) return 'C'
  if (mark >= 45) return 'D'
  if (mark >= 40) return 'E'
  return 'F'
}
const getPoint = (mark) => {
  if (mark >= 70) return 5
  if (mark >= 60) return 4
  if (mark >= 50) return 3
  if (mark >= 45) return 2
  if (mark >= 40) return 1
  return 0
}
const gradeColor = (grade) => {
  const c = { A: '#16a34a', B: '#2563eb', C: '#d97706', D: '#ea580c', E: '#dc2626', F: '#6b7280' }
  return c[grade] || '#1e293b'
}

const Results = () => {
  const [students, setStudents]   = useState([])
  const [courses, setCourses]     = useState([])
  const [results, setResults]     = useState([])
  const [formData, setFormData]   = useState({ student: '', course: '', mark: '' })
  const [detected, setDetected]   = useState(null)  // { level, semester }
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  // ── Selected student object ────────────────────────
  const selectedStudent = students.find(s => s._id === formData.student)

  // ── Filtered courses: only current level or lower ──
  const eligibleCourses = selectedStudent
    ? courses.filter(c => {
        const parsed = parseCourseCode(c.code)
        return parsed && parsed.level <= selectedStudent.level
      })
    : courses

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          fetch(API.students.all, { headers: authHeader() }),
          fetch(API.courses.all,  { headers: authHeader() }),
        ])
        if (sRes.ok) setStudents(await sRes.json())
        if (cRes.ok) setCourses(await cRes.json())
      } catch { setError('Failed to load data') }
    }
    fetchAll()
  }, [])

  // ── Fetch existing results when student changes ────
  useEffect(() => {
    if (!formData.student) { setResults([]); return }
    const fetch_ = async () => {
      try {
        const res  = await fetch(API.results.byStudent(formData.student), { headers: authHeader() })
        const data = await res.json()
        if (res.ok) setResults(data.results || [])
      } catch { /* silent */ }
    }
    fetch_()
    // Reset course when student changes
    setFormData(f => ({ ...f, course: '', mark: '' }))
    setDetected(null)
  }, [formData.student])

  // ── Auto-detect level+semester when course changes ─
  const handleCourseChange = (e) => {
    const courseId = e.target.value
    const course   = courses.find(c => c._id === courseId)
    const parsed   = course ? parseCourseCode(course.code) : null
    setFormData(f => ({ ...f, course: courseId, mark: '' }))
    setDetected(parsed)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!detected) return setError('Cannot detect level/semester from course code')
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(API.results.all, {
        method:  'POST',
        headers: authHeader(),
        body:    JSON.stringify({
          student: formData.student,
          course:  formData.course,
          mark:    Number(formData.mark),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to save result')

      setSuccess(`Result saved — Level ${data.detected.level}, ${data.detected.semester} Semester`)
      setFormData(f => ({ ...f, mark: '' }))

      // Refresh results
      const rRes  = await fetch(API.results.byStudent(formData.student), { headers: authHeader() })
      const rData = await rRes.json()
      if (rRes.ok) setResults(rData.results || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '15px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>
      <Link to="/admin/dashboard" style={backBtn}>← Dashboard</Link>
      <h2 style={{ color: '#1e293b', margin: '20px 0' }}>Enter Examination Result</h2>

      {error && (
        <div style={{ background: '#fde8ea', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 'bold' }}>✕</button>
        </div>
      )}
      {success && (
        <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #bbf7d0' }}>
          ✅ {success}
          <button onClick={() => setSuccess('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', marginBottom: '25px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

          {/* Student */}
          <div>
            <label style={labelS}>Student</label>
            <select style={inputS} value={formData.student}
              onChange={e => setFormData(f => ({ ...f, student: e.target.value }))} required>
              <option value="">Select Student</option>
              {students.map(s => (
                <option key={s._id} value={s._id}>
                  {s.reg_no} — {s.last_name}, {s.first_name} ({s.level} Level)
                </option>
              ))}
            </select>
          </div>

          {/* Course — filtered by student level */}
          <div>
            <label style={labelS}>
              Course
              {selectedStudent && (
                <span style={{ color: '#64748b', fontWeight: '400', marginLeft: '8px' }}>
                  (showing {selectedStudent.level} level and below)
                </span>
              )}
            </label>
            <select style={inputS} value={formData.course}
              onChange={handleCourseChange} required disabled={!formData.student}>
              <option value="">Select Course</option>
              {eligibleCourses.map(c => {
                const p = parseCourseCode(c.code)
                return (
                  <option key={c._id} value={c._id}>
                    {c.code} — {c.name} {p ? `(${p.level}L, ${p.semester} Sem)` : ''}
                  </option>
                )
              })}
            </select>
          </div>

          {/* Auto-detected level + semester */}
          {detected && (
            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', display: 'flex', gap: '20px' }}>
              <span>📚 Level: <strong>{detected.level}</strong></span>
              <span>📅 Semester: <strong>{detected.semester}</strong></span>
              <span style={{ color: '#64748b' }}>Auto-detected from course code</span>
            </div>
          )}

          {/* Mark */}
          <div>
            <label style={labelS}>Mark (0 — 100)</label>
            <input type="number" placeholder="Enter score"
              style={inputS} value={formData.mark}
              onChange={e => setFormData(f => ({ ...f, mark: e.target.value }))}
              min="0" max="100" step="0.01" required />
          </div>

          {/* Grade preview */}
          {formData.mark !== '' && (
            <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '8px', display: 'flex', gap: '20px', fontSize: '14px' }}>
              <span>Grade: <strong style={{ color: gradeColor(getGrade(Number(formData.mark))) }}>
                {getGrade(Number(formData.mark))}
              </strong></span>
              <span>Points: <strong>{getPoint(Number(formData.mark))}</strong></span>
              <span style={{ fontWeight: '600', color: Number(formData.mark) >= 40 ? '#16a34a' : '#dc2626' }}>
                {Number(formData.mark) >= 40 ? 'PASS' : 'FAIL'}
              </span>
            </div>
          )}

          <button type="submit" disabled={loading || !detected}
            style={{ ...primaryBtn, opacity: (loading || !detected) ? 0.7 : 1 }}>
            {loading ? 'Saving...' : 'Save Result'}
          </button>
        </form>
      </div>

      {/* Existing results */}
      {results.length > 0 && (
        <div>
          <h3 style={{ color: '#1e293b', marginBottom: '12px' }}>
            Existing Results for {selectedStudent?.first_name} {selectedStudent?.last_name}
          </h3>
          {results.map((r, i) => (
            <div key={r._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', marginBottom: '8px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb' }}>{r.courseCode}</div>
                <div style={{ fontWeight: '600', fontSize: '14px' }}>{r.courseName}</div>
                <small style={{ color: '#64748b' }}>{r.semester} Sem — {r.level} Level</small>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 'bold', fontSize: '1.3rem', color: gradeColor(r.grade) }}>{r.grade}</div>
                <small style={{ color: '#64748b' }}>{r.mark}%</small>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const labelS     = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '5px' }
const inputS     = { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', width: '100%', boxSizing: 'border-box', backgroundColor: '#fff' }
const primaryBtn = { padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '16px', cursor: 'pointer' }
const backBtn    = { textDecoration: 'none', color: '#2563eb', fontWeight: '600', display: 'inline-block', marginBottom: '5px' }

export default Results
