/**
 * @file logout.ts
 * @description Logout route
 */

import { Elysia } from 'elysia'
import { db } from '../../db'
import { refreshTokens } from '../../db/schema/users'
import { eq } from 'drizzle-orm'
import type { LogoutRoute } from '../../types/elysia-route-types'
import { errorSchema } from '../../types/swagger-schemas'

export const logout = new Elysia()
  .post('/logout', async ({ jwt, set, headers }: LogoutRoute) => {
    try {
      // Get the token from the header
      const authHeader = headers.authorization
      if (!authHeader?.startsWith('Bearer ')) {
        set.status = 401
        return {
          success: false,
          message: 'Token no proporcionado'
        }
      }

      const token = authHeader.split(' ')[1]

      // Verify and decode the token
      const payload = await jwt.verify(token)
      if (!payload?.id) {
        set.status = 401
        return {
          success: false,
          message: 'Token inválido'
        }
      }

      // Delete all refresh tokens for the user
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.user_id, payload.id))

      return {
        success: true,
        message: 'Session closed successfully'
      }

    } catch (error) {
      console.error('Logout error:', error)
      set.status = 500
      return {
        success: false,
        message: 'Error al cerrar sesión'
      }
    }
  }, {
    detail: {
      tags: ['Auth'],
      summary: 'Logout',
      description: 'Invalidates the access token and deletes the user\'s refresh tokens',
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: 'Session closed successfully',
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
          description: 'Token not provided or invalid',
          content: {
            'application/json': {
              schema: errorSchema
            }
          }
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: errorSchema
            }
          }
        }
      }
    }
  }) 