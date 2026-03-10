import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API, { authHeader } from '../../api.js'

const Courses = () => {
  const [courses, setCourses]   = useState([])
  const [formData, setFormData] = useState({ name: '', code: '', unit: 3, lecturer: '' })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')

  const fetchCourses = async () => {
    try {
      const res  = await fetch(API.courses.all, { headers: authHeader() })
      const data = await res.json()
      if (res.ok) setCourses(data)
    } catch { setError('Failed to load courses') }
  }

  useEffect(() => { fetchCourses() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const url    = editingId ? API.courses.byId(editingId) : API.courses.all
      const method = editingId ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: authHeader(),
        body: JSON.stringify({
          ...formData,
          unit: Number(formData.unit),
          code: formData.code.toUpperCase().trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Operation failed')
      setSuccess(editingId ? 'Course updated successfully' : `Course "${data.name || formData.name}" added`)
      setEditingId(null)
      setFormData({ name: '', code: '', unit: 3, lecturer: '' })
      fetchCourses()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This will affect all results for this course.`)) return
    try {
      const res = await fetch(API.courses.byId(id), {
        method: 'DELETE',
        headers: authHeader(),
      })
      if (res.ok) {
        setSuccess('Course deleted')
        fetchCourses()
      }
    } catch { setError('Failed to delete course') }
  }

  const startEdit = (c) => {
    setEditingId(c._id)
    setFormData({ name: c.name, code: c.code, unit: c.unit, lecturer: c.lecturer })
    window.scrollTo(0, 0)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ name: '', code: '', unit: 3, lecturer: '' })
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui', maxWidth: '860px', margin: '0 auto' }}>
      <Link to="/admin/dashboard" style={backBtn}>← Dashboard</Link>
      <h2 style={{ color: '#1e293b', margin: '20px 0' }}>
        {editingId ? 'Edit Course' : 'Course Catalog'}
      </h2>

      {/* Error */}
      {error && (
        <div style={{ background: '#fde8ea', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
          {error}
          <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Success */}
      {success && (
        <div style={{ background: '#f0fdf4', color: '#16a34a', padding: '12px', borderRadius: '8px', marginBottom: '12px', border: '1px solid #bbf7d0' }}>
          ✅ {success}
          <button onClick={() => setSuccess('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input placeholder="Course Name (e.g. Database Systems)"
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            required style={iS} />
          <input placeholder="Course Code (e.g. CS301)"
            value={formData.code}
            onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required style={iS} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelS}>Credit Units</label>
              <select value={formData.unit}
                onChange={e => setFormData({ ...formData, unit: Number(e.target.value) })}
                style={iS}>
                {[1, 2, 3, 4, 5, 6].map(u => <option key={u} value={u}>{u} Unit{u > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div style={{ flex: 2 }}>
              <label style={labelS}>Lecturer</label>
              <input placeholder="e.g. Dr. Aliyu"
                value={formData.lecturer}
                onChange={e => setFormData({ ...formData, lecturer: e.target.value })}
                required style={iS} />
            </div>
          </div>
          <button type="submit" disabled={loading}
            style={{ ...primaryBtn, background: editingId ? '#059669' : '#2563eb', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving...' : editingId ? 'Update Course' : 'Add Course'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit}
              style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: '600' }}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Course list */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {courses.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#fff', borderRadius: '12px' }}>
            No courses yet. Add one above.
          </div>
        )}
        {courses.map(c => (
          <div key={c._id} style={{ padding: '16px', borderRadius: '12px', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb' }}>{c.code}</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{c.name}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{c.lecturer}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
              <div style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#475569' }}>
                {c.unit} Unit{c.unit > 1 ? 's' : ''}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => startEdit(c)} style={actionBtn}>Edit</button>
                <button onClick={() => handleDelete(c._id, c.name)} style={{ ...actionBtn, color: '#dc2626' }}>Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const iS        = { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', width: '100%', boxSizing: 'border-box' }
const labelS    = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '4px' }
const primaryBtn = { padding: '14px', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '16px' }
const actionBtn  = { background: '#f1f5f9', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }
const backBtn    = { textDecoration: 'none', color: '#2563eb', fontWeight: '600', display: 'inline-block', marginBottom: '5px' }

export default Courses
