import { Elysia } from 'elysia'
import { register } from './register'
// import { login } from './login'
// import { recover } from './recover'

export const auth = new Elysia({ prefix: '/auth' })
  .use(register)
  // .use(login)
  // .use(recover) 