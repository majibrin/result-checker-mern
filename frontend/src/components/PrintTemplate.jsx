import React from 'react'

const PrintTemplate = React.forwardRef(({ data, user }, ref) => {
  const fullName = user?.last_name && user?.first_name
    ? `${user.last_name.toUpperCase()}, ${user.first_name}`
    : 'NAME NOT FOUND — PLEASE RE-LOGIN'

  // ── Use student's actual level, not course level ───
  const studentLevel = user?.level || data.results?.[0]?.level || '—'

  // ── Derive semesters present in results ───────────
  const semesters = [...new Set(data.results?.map(r => r.semester) || [])]
  const semesterLabel = semesters.length === 1
    ? `${semesters[0]} Semester`
    : semesters.length > 1
    ? semesters.join(' & ') + ' Semesters'
    : '—'

  // ── Derive session from current year ──────────────
  const year = new Date().getFullYear()
  const session = `${year - 1}/${year}`

  return (
    <div ref={ref} style={{ padding: '30px', fontFamily: 'serif', color: '#000', backgroundColor: '#fff', maxWidth: '700px', margin: '0 auto' }}>
      <style>{`
        @page { size: A4; margin: 15mm; }
        @media print {
          nav, .no-print { display: none !important; }
          body { margin: 0; padding: 0; }
        }
      `}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '2px solid #333', marginBottom: '20px', paddingBottom: '10px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', letterSpacing: '1px' }}>STUDENT RESULT PORTAL</h1>
        <h2 style={{ margin: '4px 0', fontSize: '15px', fontWeight: 'normal' }}>
          {user?.department || 'Faculty of Science'} Department
        </h2>
        <p style={{ margin: 0, fontSize: '13px' }}>
          Session: {session} | {semesterLabel}
        </p>
      </div>

      {/* Student Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '13px' }}>
        <div>
          <p style={pS}><strong>MATRIC NO:</strong> {user?.reg_no}</p>
          <p style={pS}><strong>DEPARTMENT:</strong> {user?.department || 'Computer Science'}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={pS}><strong>NAME:</strong> {fullName}</p>
          <p style={pS}><strong>LEVEL:</strong> {studentLevel} Level</p>
        </div>
      </div>

      {/* Results Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '15px', fontSize: '13px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={thS}>Course Code</th>
            <th style={thS}>Course Title</th>
            <th style={thS}>Unit</th>
            <th style={thS}>Mark</th>
            <th style={thS}>Grade</th>
            <th style={thS}>Points</th>
            <th style={thS}>Semester</th>
          </tr>
        </thead>
        <tbody>
          {data.results?.map((r, i) => (
            <tr key={r._id || i}>
              <td style={tdS}>{r.courseCode}</td>
              <td style={tdS}>{r.courseName}</td>
              <td style={tdS}>{r.units}</td>
              <td style={tdS}>{r.mark}</td>
              <td style={{ ...tdS, fontWeight: 'bold' }}>{r.grade}</td>
              <td style={tdS}>{r.point}</td>
              <td style={tdS}>{r.semester}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div style={{ border: '2px solid #000', padding: '10px 15px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '14px' }}>
        <span>Total Units: {data.summary?.totalUnits}</span>
        <span>GPA: {data.summary?.gpa}</span>
        <span style={{ color: parseFloat(data.summary?.gpa) >= 1.0 ? '#000' : '#dc2626' }}>
          Status: {parseFloat(data.summary?.gpa) >= 1.0 ? 'PASS' : 'PROBATION'}
        </span>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '40px', textAlign: 'center', fontSize: '11px', color: '#666' }}>
        <p style={{ margin: '2px 0' }}>This is a computer-generated statement of results for project defence purposes.</p>
        <p style={{ margin: '2px 0' }}>Generated on: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  )
})

const pS  = { margin: '3px 0' }
const thS = { border: '1px solid #000', padding: '7px 8px', textAlign: 'left' }
const tdS = { border: '1px solid #000', padding: '7px 8px', textAlign: 'left' }

export default PrintTemplate
