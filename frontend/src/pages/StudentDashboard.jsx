import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import PrintTemplate from '../components/PrintTemplate';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState({ summary: {}, results: [] });
  const token = localStorage.getItem('result_token') || "";

  useEffect(() => {
    const fetchMyResults = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/results/student/${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const resultData = await res.json();
        if (res.ok) setData(resultData);
      } catch (err) { console.error("Fetch error", err); }
    };
    if (user?.id) fetchMyResults();
  }, [user, token]);

  return (
    <div className="dashboard-container">
      <style>{`
        .dashboard-container { padding: 15px; background: #f8fafc; min-height: 100vh; font-family: system-ui; }
        .no-print-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .print-btn { padding: 10px 18px; background: #1e293b; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; }
        .stat-card { flex: 1; padding: 20px; background: #fff; border-radius: 12px; border: 1px solid #e2e8f0; text-align: center; }
        .result-card { display: flex; justify-content: space-between; padding: 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 10px; }
        .print-only { display: none; }
        @media print {
          .no-print-header, .stats-row, .results-list-view, h3 { display: none !important; }
          .print-only { display: block !important; }
        }
      `}</style>

      <div className="no-print-header">
        <div>
          <h2 style={{ color: '#1e293b', margin: 0 }}>Student Portal</h2>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            {user?.last_name ? `${user.last_name}, ${user.first_name}` : "User Profile"}
          </p>
        </div>
        <button onClick={() => window.print()} className="print-btn">Print Result</button>
      </div>

      <div className="stats-row" style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
        <div className="stat-card">
          <small style={{ color: '#64748b', fontWeight: 'bold' }}>GPA</small>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#2563eb' }}>{data.summary?.gpa || "0.00"}</div>
        </div>
        <div className="stat-card">
          <small style={{ color: '#64748b', fontWeight: 'bold' }}>TOTAL UNITS</small>
          <div style={{ fontSize: '2rem', fontWeight: '700', color: '#1e293b' }}>{data.summary?.totalUnits || 0}</div>
        </div>
      </div>

      <div className="results-list-view">
        <h3 style={{ color: '#1e293b', marginBottom: '15px' }}>Academic Records</h3>
        {data.results.map((r, i) => (
          <div key={i} className="result-card">
            <div>
              <div style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '12px' }}>{r.courseCode}</div>
              <div style={{ fontWeight: '600' }}>{r.courseName}</div>
              <small style={{ color: '#64748b' }}>Units: {r.unit || r.units}</small>
            </div>
            <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{r.grade}</div>
          </div>
        ))}
      </div>

      <div className="print-only">
        <PrintTemplate data={data} user={user} />
      </div>
    </div>
  );
};

export default StudentDashboard;
