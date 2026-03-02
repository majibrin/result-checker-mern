import { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🛡️ Security: Check localStorage on boot to restore session
    const storedUser = localStorage.getItem('result_user');
    const storedToken = localStorage.getItem('result_token');
    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (credentials, type = 'student') => {
    const endpoint = type === 'admin' ? '/api/auth/admin/login' : '/api/auth/student/login';
    
    const res = await fetch(`http://localhost:5000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    const data = await res.json();

    if (res.ok) {
      // 🛡️ Security: Store JWT securely for subsequent API calls
      localStorage.setItem('result_token', data.token);
      localStorage.setItem('result_user', JSON.stringify(data.user));
      setUser(data.user);
      return { success: true };
    } else {
      return { success: false, error: data.error };
    }
  };

  const logout = () => {
    localStorage.removeItem('result_token');
    localStorage.removeItem('result_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
