import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const StudentLogin = () => {
  const [formData, setFormData] = useState({ reg_no: '', pin: '' });
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(formData, 'student');
    if (result.success) navigate('/student/dashboard');
    else setError(result.error || 'Invalid Registration Number or PIN');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', fontFamily: 'system-ui' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: '#fff', padding: '30px', borderRadius: '16px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: '#2563eb', margin: '0 0 10px 0', fontSize: '1.8rem' }}>Student Portal</h2>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Enter credentials to check results</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" 
            placeholder="Reg No (e.g. UG22/SCCS/1007)" 
            style={inputS}
            onChange={(e) => setFormData({ ...formData, reg_no: e.target.value.toUpperCase() })}
            required 
          />
          <input 
            type="password" 
            placeholder="6-Digit PIN" 
            style={inputS}
            onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
            required 
          />
          
          {error && <p style={{ color: '#dc2626', fontSize: '14px', textAlign: 'center', margin: 0 }}>{error}</p>}

          <button type="submit" style={btnS}>Check Results</button>
        </form>

        <div style={{ marginTop: '25px', textAlign: 'center' }}>
          <Link to="/login/admin" style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
            Staff/Admin Login
          </Link>
        </div>
      </div>
    </div>
  );
};

const inputS = { padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '16px', width: '100%', boxSizing: 'border-box', backgroundColor: '#fdfdfd' };
const btnS = { padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '10px', transition: '0.2s' };

export default StudentLogin;
