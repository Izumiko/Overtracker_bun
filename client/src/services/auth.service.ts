import axios, { AxiosError } from 'axios'

export interface LoginResponse {
  success: boolean
  message: string
  user?: {
    id: string
    username: string
    email: string
    role: string
    verified: boolean
    last_login: string
    created_at: string
    passkey: string
  }
  access_token?: string
  refresh_token?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

class AuthService {
  private tokenKey = 'auth_token'
  private refreshTokenKey = 'refresh_token'
  private userKey = 'user_data'
  private tokenExpirationKey = 'token_expiration'

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await axios.post<LoginResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        credentials
      )

      if (response.data.success && response.data.access_token) {
        this.setToken(response.data.access_token)
        if (response.data.refresh_token) {
          this.setRefreshToken(response.data.refresh_token)
        }
        this.setUser(response.data.user!)
        this.setTokenExpiration(new Date(Date.now() + 24 * 60 * 60 * 1000))
      }

      return response.data
    } catch (error) {
      if (error instanceof AxiosError) {
        return {
          success: false,
          message: error.response?.data?.message || 'Error al iniciar sesión'
        }
      }
      return {
        success: false,
        message: 'Error al iniciar sesión'
      }
    }
  }

  logout() {
    // Limpiar localStorage
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.refreshTokenKey)
    localStorage.removeItem(this.userKey)
    localStorage.removeItem(this.tokenExpirationKey)

    // Limpiar cookies
    const cookies = [this.tokenKey, this.refreshTokenKey]
    cookies.forEach(name => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    })

    // Opcional: Invalidar token en el servidor
    this.invalidateToken().catch(console.error)
  }

  private async invalidateToken() {
    const token = this.getToken()
    if (token) {
      try {
        await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, null, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
      } catch (error) {
        // Ignorar errores al invalidar el token
        console.warn('Error al invalidar token:', error)
      }
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(this.tokenKey)
    }
    return null
  }

  getUser() {
    if (typeof window !== 'undefined') {
      const user = localStorage.getItem(this.userKey)
      return user ? JSON.parse(user) : null
    }
    return null
  }

  private setToken(token: string) {
    localStorage.setItem(this.tokenKey, token)
    document.cookie = `${this.tokenKey}=${token}; path=/; max-age=86400`
  }

  private setUser(user: LoginResponse['user']) {
    localStorage.setItem(this.userKey, JSON.stringify(user))
  }

  isAuthenticated(): boolean {
    const token = this.getToken()
    const expiration = this.getTokenExpiration()
    
    if (!token || !expiration) {
      return false
    }

    if (new Date(expiration) < new Date()) {
      this.logout()
      return false
    }

    return true
  }

  private setTokenExpiration(date: Date) {
    localStorage.setItem(this.tokenExpirationKey, date.toISOString())
  }

  private getTokenExpiration(): string | null {
    return localStorage.getItem(this.tokenExpirationKey)
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refresh_token = localStorage.getItem(this.refreshTokenKey)
      
      if (!refresh_token) {
        return false
      }

      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
        refresh_token
      })

      if (response.data.success) {
        this.setToken(response.data.access_token)
        this.setRefreshToken(response.data.refresh_token)
        this.setTokenExpiration(new Date(Date.now() + 24 * 60 * 60 * 1000))
        return true
      }

      return false
    } catch {
      return false
    }
  }

  private setRefreshToken(token: string) {
    localStorage.setItem(this.refreshTokenKey, token)
  }
}

export const authService = new AuthService() 