import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(formData, 'admin');
    if (result.success) navigate('/admin/dashboard');
    else setError(result.error || 'Invalid Admin Credentials');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
        <h2 style={{ color: '#1e293b', textAlign: 'center', marginBottom: '25px', fontSize: '1.6rem' }}>Admin Portal</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div style={groupS}>
            <label style={labelS}>Username</label>
            <input type="text" style={inputS} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
          </div>

          <div style={groupS}>
            <label style={labelS}>Password</label>
            <input type="password" style={inputS} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
          </div>

          {error && <p style={{ color: '#dc2626', fontSize: '14px', textAlign: 'center' }}>{error}</p>}

          <button type="submit" style={btnS}>Secure Login</button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <Link to="/login/student" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            ← Back to Student Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

const groupS = { display: 'flex', flexDirection: 'column', gap: '5px' };
const labelS = { fontSize: '13px', fontWeight: '600', color: '#64748b' };
const inputS = { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '16px' };
const btnS = { padding: '14px', background: '#1e293b', color: 'white', border: 'none', borderRadius: '8px', fontWeight: '700', fontSize: '16px', cursor: 'pointer', marginTop: '10px' };

export default AdminLogin;
