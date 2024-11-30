import { Elysia } from 'elysia'
import { db } from '../../db'
import { refreshTokens } from '../../db/schema/users'
import { eq } from 'drizzle-orm'
import type { LogoutRoute } from '../../types/elysia-route-types'

export const logout = new Elysia()
  .post('/logout', async ({ jwt, set, headers }: LogoutRoute) => {
    try {
      // Obtener el token del header
      const authHeader = headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        set.status = 401
        return {
          success: false,
          message: 'Token no proporcionado'
        }
      }

      const token = authHeader.split(' ')[1]

      // Verificar y decodificar el token
      const payload = await jwt.verify(token)
      if (!payload?.id) {
        set.status = 401
        return {
          success: false,
          message: 'Token inválido'
        }
      }

      // Eliminar todos los refresh tokens del usuario
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.user_id, payload.id))

      return {
        success: true,
        message: 'Sesión cerrada correctamente'
      }

    } catch (error) {
      console.error('Error en logout:', error)
      set.status = 500
      return {
        success: false,
        message: 'Error al cerrar sesión'
      }
    }
  }) 