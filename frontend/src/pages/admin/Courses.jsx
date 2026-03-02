import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({ name: '', code: '', unit: 3, lecturer: '' });
  const token = localStorage.getItem('result_token') || "";

  const fetchCourses = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/courses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setCourses(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    if (res.ok) {
      fetchCourses();
      setFormData({ name: '', code: '', unit: 3, lecturer: '' });
    }
  };

  return (
    <div style={{ padding: '15px', maxWidth: '100%', boxSizing: 'border-box', fontFamily: 'system-ui', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: '600' }}>← Dashboard</Link>
      <h2 style={{ color: '#1e293b', margin: '20px 0' }}>Course Catalog</h2>

      {/* Standardized Form */}
      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '25px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input placeholder="Course Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required style={inputStyle} />
          <input placeholder="Code (e.g. CSC101)" value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required style={inputStyle} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input type="number" value={formData.unit} onChange={e => setFormData({...formData, unit: e.target.value})} min="1" max="6" required style={{...inputStyle, flex: 1}} />
            <input placeholder="Lecturer" value={formData.lecturer} onChange={e => setFormData({...formData, lecturer: e.target.value})} required style={{...inputStyle, flex: 2}} />
          </div>
          <button type="submit" style={primaryBtn}>Add New Course</button>
        </div>
      </form>

      {/* Standardized Card List */}
      <div style={{ display: 'grid', gap: '12px' }}>
        {courses.map(c => (
          <div key={c._id} style={{ padding: '16px', borderRadius: '12px', background: '#fff', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb', textTransform: 'uppercase' }}>{c.code}</div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{c.name}</div>
              <div style={{ fontSize: '13px', color: '#64748b' }}>{c.lecturer}</div>
            </div>
            <div style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', color: '#475569' }}>
              {c.unit}U
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', width: '100%', boxSizing: 'border-box', outline: 'none' };
const primaryBtn = { padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '16px' };

export default Courses;
