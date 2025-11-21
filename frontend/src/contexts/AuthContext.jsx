import React, { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext()

const API_BASE_URL = import.meta.env.VITE_API_URL || ''

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      console.log('🔐 Auth Check - Token exists:', !!token)
      
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`)
        console.log('👤 User data from API:', response.data)
        setUser(response.data)
      } else {
        console.log('❌ No token found')
      }
    } catch (error) {
      console.error('🔴 Auth check failed:', error)
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      console.log('🚀 Login attempt for:', email)
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, { email, password })
      const { token, ...userData } = response.data
      
      console.log('✅ Login successful, user data:', userData)
      
      localStorage.setItem('token', token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      setUser(userData)
      
      return { success: true }
    } catch (error) {
      console.error('🔴 Login failed:', error)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      }
    }
  }

  const logout = () => {
    console.log('👋 Logging out user:', user)
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    login,
    logout,
    loading
  }

  console.log('🔄 AuthContext state - User:', user, 'Loading:', loading)

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext