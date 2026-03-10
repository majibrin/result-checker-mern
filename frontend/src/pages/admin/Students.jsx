import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import API, { authHeader } from '../../api.js'
import { FaCheckCircle, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa'

const Students = () => {
  const [students, setStudents]   = useState([])
  const [formData, setFormData]   = useState({ reg_no: '', first_name: '', last_name: '', department: '', level: 100 })
  const [editingId, setEditingId] = useState(null)
  const [generated, setGenerated] = useState(null)
  const [resetPin, setResetPin]   = useState(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')

  const fetchStudents = async () => {
    try {
      const res = await fetch(API.students.all, { headers: authHeader() })
      const data = await res.json()
      if (res.ok) setStudents(data)
    } catch { setError('Failed to load students') }
  }

  useEffect(() => { fetchStudents() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const url    = editingId ? API.students.byId(editingId) : API.students.all
      const method = editingId ? 'PUT' : 'POST'
      const res    = await fetch(url, {
        method,
        headers: authHeader(),
        body: JSON.stringify(formData),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Operation failed')
      if (!editingId) setGenerated({ reg: data.student.reg_no, pin: data.generated_pin })
      setEditingId(null)
      setFormData({ reg_no: '', first_name: '', last_name: '', department: '', level: 100 })
      fetchStudents()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student? All their results will be lost.')) return
    try {
      const res = await fetch(API.students.byId(id), {
        method: 'DELETE',
        headers: authHeader(),
      })
      if (res.ok) fetchStudents()
    } catch { setError('Failed to delete student') }
  }

  const handleResetPin = async (id) => {
    if (!window.confirm('Reset PIN for this student?')) return
    try {
      const res = await fetch(`${API.students.byId(id)}/reset-pin`, {
        method: 'POST',
        headers: authHeader(),
      })
      const data = await res.json()
      if (res.ok) setResetPin({ reg_no: data.reg_no, new_pin: data.new_pin })
      else throw new Error(data.error)
    } catch (err) { setError(err.message) }
  }

  const startEdit = (s) => {
    setEditingId(s._id)
    setFormData({ reg_no: s.reg_no, first_name: s.first_name, last_name: s.last_name, department: s.department, level: s.level })
    window.scrollTo(0, 0)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setFormData({ reg_no: '', first_name: '', last_name: '', department: '', level: 100 })
  }

  return (
    <div style={{ padding: '20px', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui', maxWidth: '860px', margin: '0 auto' }}>
      <Link to="/admin/dashboard" style={backBtn}><FaArrowLeft style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Dashboard</Link>
      <h2 style={{ color: '#1e293b', margin: '20px 0' }}>
        {editingId ? 'Edit Student' : 'Student Management'}
      </h2>

      {/* Error */}
      {error && (
        <div style={{ background: '#fde8ea', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {error} <button onClick={() => setError('')} style={{ float: 'right', background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', fontWeight: 'bold' }}>✕</button>
        </div>
      )}

      {/* New student credential display */}
      {generated && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#16a34a' }}><FaCheckCircle style={{ marginRight: '6px', verticalAlign: 'middle' }} /> Student Account Created</h4>
          <p style={{ margin: '4px 0' }}>Reg No: <strong>{generated.reg}</strong></p>
          <p style={{ margin: '4px 0' }}>PIN: <strong style={{ color: '#dc2626', fontSize: '1.2rem', letterSpacing: '4px' }}>{generated.pin}</strong></p>
          <small style={{ color: '#64748b' }}><FaExclamationTriangle style={{ marginRight: '6px', verticalAlign: 'middle', color: '#d97706' }} /> Save this PIN now — it cannot be retrieved again.</small>
          <br />
          <button onClick={() => setGenerated(null)} style={{ marginTop: '8px', padding: '4px 12px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* PIN Reset display */}
      {resetPin && (
        <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 8px 0', color: '#ea580c' }}>🔄 PIN Reset Successful</h4>
          <p style={{ margin: '4px 0' }}>Reg No: <strong>{resetPin.reg_no}</strong></p>
          <p style={{ margin: '4px 0' }}>New PIN: <strong style={{ color: '#dc2626', fontSize: '1.2rem', letterSpacing: '4px' }}>{resetPin.new_pin}</strong></p>
          <small style={{ color: '#64748b' }}><FaExclamationTriangle style={{ marginRight: '6px', verticalAlign: 'middle', color: '#d97706' }} /> Give this PIN to the student immediately.</small>
          <br />
          <button onClick={() => setResetPin(null)} style={{ marginTop: '8px', padding: '4px 12px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
            Dismiss
          </button>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', marginBottom: '25px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input placeholder="Registration Number (e.g. UG22/SCCS/1007)"
            value={formData.reg_no}
            onChange={e => setFormData({ ...formData, reg_no: e.target.value.toUpperCase() })}
            disabled={!!editingId}
            required style={{ ...iS, opacity: editingId ? 0.6 : 1 }} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input placeholder="First Name" value={formData.first_name}
              onChange={e => setFormData({ ...formData, first_name: e.target.value })}
              required style={{ ...iS, flex: 1 }} />
            <input placeholder="Last Name" value={formData.last_name}
              onChange={e => setFormData({ ...formData, last_name: e.target.value })}
              required style={{ ...iS, flex: 1 }} />
          </div>
          <input placeholder="Department" value={formData.department}
            onChange={e => setFormData({ ...formData, department: e.target.value })}
            required style={iS} />
          <select value={formData.level}
            onChange={e => setFormData({ ...formData, level: Number(e.target.value) })}
            style={iS}>
            {[100, 200, 300, 400, 500].map(l => <option key={l} value={l}>{l} Level</option>)}
          </select>
          <button type="submit" disabled={loading}
            style={{ ...primaryBtn, background: editingId ? '#059669' : '#2563eb', opacity: loading ? 0.7 : 1 }}>
            {loading ? 'Saving...' : editingId ? 'Update Student' : 'Register Student'}
          </button>
          {editingId && (
            <button type="button" onClick={cancelEdit}
              style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: '600' }}>
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Student list */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {students.map(s => (
          <div key={s._id} style={{ padding: '16px', borderRadius: '12px', background: '#fff', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb' }}>{s.reg_no}</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{s.first_name} {s.last_name}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{s.department} — {s.level} Level</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => startEdit(s)} style={actionBtn}>Edit</button>
                  <button onClick={() => handleDelete(s._id)} style={{ ...actionBtn, color: '#dc2626' }}>Delete</button>
                </div>
                <button onClick={() => handleResetPin(s._id)}
                  style={{ ...actionBtn, color: '#ea580c', fontSize: '11px' }}>
                  Reset PIN
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

const iS         = { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', width: '100%', boxSizing: 'border-box' }
const primaryBtn = { padding: '14px', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '16px' }
const actionBtn  = { background: '#f1f5f9', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }
const backBtn    = { textDecoration: 'none', color: '#2563eb', fontWeight: '600', display: 'inline-block', marginBottom: '5px' }

export default Students
