/**
 * @file elysia.d.ts
 * @description Elysia types
 */

declare module 'elysia' {
  import type { JWT } from '@elysiajs/jwt'

  export class Elysia {
    constructor(config?: { prefix?: string })
    use(plugin: any): this
    listen(port: number): void
    group(prefix: string, callback: (app: this) => any): this
    get(path: string, handler: RouteHandler, config?: RouteConfig): this
    post(path: string, handler: RouteHandler, config?: RouteConfig): this
    put(path: string, handler: RouteHandler, config?: RouteConfig): this
    delete(path: string, handler: RouteHandler, config?: RouteConfig): this
  }

  export interface Context {
    body: any
    query: Record<string, string | undefined>
    params: Record<string, string>
    headers: Record<string, string | undefined>
    set: {
      status?: number
      headers?: Record<string, string>
    }
    jwt: JWT
  }

  export type RouteHandler = (context: Context) => any | Promise<any>

  interface SwaggerSchema {
    type: string
    properties?: Record<string, any>
    items?: SwaggerSchema
    format?: string
    enum?: string[]
    nullable?: boolean
    default?: any
    minLength?: number
    maxLength?: number
  }

  interface SwaggerResponse {
    description: string
    content?: {
      'application/json': {
        schema: SwaggerSchema
      }
    }
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

  export interface RouteConfig {
    body?: any
    query?: any
    params?: any
    detail?: SwaggerDetail
  }

  export const t: {
    String(config?: { minLength?: number; maxLength?: number; format?: string }): any
    Number(config?: { minimum?: number; maximum?: number }): any
    Boolean(): any
    Object(schema: Record<string, any>): any
    Array(items: any): any
  }
}

declare module '@elysiajs/cors' {
  import type { Elysia } from 'elysia'

  export function cors(options?: {
    origin?: string | string[] | boolean
    methods?: string[]
    allowedHeaders?: string[]
    exposedHeaders?: string[]
    credentials?: boolean
    maxAge?: number
  }): (app: Elysia) => Elysia
}

declare module '@elysiajs/jwt' {
  export interface JWT {
    sign(payload: any): Promise<string>
    verify(token: string): Promise<any>
  }

  export function jwt(options: {
    name?: string
    secret: string
    exp?: string | number
  }): any
}

declare module '@elysiajs/swagger' {
  import type { Elysia } from 'elysia'

  interface SecurityScheme {
    type: string
    scheme?: string
    bearerFormat?: string
  }

  export function swagger(options?: {
    documentation?: {
      info?: {
        title?: string
        version?: string
        description?: string
      }
      tags?: Array<{
        name: string
        description?: string
      }>
      servers?: Array<{
        url: string
        description?: string
      }>
      components?: {
        securitySchemes?: {
          [key: string]: SecurityScheme
        }
      }
      security?: Array<{
        [key: string]: string[]
      }>
    }
  }): (app: Elysia) => Elysia
} 