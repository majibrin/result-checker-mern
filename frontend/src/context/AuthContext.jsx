import { createContext, useState, useEffect, useContext } from 'react'
import API from '../api.js'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const storedUser  = localStorage.getItem('result_user')
      const storedToken = localStorage.getItem('result_token')
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser))
      }
    } catch {
      // Corrupt localStorage — clear it
      localStorage.removeItem('result_user')
      localStorage.removeItem('result_token')
    } finally {
      setLoading(false)
    }
  }, [])

  const login = async (credentials, type = 'student') => {
    try {
      const endpoint = type === 'admin'
        ? API.auth.adminLogin
        : API.auth.studentLogin

      const res = await fetch(endpoint, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(credentials),
      })

      const data = await res.json()

      if (res.ok) {
        localStorage.setItem('result_token', data.token)
        localStorage.setItem('result_user',  JSON.stringify(data.user))
        setUser(data.user)
        return { success: true }
      }

      return { success: false, error: data.error || 'Login failed' }
    } catch {
      return { success: false, error: 'Network error. Please try again.' }
    }
  }

  const logout = () => {
    localStorage.removeItem('result_token')
    localStorage.removeItem('result_user')
    setUser(null)
  }

  const getToken = () => localStorage.getItem('result_token') || ''

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, getToken }}>
      {!loading && children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
