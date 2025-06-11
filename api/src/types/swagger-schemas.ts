/**
 * @file swagger-schemas.ts
 * @description Swagger schemas
 */

export const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'string', format: 'uuid' },
    username: { type: 'string', minLength: 3, maxLength: 50 },
    email: { type: 'string', format: 'email' },
    passkey: {
      type: 'string',
      minLength: 32,
      maxLength: 32,
      pattern: '^(?=.*[A-Z])(?=.*\\d)[A-Z0-9]{32}$',
      description: 'Identificador único de 32 caracteres (letras mayúsculas y números)'
    },
    role: { type: 'string', enum: ['user', 'moderator', 'admin'] },
    verified: { type: 'boolean' },
    last_login: { type: 'string', format: 'date-time', nullable: true },
    created_at: { type: 'string', format: 'date-time' }
  }
}

export const errorSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean', default: false },
    message: { type: 'string' }
  }
} 