import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [formData, setFormData] = useState({ reg_no: '', first_name: '', last_name: '', department: '', level: 100 });
  const [editingId, setEditingId] = useState(null);
  const [generated, setGenerated] = useState(null);
  const token = localStorage.getItem('result_token') || "";

  const fetchStudents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/students', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setStudents(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId ? `http://localhost:5000/api/students/${editingId}` : 'http://localhost:5000/api/students';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(formData)
    });
    const data = await res.json();

    if (res.ok) {
      if (!editingId) setGenerated({ reg: data.student.reg_no, pin: data.generated_pin });
      setEditingId(null);
      setFormData({ reg_no: '', first_name: '', last_name: '', department: '', level: 100 });
      fetchStudents();
    }
  };

  const deleteStudent = async (id) => {
    if (!window.confirm("Are you sure? This will delete all results for this student!")) return;
    const res = await fetch(`http://localhost:5000/api/students/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchStudents();
  };

  const startEdit = (s) => {
    setEditingId(s._id);
    setFormData({ reg_no: s.reg_no, first_name: s.first_name, last_name: s.last_name, department: s.department, level: s.level });
    window.scrollTo(0,0);
  };

  return (
    <div style={{ padding: '15px', maxWidth: '100%', boxSizing: 'border-box', fontFamily: 'system-ui', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <Link to="/admin/dashboard" style={{ textDecoration: 'none', color: '#2563eb', fontWeight: '600' }}>← Dashboard</Link>
      <h2 style={{ color: '#1e293b', margin: '20px 0' }}>{editingId ? 'Edit Student' : 'Student Management'}</h2>

      {generated && (
        <div style={{ background: '#fff3cd', padding: '15px', border: '1px solid #ffeeba', borderRadius: '12px', marginBottom: '20px' }}>
          <h4 style={{ margin: '0 0 5px 0' }}>✅ Account Created</h4>
          <p>Reg No: <strong>{generated.reg}</strong> | PIN: <strong style={{ color: '#dc2626' }}>{generated.pin}</strong></p>
          <button onClick={() => setGenerated(null)}>Close</button>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', marginBottom: '25px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input placeholder="Registration Number" value={formData.reg_no} onChange={e => setFormData({...formData, reg_no: e.target.value.toUpperCase()})} required style={iS} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <input placeholder="First Name" value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} required style={{...iS, flex: 1}} />
            <input placeholder="Last Name" value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} required style={{...iS, flex: 1}} />
          </div>
          <input placeholder="Department" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} required style={iS} />
          <select value={formData.level} onChange={e => setFormData({...formData, level: e.target.value})} style={iS}>
            {[100, 200, 300, 400, 500].map(lvl => <option key={lvl} value={lvl}>{lvl} Level</option>)}
          </select>
          <button type="submit" style={{...primaryBtn, background: editingId ? '#059669' : '#2563eb'}}>
            {editingId ? 'Update Student Details' : 'Register Student'}
          </button>
          {editingId && <button type="button" onClick={() => {setEditingId(null); setFormData({reg_no:'',first_name:'',last_name:'',department:'',level:100})}} style={{background:'none', border:'none', color:'#dc2626'}}>Cancel</button>}
        </div>
      </form>

      <div style={{ display: 'grid', gap: '12px' }}>
        {students.map(s => (
          <div key={s._id} style={{ padding: '16px', borderRadius: '12px', background: '#fff', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#2563eb' }}>{s.reg_no}</div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e293b' }}>{s.first_name} {s.last_name}</div>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{s.department}</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                 <button onClick={() => startEdit(s)} style={actionBtn}>Edit</button>
                 <button onClick={() => deleteStudent(s._id)} style={{...actionBtn, color:'#dc2626'}}>Del</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const iS = { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px', width: '100%', boxSizing: 'border-box' };
const primaryBtn = { padding: '14px', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '16px' };
const actionBtn = { background: '#f1f5f9', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: '600' };

export default Students;
