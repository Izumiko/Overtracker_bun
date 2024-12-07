/**
 * @file refresh.ts
 * @description Refresh route
 */

import { Elysia, t } from 'elysia'
import { db } from '../../db'
import { users, refreshTokens } from '../../db/schema/users'
import { eq, and, lt } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import type { RefreshRoute } from '../../types/elysia-route-types'
import { userSchema, errorSchema } from '../../types/swagger-schemas'

export const refresh = new Elysia()
  .post('/refresh', async ({ body, set, jwt }: RefreshRoute) => {
    const { refresh_token } = body

    try {
      // Search for the refresh token and verify that it has not expired
      const [tokenData] = await db
        .select()
        .from(refreshTokens)
        .where(
          and(
            eq(refreshTokens.token, refresh_token),
            lt(refreshTokens.expires_at, new Date())
          )
        )
        .limit(1)

      if (!tokenData) {
        set.status = 401
        return {
          success: false,
          message: 'Token de refresco inválido o expirado'
        }
      }

      // Get user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, tokenData.user_id))
        .limit(1)

      if (!user) {
        set.status = 401
        return {
          success: false,
          message: 'Usuario no encontrado'
        }
      }

      // Generate new access token
      const access_token = await jwt.sign({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        verified: user.verified
      })

      // Generate new refresh token
      const new_refresh_token = randomUUID()
      const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

      // Delete previous refresh token
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.id, tokenData.id))

      // Save new refresh token
      await db
        .insert(refreshTokens)
        .values({
          user_id: user.id,
          token: new_refresh_token,
          expires_at
        })

      return {
        success: true,
        access_token,
        refresh_token: new_refresh_token
      }

    } catch (error) {
      console.error('Refresh token error:', error)
      set.status = 500
      return {
        success: false,
        message: 'Error al refrescar el token'
      }
    }
  }, {
    body: t.Object({
      refresh_token: t.String()
    }),
    detail: {
      tags: ['Auth'],
      summary: 'Refresh access token',
      description: 'Generates a new access token using a valid refresh token',
      responses: {
        200: {
          description: 'Token refrescado correctamente',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', default: true },
                  access_token: { type: 'string' },
                  refresh_token: { type: 'string' }
                }
              }
            }
          }
        },
        401: {
          description: 'Invalid or expired refresh token',
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