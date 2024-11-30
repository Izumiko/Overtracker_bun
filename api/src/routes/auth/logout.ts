import { Elysia } from 'elysia'
import { db } from '../../db'
import { refreshTokens } from '../../db/schema/users'
import { eq } from 'drizzle-orm'
import type { LogoutRoute } from '../../types/elysia-route-types'
import { errorSchema } from '../../types/swagger-schemas'

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
  }, {
    detail: {
      tags: ['Auth'],
      summary: 'Cerrar sesión',
      description: 'Invalida el token de acceso y elimina los refresh tokens del usuario',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Sesión cerrada correctamente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', default: true },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        401: {
          description: 'Token no proporcionado o inválido',
          content: {
            'application/json': {
              schema: errorSchema
            }
          }
        },
        500: {
          description: 'Error del servidor',
          content: {
            'application/json': {
              schema: errorSchema
            }
          }
        }
      }
    }
  }) 