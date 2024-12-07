/**
 * @file index.ts
 * @description Main file
 */

import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { jwt } from '@elysiajs/jwt'
import { swagger } from '@elysiajs/swagger'
import { initializeDatabase } from './db'
import { auth } from './routes/auth'
import { cleanExpiredTokens } from './tasks/cleanTokens'
import { torrents } from './routes/torrents'

declare module 'elysia' {
  interface ElysiaConfig {
    'jwt': typeof jwt
  }

  interface SecurityScheme {
    [key: string]: any[]
  }

  interface SwaggerDetail {
    tags?: string[]
    summary?: string
    description?: string
    security?: SecurityScheme[]
    responses: Record<number, SwaggerResponse>
  }
}

const app = new Elysia()
  .use(cors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }))
  .use(swagger({
    documentation: {
      info: {
        title: 'API de OverTracker',
        version: '1.0.0',
        description: 'API para el tracker de torrents privado'
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      security: [
        {
          bearerAuth: []
        }
      ]
    }
  }))
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'tu-secreto'
  }))

  // Group routes by functionality
  .group('/api/v1', app => app
    .use(auth)
    .use(torrents)
  )

// Initialize the database before starting the server
await initializeDatabase()
  .then(() => {
    const port = Number(process.env.PORT) || 1337
    app.listen(port)
    
    console.log('\n🚀 Server started correctly:')
    console.log(`📡 API running on: http://localhost:${port}/api/v1`)
    console.log(`📚 Swagger documentation: http://localhost:${port}/swagger`)
    console.log(`🔑 JWT activated and configured`)
    console.log(`👥 CORS configured for: ${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}\n`)

    // Schedule cleanup every 24 hours
    setInterval(cleanExpiredTokens, 24 * 60 * 60 * 1000)
    // First cleanup when starting
    cleanExpiredTokens()
  })
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  }) 