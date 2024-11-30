import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { jwt } from '@elysiajs/jwt'
import { swagger } from '@elysiajs/swagger'

const app = new Elysia()
  .use(cors({
    origin: process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }))
  .use(swagger())
  .use(jwt({
    name: 'jwt',
    secret: process.env.JWT_SECRET || 'tu-secreto'
  }))

  // Ruta de prueba
  .get('/', () => 'API funcionando! 🚀')

  .listen(process.env.PORT || 3001)

console.log(`🚀 API corriendo en http://localhost:${process.env.PORT || 3001}`) 