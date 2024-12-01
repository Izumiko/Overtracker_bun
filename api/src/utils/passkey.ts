import { randomUUID, createHash } from 'crypto'
import { db } from '../db'
import { users } from '../db/schema/users'
import { eq } from 'drizzle-orm'

// Expresión regular para validar el formato del passkey
// Debe contener exactamente 32 caracteres hexadecimales
const PASSKEY_REGEX = /^[a-f0-9]{32}$/

export function isValidPasskey(passkey: string): boolean {
  return PASSKEY_REGEX.test(passkey)
}

export async function generateUniquePasskey(): Promise<string> {
  const maxAttempts = 10 // Evitar bucle infinito en caso de error
  let attempts = 0

  while (attempts < maxAttempts) {
    try {
      // Generar passkey aleatorio inicial usando charset específico
      const charset = 'abcdefghijklmnopqrstuvwxyz0123456789'
      let initialPasskey = ''
      for (let i = 0; i < 32; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length)
        initialPasskey += charset[randomIndex]
      }

      // Añadir componentes únicos para garantizar irrepetibilidad
      const uniqueComponent = `${randomUUID()}-${Date.now()}`
      const combined = `${initialPasskey}-${uniqueComponent}`

      // Hashear la combinación con SHA-256
      const passkey = createHash('sha256')
        .update(combined)
        .digest('hex')
        .slice(0, 32)

      // Verificar el formato
      if (!isValidPasskey(passkey)) {
        attempts++
        continue
      }

      // Verificar que no exista en la base de datos
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
      console.error('Error generando passkey:', error)
      attempts++
    }
  }

  throw new Error('No se pudo generar un passkey único después de varios intentos')
}

// Función para formatear el passkey para mostrar (grupos de 4 caracteres)
export function formatPasskey(passkey: string): string {
  return passkey.replace(/(.{4})/g, '$1-').slice(0, -1)
}

// Función para limpiar el formato del passkey
export function cleanPasskey(passkey: string): string {
  return passkey.replace(/[^a-f0-9]/g, '')
} 