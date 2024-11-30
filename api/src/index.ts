import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { jwt } from '@elysiajs/jwt'
import { swagger } from '@elysiajs/swagger'
import { initializeDatabase } from './db'
import { auth } from './routes/auth'

const app = new Elysia()
  .use(cors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }))
  .use(swagger({
    documentation: {
      info: {
        title: 'API de OPTracker',
        version: '1.0.0',
        description: 'API para el tracker de torrents privado'
      }
    }
  }))
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'tu-secreto'
  }))

  // Agrupar rutas por funcionalidad
  .group('/api/v1', app => app
    .use(auth)
  )

// Inicializar la base de datos antes de arrancar el servidor
await initializeDatabase()
  .then(() => {
    const port = process.env.PORT || 1337
    app.listen(port)
    
    console.log('\n🚀 Servidor iniciado correctamente:')
    console.log(`📡 API corriendo en: http://localhost:${port}/api/v1`)
    console.log(`📚 Documentación Swagger: http://localhost:${port}/swagger`)
    console.log(`🔑 JWT activado y configurado`)
    console.log(`👥 CORS configurado para: ${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000'}\n`)
  })
  .catch(error => {
    console.error('Error fatal:', error)
    process.exit(1)
  }) 