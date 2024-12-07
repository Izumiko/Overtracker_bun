/**
 * @file cleanTokens.ts
 * @description Clean expired tokens task
 */

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
      console.log(`🧹 Cleaned ${result.length} expired tokens`)
    }
  } catch (error) {
    console.error('Error cleaning expired tokens:', error)
  }
} 
