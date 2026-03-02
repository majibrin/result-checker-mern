import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui' }}>
      <div style={{ padding: '20px' }}>
        <h2 style={{ color: '#1e293b', margin: '10px 0 25px 0', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
          Admin Panel: <span style={{ color: '#2563eb' }}>{user?.username}</span>
        </h2>

        <div style={{ display: 'grid', gap: '15px' }}>
          <DashboardCard to="/admin/students" title="Students" desc="Manage registrations & view login PINs" />
          <DashboardCard to="/admin/courses" title="Courses" desc="Add and manage department courses" />
          <DashboardCard to="/admin/results" title="Results" desc="Input marks and calculate GPAs" />
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ to, title, desc }) => (
  <Link to={to} style={{ textDecoration: 'none', display: 'block', padding: '25px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
    <h3 style={{ margin: '0 0 5px 0', color: '#1e293b' }}>{title}</h3>
    <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>{desc}</p>
  </Link>
);

export default AdminDashboard;
