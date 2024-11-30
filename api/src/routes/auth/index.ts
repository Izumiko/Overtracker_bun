import { Elysia } from 'elysia'
import { register } from './register'
import { login } from './login'
import { logout } from './logout'
import { refresh } from './refresh'

export const auth = new Elysia()
  .group('/auth', app => app
    .use(register)
    .use(login)
    .use(logout)
    .use(refresh)
  ) 