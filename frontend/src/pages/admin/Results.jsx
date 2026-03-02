import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Results = () => {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ student: '', course: '', mark: '', semester: 'First', level: 100 });
  const token = localStorage.getItem('result_token') || "";

  useEffect(() => {
    const fetchData = async () => {
      const headers = { 'Authorization': `Bearer ${token}` };
      const [sRes, cRes] = await Promise.all([
        fetch('http://localhost:5000/api/students', { headers }),
        fetch('http://localhost:5000/api/courses', { headers })
      ]);
      if (sRes.ok) setStudents(await sRes.json());
      if (cRes.ok) setCourses(await cRes.json());
    };
    fetchData();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/results', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      alert("Result Saved Successfully!");
      setFormData({ ...formData, mark: '' });
    }
  };

  return (
    <div style={{ padding: '15px', fontFamily: 'system-ui', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Link to="/admin/dashboard" style={backBtn}>← Back to Dashboard</Link>
      <h2 style={{ margin: '20px 0', color: '#1e293b' }}>Enter Examination Result</h2>
      
      <div style={{ background: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div>
            <label style={labelS}>Student Name / Reg No</label>
            <select style={inputS} value={formData.student} onChange={e => setFormData({...formData, student: e.target.value})} required>
              <option value="">Select Student</option>
              {students.map(s => <option key={s._id} value={s._id}>{s.reg_no} - {s.last_name}</option>)}
            </select>
          </div>

          <div>
            <label style={labelS}>Course Code & Title</label>
            <select style={inputS} value={formData.course} onChange={e => setFormData({...formData, course: e.target.value})} required>
              <option value="">Select Course</option>
              {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.name}</option>)}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelS}>Level</label>
              <select style={inputS} value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})}>
                {[100, 200, 300, 400, 500].map(lvl => <option key={lvl} value={lvl}>{lvl} Level</option>)}
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelS}>Semester</label>
              <select style={inputS} value={formData.semester} onChange={e => setFormData({...formData, semester: e.target.value})}>
                <option value="First">First</option>
                <option value="Second">Second</option>
              </select>
            </div>
          </div>

          <div>
            <label style={labelS}>Examination Mark (0-100)</label>
            <input type="number" placeholder="Enter score" style={inputS} value={formData.mark} onChange={e => setFormData({...formData, mark: e.target.value})} min="0" max="100" required />
          </div>

          <button type="submit" style={primaryBtn}>Save Examination Record</button>
        </form>
      </div>
    </div>
  );
};

const labelS = { display: 'block', fontSize: '13px', fontWeight: '600', color: '#64748b', marginBottom: '5px' };
const backBtn = { textDecoration: 'none', color: '#64748b', fontSize: '14px', fontWeight: '600', background: '#e2e8f0', padding: '8px 15px', borderRadius: '8px', display: 'inline-block' };
const inputS = { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', width: '100%', boxSizing: 'border-box', backgroundColor: '#fff' };
const primaryBtn = { padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', marginTop: '10px' };

export default Results;
