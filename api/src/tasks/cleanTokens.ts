import { db } from '../db'
import { refreshTokens } from '../db/schema/users'
import { lt } from 'drizzle-orm'

export async function cleanExpiredTokens() {
  try {
    const now = new Date()
    const result = await db
      .delete(refreshTokens)
      .where(lt(refreshTokens.expires_at, now))
      .returning({ id: refreshTokens.id })

    if (result.length > 0) {
      console.log(`🧹 Limpiados ${result.length} tokens expirados`)
    }
  } catch (error) {
    console.error('Error limpiando tokens expirados:', error)
  }
} 