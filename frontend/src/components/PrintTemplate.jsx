import React from 'react';

export const PrintTemplate = React.forwardRef(({ data, user }, ref) => {
  // This logic now expects the real names from your updated backend
  const firstName = user?.first_name || "";
  const lastName = user?.last_name || "";
  const fullName = (firstName || lastName) 
    ? `${lastName.toUpperCase()}, ${firstName}` 
    : "NAME NOT FOUND - PLEASE RE-LOGIN";

  return (
    <div ref={ref} style={{ padding: '40px', fontFamily: 'serif', color: '#000', backgroundColor: '#fff' }}>
      <style>{`
        @page { size: A4; margin: 10mm; }
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div style={{ textAlign: 'center', borderBottom: '2px solid #333', marginBottom: '30px', paddingBottom: '10px' }}>
        <h1 style={{ margin: 0, fontSize: '22px' }}>STUDENT RESULT PORTAL</h1>
        <h2 style={{ margin: '5px 0', fontSize: '18px' }}>Faculty of Science (Computer Science)</h2>
        <p style={{ margin: 0, fontSize: '14px' }}>Session: 2022/2023 | Semester: First</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <p style={detailP}><strong>MATRIC NO:</strong> {user?.reg_no}</p>
          <p style={detailP}><strong>DEPARTMENT:</strong> Computer Science</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={detailP}><strong>NAME:</strong> {fullName}</p>
          <p style={detailP}><strong>LEVEL:</strong> {data.results[0]?.level || "100"} Level</p>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
            <th style={tdS}>Course Code</th>
            <th style={tdS}>Course Title</th>
            <th style={tdS}>Unit</th>
            <th style={tdS}>Grade</th>
            <th style={tdS}>Points</th>
          </tr>
        </thead>
        <tbody>
          {data.results.map((r, i) => (
            <tr key={i}>
              <td style={tdS}>{r.courseCode}</td>
              <td style={tdS}>{r.courseName}</td>
              <td style={tdS}>{r.unit || r.units}</td>
              <td style={tdS}>{r.grade}</td>
              <td style={tdS}>{r.point || r.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ border: '2px solid #000', padding: '10px', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
        <span>Total Units: {data.summary?.totalUnits}</span>
        <span>GPA: {data.summary?.gpa}</span>
        <span>Status: {parseFloat(data.summary?.gpa) >= 1.0 ? 'PASS' : 'PROBATION'}</span>
      </div>

      <div style={{ marginTop: '50px', textAlign: 'center', fontSize: '12px', color: '#666' }}>
        <p>This is a computer-generated statement of results for project defence purposes.</p>
        <p>Generated on: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
});

const detailP = { margin: '3px 0', fontSize: '14px' };
const tdS = { border: '1px solid #000', padding: '8px', textAlign: 'left', fontSize: '13px' };

export default PrintTemplate;
