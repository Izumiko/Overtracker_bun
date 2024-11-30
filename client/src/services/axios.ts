import axios from 'axios'
import { authService } from './auth.service'
import { showNotification } from '@/utils/notifications'

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
})

// Interceptor para agregar el token a las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para manejar errores y token expirado
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Si el token expiró y no es un retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      // Aquí podrías implementar refresh token
      authService.logout()
      showNotification.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.')
      window.location.href = '/auth/login'
      
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

export default axiosInstance 