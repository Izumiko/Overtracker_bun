/**
 * @file upload.ts
 * @description Upload torrent route
 */

import { Elysia, t } from 'elysia'
import { db } from '../../db'
import { torrents } from '../../db/schema/torrents'
import { parseTorrent, validateCategory, validateTags } from '../../utils'
import type { UploadTorrentRoute } from '@/types/elysia-route-types'
import { eq, or } from 'drizzle-orm'

export const upload = new Elysia()
  .post('/upload', async ({ body, set, jwt }: UploadTorrentRoute) => {
    const { 
      torrentFile,
      name,
      description,
      category,
      tags 
    } = body

    try {
      // Verify authentication
      const token = await jwt.verify(
        set.headers?.authorization?.replace('Bearer ', '') || ''
      )
      if (!token?.id) {
        set.status = 401
        return {
          success: false,
          message: 'No autorizado'
        }
      }

      // Validate category
      if (!validateCategory(category)) {
        set.status = 400
        return {
          success: false,
          message: 'Categoría inválida'
        }
      }

      // Validate tags
      const validatedTags = validateTags(tags)
      if (!validatedTags.success) {
        set.status = 400
        return {
          success: false,
          message: validatedTags.message
        }
      }

      // Parse torrent file
      const parsedTorrent = await parseTorrent(torrentFile)
      if (!parsedTorrent.success || !parsedTorrent.data) {
        set.status = 400
        return {
          success: false,
          message: parsedTorrent.message || 'Error al parsear el torrent'
        }
      }

      const { data } = parsedTorrent

      // Verify if the torrent already exists
      const existingTorrent = await db
        .select()
        .from(torrents)
        .where(
          or(
            eq(torrents.info_hash, data.infoHash),
            data.infoHashV2 ? eq(torrents.info_hash_v2, data.infoHashV2) : undefined
          )
        )
        .limit(1)
        .execute()

      if (existingTorrent.length > 0) {
        set.status = 400
        return {
          success: false,
          message: 'Este torrent ya existe en el tracker'
        }
      }

      // Create the torrent in the database
      const newTorrent = await db.insert(torrents).values({
        name,
        description,
        info_hash: data.infoHash,
        info_hash_v2: data.infoHashV2,
        version: data.version,
        category,
        uploader_id: token.id,
        size: data.size.toString(), // Convertir BigInt a string
        file_count: data.files.length,
        tags: validatedTags.data,
        files: data.files,
        piece_length: data.pieceLength,
        private: true
      }).returning()

      return {
        success: true,
        message: 'Torrent subido correctamente',
        torrent: newTorrent[0]
      }

    } catch (error) {
      console.error('Upload torrent error:', error)
      set.status = 500
      return {
        success: false,
        message: 'Error interno al procesar el torrent'
      }
    }
  }, {
    body: t.Object({
      torrentFile: t.String(),
      name: t.String({ minLength: 1, maxLength: 255 }),
      description: t.String({ minLength: 1 }),
      category: t.String(),
      tags: t.Array(t.String({ minLength: 1, maxLength: 30 }))
    }),
    detail: {
      tags: ['Torrents'],
      security: [{ Bearer: [] }],
      summary: 'Upload a new torrent',
      description: 'Uploads a new torrent to the tracker. The torrent file must be encoded in base64.',
      responses: {
        200: {
          description: 'Torrent subido correctamente',
          content: {
            'application/json': {
              schema: t.Object({
                success: t.Boolean(),
                message: t.String(),
                torrent: t.Object({
                  id: t.String(),
                  name: t.String(),
                  description: t.String(),
                  info_hash: t.String(),
                  info_hash_v2: t.String(),
                  version: t.String(),
                  category: t.String(),
                  uploader_id: t.String(),
                  size: t.String(),
                  file_count: t.Number(),
                  tags: t.Array(t.String()),
                  files: t.Object({}),
                  piece_length: t.Number(),
                  private: t.Boolean()
                })
              })
            }
          }
        },
        400: {
          description: 'Invalid data sent',
          content: {
            'application/json': {
              schema: t.Object({
                success: t.Boolean(),
                message: t.String()
              })
            }
          }
        },
        401: {
          description: 'Unauthorized',
          content: {
            'application/json': {
              schema: t.Object({
                success: t.Boolean(),
                message: t.String()
              })
            }
          }
        },
        500: {
          description: 'Server error',
          content: {
            'application/json': {
              schema: t.Object({
                success: t.Boolean(),
                message: t.String()
              })
            }
          }
        }
      }
    }
  }) 