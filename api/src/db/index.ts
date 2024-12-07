/**
 * @file index.ts
 * @description Database index file
 */

import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// SQL client for migrations
const migrationClient = postgres(process.env.DATABASE_URL!, {
  max: 1,
  onnotice: () => {}
})

// SQL client for the application
const queryClient = postgres(process.env.DATABASE_URL!)
export const db = drizzle(queryClient, { schema })

// Update initializeDatabase to include the new tables
export async function initializeDatabase() {
  try {
    // 1. Create necessary extensions
    await migrationClient`
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp"
    `
    await migrationClient`
      CREATE EXTENSION IF NOT EXISTS "pgcrypto"
    `

    // 2. Create the user role enum
    await migrationClient`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('user', 'moderator', 'admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    // 3. Drop the table if it exists (during development)
    await migrationClient`
      DROP TABLE IF EXISTS users CASCADE
    `

    // 4. Create users table with the new schema
    await migrationClient`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        passkey VARCHAR(32) UNIQUE NOT NULL,
        role user_role NOT NULL DEFAULT 'user',
        verified BOOLEAN NOT NULL DEFAULT false,
        last_login TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `
    
    // 5. Create indices
    await migrationClient`
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)
    `
    await migrationClient`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `
    await migrationClient`
      CREATE INDEX IF NOT EXISTS idx_users_passkey ON users(passkey)
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
    
    // Create refresh tokens table
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

    // Create torrent version enum
    await migrationClient`
      DO $$ BEGIN
        CREATE TYPE torrent_version AS ENUM ('v1', 'v2', 'hybrid');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `

    // Create torrents table
    await migrationClient`
      CREATE TABLE IF NOT EXISTS torrents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        info_hash VARCHAR(40) NOT NULL UNIQUE,
        info_hash_v2 VARCHAR(64),
        version torrent_version NOT NULL,
        category VARCHAR(50) NOT NULL,
        uploader_id UUID NOT NULL REFERENCES users(id),
        size VARCHAR(20) NOT NULL,
        file_count INTEGER NOT NULL,
        tags TEXT[],
        files JSONB NOT NULL,
        piece_length INTEGER NOT NULL,
        private BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Create torrent_stats table
    await migrationClient`
      CREATE TABLE IF NOT EXISTS torrent_stats (
        torrent_id UUID PRIMARY KEY REFERENCES torrents(id),
        seeders INTEGER NOT NULL DEFAULT 0,
        leechers INTEGER NOT NULL DEFAULT 0,
        completed INTEGER NOT NULL DEFAULT 0,
        last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `

    console.log('✅ Database initialized successfully')
  } catch (error) {
    console.error('❌ Error initializing the database:', error)
    throw error
  } finally {
    await migrationClient.end()
  }
} 