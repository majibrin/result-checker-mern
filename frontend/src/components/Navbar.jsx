import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav style={{ background: '#1e293b', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white' }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>ResultSystem</div>
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
        {user.role === 'admin' ? (
          <>
            <Link to="/admin/dashboard" style={linkS}>Hub</Link>
            <Link to="/admin/students" style={linkS}>Students</Link>
          </>
        ) : (
          <Link to="/student/dashboard" style={linkS}>My Results</Link>
        )}
        <button onClick={() => { logout(); navigate('/'); }} style={logoutBtn}>Logout</button>
      </div>
    </nav>
  );
};

const linkS = { color: 'white', textDecoration: 'none', fontSize: '0.9rem', opacity: 0.9 };
const logoutBtn = { background: '#dc2626', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' };

export default Navbar;
