/**
 * @file passkey.ts
 * @description Passkey utils
 */

import { randomUUID, createHash } from 'crypto'
import { db } from '../db'
import { users } from '../db/schema/users'
import { eq } from 'drizzle-orm'

// Regular expression to validate the format of the passkey
// Must contain exactly 32 hexadecimal characters
const PASSKEY_REGEX = /^[a-f0-9]{32}$/

export function isValidPasskey(passkey: string): boolean {
  return PASSKEY_REGEX.test(passkey)
}

export async function generateUniquePasskey(): Promise<string> {
  const maxAttempts = 10 // Avoid infinite loop in case of error
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      // Generate random initial passkey using specific charset
      const charset = 'abcdefghijklmnopqrstuvwxyz0123456789'
      let initialPasskey = ''
      for (let i = 0; i < 32; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        initialPasskey += charset[randomIndex]
      }

      // Add unique components to ensure uniqueness
      const uniqueComponent = `${randomUUID()}-${Date.now()}`
      const combined = `${initialPasskey}-${uniqueComponent}`

      // Hash the combination with SHA-256
      const passkey = createHash('sha256')
        .update(combined)
        .digest('hex')
        .slice(0, 32)

      // Verify the format
      if (!isValidPasskey(passkey)) {
        attempts++
        continue
      }

      // Verify that it does not exist in the database
      const existingUser = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.passkey, passkey))
        .limit(1)

      if (existingUser.length === 0) {
        return passkey
      }

      attempts++
    } catch (error) {
      console.error('Error generating passkey:', error)
      attempts++
    }
  }

  throw new Error('Could not generate a unique passkey after several attempts')
}

// Function to format the passkey for display (groups of 4 characters)
export function formatPasskey(passkey: string): string {
  return passkey.replace(/(.{4})/g, '$1-').slice(0, -1)
}

// Function to clean the format of the passkey
export function cleanPasskey(passkey: string): string {
  return passkey.replace(/[^a-f0-9]/g, '')
} 