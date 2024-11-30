'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, LoginCredentials, LoginResponse } from '@/services/auth.service'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: LoginResponse['user'] | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<LoginResponse>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = () => {
      if (authService.isAuthenticated()) {
        const savedUser = authService.getUser()
        setUser(savedUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials)
      if (response.success && response.user) {
        setUser(response.user)
        await router.push('/dashboard')
      }
      return response
    } catch (error) {
      console.error('Error en login:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      setUser(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('Error durante el logout:', error)
    }
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 