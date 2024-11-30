'use client'

import { useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePathname, useRouter } from 'next/navigation'

const publicRoutes = ['/auth/login', '/auth/register', '/']
const authRoutes = ['/auth/login', '/auth/register']

export default function AuthInit({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    // Si la ruta requiere autenticación y el usuario no está autenticado
    if (!publicRoutes.includes(pathname) && !isAuthenticated) {
      router.push('/auth/login')
    }

    // Si el usuario está autenticado y está en una ruta de auth
    if (isAuthenticated && authRoutes.includes(pathname)) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, pathname, router])

  return <>{children}</>
} 