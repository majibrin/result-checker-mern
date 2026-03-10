import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null

  return (
    <nav className="no-print" style={{
      background: '#1e293b', padding: '10px 20px',
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', color: 'white',
      flexWrap: 'wrap', gap: '8px',
    }}>
      <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>ResultSystem</div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        {user.role === 'admin' || user.role === 'lecturer' ? (
          <>
            <NavLink to="/admin/dashboard">Hub</NavLink>
            <NavLink to="/admin/students">Students</NavLink>
            <NavLink to="/admin/courses">Courses</NavLink>
            <NavLink to="/admin/results">Results</NavLink>
          </>
        ) : (
          <NavLink to="/student/dashboard">My Results</NavLink>
        )}
        <button onClick={() => { logout(); navigate('/') }}
          style={{ background: '#dc2626', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}>
          Logout
        </button>
      </div>
    </nav>
  )
}

const NavLink = ({ to, children }) => (
  <Link to={to} style={{ color: 'white', textDecoration: 'none', fontSize: '14px', opacity: 0.85, padding: '4px 8px', borderRadius: '4px' }}>
    {children}
  </Link>
)

export default Navbar
