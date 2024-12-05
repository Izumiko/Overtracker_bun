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

  // Agrupar rutas por funcionalidad
  .group('/api/v1', app => app
    .use(auth)
    .use(torrents)
  )

// Inicializar la base de datos antes de arrancar el servidor
await initializeDatabase()
  .then(() => {
    const port = Number(process.env.PORT) || 1337
    app.listen(port)
    
    console.log('\n🚀 Servidor iniciado correctamente:')
    console.log(`📡 API corriendo en: http://localhost:${port}/api/v1`)
    console.log(`📚 Documentación Swagger: http://localhost:${port}/swagger`)
    console.log(`🔑 JWT activado y configurado`)
    console.log(`👥 CORS configurado para: ${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}\n`)

    // Programar limpieza de tokens cada 24 horas
    setInterval(cleanExpiredTokens, 24 * 60 * 60 * 1000)
    // Primera limpieza al iniciar
    cleanExpiredTokens()
  })
  .catch(error => {
    console.error('Error fatal:', error)
    process.exit(1)
  }) 