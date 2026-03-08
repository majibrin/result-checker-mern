import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import PrintTemplate from '../components/PrintTemplate'
import API, { authHeader } from '../api.js'

const StudentDashboard = () => {
  const { user, getToken } = useAuth()
  const [data, setData]       = useState({ summary: {}, results: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [semester, setSemester] = useState('all')

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        setError('')
        const res = await fetch(API.results.byStudent(user.id), {
          headers: authHeader(),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to fetch results')
        setData(json)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    if (user?.id) fetchResults()
  }, [user])

  // ── Semester filter ────────────────────────────────
  const semesters = ['all', ...new Set(data.results.map(r => r.semester))]
  const filtered  = semester === 'all'
    ? data.results
    : data.results.filter(r => r.semester === semester)

  // ── Recalculate GPA for filtered results ───────────
  const filteredSummary = (() => {
    let totalWeighted = 0, totalUnits = 0
    filtered.forEach(r => {
      totalWeighted += r.point * r.units
      totalUnits    += r.units
    })
    return {
      gpa:        totalUnits > 0 ? (totalWeighted / totalUnits).toFixed(2) : '0.00',
      totalUnits,
      totalResults: filtered.length,
    }
  })()

  return (
    <div style={{ padding: '15px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'system-ui' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }} className="no-print">
        <div>
          <h2 style={{ color: '#1e293b', margin: 0 }}>Student Portal</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            {user?.last_name ? `${user.last_name}, ${user.first_name}` : user?.reg_no}
          </p>
        </div>
        <button onClick={() => window.print()}
          style={{ padding: '10px 18px', background: '#1e293b', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          Print Result
        </button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#fde8ea', color: '#dc2626', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          Loading results...
        </div>
      )}

      {!loading && !error && (
        <>
          {/* Semester Filter */}
          <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }} className="no-print">
            {semesters.map(s => (
              <button key={s} onClick={() => setSemester(s)}
                style={{
                  padding: '6px 14px', borderRadius: '20px', border: 'none',
                  background: semester === s ? '#2563eb' : '#e2e8f0',
                  color: semester === s ? '#fff' : '#475569',
                  fontWeight: '600', cursor: 'pointer', fontSize: '13px',
                }}>
                {s === 'all' ? 'All Semesters' : s}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }} className="no-print">
            <div style={{ flex: 1, padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <small style={{ color: '#64748b', fontWeight: 'bold' }}>GPA</small>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2563eb' }}>
                {filteredSummary.gpa}
              </div>
            </div>
            <div style={{ flex: 1, padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <small style={{ color: '#64748b', fontWeight: 'bold' }}>TOTAL UNITS</small>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
                {filteredSummary.totalUnits}
              </div>
            </div>
            <div style={{ flex: 1, padding: '20px', background: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
              <small style={{ color: '#64748b', fontWeight: 'bold' }}>COURSES</small>
              <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>
                {filteredSummary.totalResults}
              </div>
            </div>
          </div>

          {/* Results List */}
          <div className="no-print">
            <h3 style={{ color: '#1e293b', marginBottom: '15px' }}>Academic Records</h3>
            {filtered.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', background: '#fff', borderRadius: '12px' }}>
                No results found for this semester.
              </div>
            ) : (
              filtered.map((r, i) => (
                <div key={r._id || i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '10px' }}>
                  <div>
                    <div style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '12px' }}>{r.courseCode}</div>
                    <div style={{ fontWeight: '600' }}>{r.courseName}</div>
                    <small style={{ color: '#64748b' }}>Units: {r.units} | Semester: {r.semester}</small>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.4rem', color: gradeColor(r.grade) }}>{r.grade}</div>
                    <small style={{ color: '#64748b' }}>{r.mark}%</small>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Print view */}
      <div className="print-only" style={{ display: 'none' }}>
        <PrintTemplate data={{ ...data, results: filtered, summary: filteredSummary }} user={user} />
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: block !important; }
        }
      `}</style>
    </div>
  )
}

const gradeColor = (grade) => {
  const colors = { A: '#16a34a', B: '#2563eb', C: '#d97706', D: '#ea580c', E: '#dc2626', F: '#6b7280' }
  return colors[grade] || '#1e293b'
}

export default StudentDashboard
