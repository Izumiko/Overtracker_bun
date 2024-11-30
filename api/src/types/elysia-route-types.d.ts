import type { Context } from 'elysia'

export interface RegisterBody {
  username: string
  email: string
  password: string
}

export interface LoginBody {
  username: string
  password: string
}

export interface RefreshBody {
  refresh_token: string
}

export interface RegisterRoute extends Context {
  body: RegisterBody
}

export interface LoginRoute extends Context {
  body: LoginBody
}

export interface RefreshRoute extends Context {
  body: RefreshBody
}

export interface LogoutRoute extends Context {
  body: unknown
} 