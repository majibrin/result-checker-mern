const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const API = {
  base: BASE_URL,

  auth: {
    studentLogin: `${BASE_URL}/api/auth/student/login`,
    adminLogin:   `${BASE_URL}/api/auth/admin/login`,
  },
  students: {
    all:    `${BASE_URL}/api/students`,
    byId:   (id) => `${BASE_URL}/api/students/${id}`,
  },
  courses: {
    all:    `${BASE_URL}/api/courses`,
    byId:   (id) => `${BASE_URL}/api/courses/${id}`,
  },
  results: {
    all:         `${BASE_URL}/api/results`,
    byStudent:   (id) => `${BASE_URL}/api/results/student/${id}`,
  },
}

export const authHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('result_token') || ''}`,
  'Content-Type': 'application/json',
})

export default API
