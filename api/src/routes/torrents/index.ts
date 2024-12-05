import { Elysia } from 'elysia'
import { upload } from './upload'

export const torrents = new Elysia({ prefix: '/torrents' })
  .use(upload) 