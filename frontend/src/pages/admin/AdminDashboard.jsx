import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FaUserGraduate, FaBook, FaClipboardList } from 'react-icons/fa'

const cards = [
  { to: '/admin/students', title: 'Students', desc: 'Manage registrations & view login PINs', icon: FaUserGraduate, color: '#2563eb' },
  { to: '/admin/courses',  title: 'Courses',  desc: 'Add and manage department courses',      icon: FaBook,          color: '#16a34a' },
  { to: '/admin/results',  title: 'Results',  desc: 'Input marks and calculate GPAs',         icon: FaClipboardList, color: '#d97706' },
]

const AdminDashboard = () => {
  const { user } = useAuth()
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui' }}>
      <div style={{ padding: '20px', maxWidth: '1100px', margin: '0 auto' }}>
        <h2 style={{ color: '#1e293b', margin: '10px 0 6px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
          Admin Panel: <span style={{ color: '#2563eb' }}>{user?.username}</span>
        </h2>
        <p style={{ color: '#64748b', marginTop: '4px', marginBottom: '24px', fontSize: '14px' }}>
          Welcome back. Manage your academic system below.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {cards.map(card => {
            const Icon = card.icon
            return (
              <Link key={card.to} to={card.to} style={{ textDecoration: 'none', display: 'block' }}>
                <div style={{
                  padding: '24px', background: '#fff',
                  borderRadius: '12px', border: '1px solid #e2e8f0',
                  borderTop: `4px solid ${card.color}`,
                  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
                }}>
                  <Icon size={32} color={card.color} style={{ marginBottom: '12px' }} />
                  <h3 style={{ margin: '0 0 6px', color: '#1e293b', fontSize: '1.1rem' }}>{card.title}</h3>
                  <p style={{ margin: '0 0 14px', color: '#64748b', fontSize: '14px', lineHeight: '1.5' }}>{card.desc}</p>
                  <span style={{ color: card.color, fontWeight: '600', fontSize: '13px' }}>Go to {card.title} →</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
