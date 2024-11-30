import { Elysia, t } from 'elysia'
import { db } from '../../db'
import { users, refreshTokens } from '../../db/schema/users'
import { eq, and, lt } from 'drizzle-orm'
import { randomUUID } from 'crypto'
import type { RefreshRoute } from '../../types/elysia-route-types'

export const refresh = new Elysia()
  .post('/refresh', async ({ body, set, jwt }: RefreshRoute) => {
    const { refresh_token } = body

    try {
      // Buscar el refresh token y verificar que no haya expirado
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

      // Obtener usuario
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

      // Generar nuevo access token
      const access_token = await jwt.sign({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        verified: user.verified
      })

      // Generar nuevo refresh token
      const new_refresh_token = randomUUID()
      const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días

      // Eliminar el refresh token anterior
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.id, tokenData.id))

      // Guardar nuevo refresh token
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
      console.error('Error en refresh token:', error)
      set.status = 500
      return {
        success: false,
        message: 'Error al refrescar el token'
      }
    }
  }, {
    body: t.Object({
      refresh_token: t.String()
    })
  }) 