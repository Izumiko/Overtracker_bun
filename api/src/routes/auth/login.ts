/**
 * @file login.ts
 * @description Login route
 */

import { Elysia, t } from 'elysia'
import { db } from '../../db'
import { users, refreshTokens } from '../../db/schema/users'
import { eq } from 'drizzle-orm'
// import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'
import type { LoginRoute } from '../../types/elysia-route-types'
import { userSchema, errorSchema } from '../../types/swagger-schemas'

export const login = new Elysia()
  .post('/login', async ({ body, set, jwt }: LoginRoute) => {
    const { username, password } = body

    try {
      // Search user by username
      const user = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1)
        .then(rows => rows[0])

      // If the user does not exist or the password is incorrect
      // if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      if (!user || !(await Bun.password.verify(password, user.password_hash))) {
        set.status = 401
        return {
          success: false,
          message: 'Usuario o contraseña incorrectos'
        }
      }

      // Generate access token
      const access_token = await jwt.sign({
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        verified: user.verified
      })

      // Generate refresh token
      const refresh_token = randomUUID()
      const expires_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days

      // Save refresh token
      await db
        .insert(refreshTokens)
        .values({
          user_id: user.id,
          token: refresh_token,
          expires_at
        })

      // Update last login
      await db
        .update(users)
        .set({
          last_login: new Date(),
          updated_at: new Date()
        })
        .where(eq(users.id, user.id))

      return {
        success: true,
        message: 'Login successful',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          verified: user.verified,
          last_login: user.last_login,
          created_at: user.created_at,
          passkey: user.passkey
        },
        access_token,
        refresh_token
      }

    } catch (error) {
      console.error('Login error:', error)
      set.status = 500
      return {
        success: false,
        message: 'Error al iniciar sesión'
      }
    }
  }, {
    body: t.Object({
      username: t.String(),
      password: t.String()
    }),
    detail: {
      tags: ['Auth'],
      summary: 'Login',
      description: 'Authenticates a user and returns the access tokens',
      responses: {
        200: {
          description: 'Login successful',
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  success: { type: 'boolean', default: true },
                  message: { type: 'string' },
                  user: userSchema,
                  access_token: { type: 'string' },
                  refresh_token: { type: 'string' }
                }
              }
            }
          }
        },
        401: {
          description: 'Invalid credentials',
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