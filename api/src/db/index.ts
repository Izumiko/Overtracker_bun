import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema/users'

// Cliente SQL para migraciones
const migrationClient = postgres(process.env.DATABASE_URL!, {
  max: 1,
  onnotice: () => {}
})

// Cliente SQL para la aplicación
const queryClient = postgres(process.env.DATABASE_URL!)
export const db = drizzle(queryClient, { schema })

// Función para crear las tablas si no existen
export async function initializeDatabase() {
  try {
    // 1. Crear extensiones necesarias
    await migrationClient`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `
    await migrationClient`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto"
    `

    // 2. Crear el tipo enum para roles
    await migrationClient`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    // 3. Eliminar la tabla si existe (durante desarrollo)
    await migrationClient`
      DROP TABLE IF EXISTS users CASCADE
    `

    // 4. Crear tabla users con el nuevo esquema
    await migrationClient`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role user_role NOT NULL DEFAULT 'user',
        verified BOOLEAN NOT NULL DEFAULT false,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // 5. Crear índices
    await migrationClient`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `
    await migrationClient`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `
    await migrationClient`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)
    `
    await migrationClient`
      CREATE INDEX IF NOT EXISTS idx_users_verified ON users(verified)
    `
    await migrationClient`
      CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login)
    `
    
    // Crear tabla de refresh tokens
    await migrationClient`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    await migrationClient`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user ON refresh_tokens(user_id)
    `
    await migrationClient`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at)
    `

    console.log('✅ Base de datos inicializada correctamente')
  } catch (error) {
    console.error('❌ Error inicializando la base de datos:', error)
    throw error
  } finally {
    await migrationClient.end()
  }
} 