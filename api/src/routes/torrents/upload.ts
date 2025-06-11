/**
 * @file upload.ts
 * @description Upload torrent route
 */

import { Elysia } from 'elysia'
import { db } from '../../db'
import parseTorrent from 'parse-torrent'
import type { ParsedTorrentInfo, TorrentUploadResponse, ParseTorrentResult } from '../../types/torrent'

export const upload = new Elysia()
  .post('/upload', async ({ body }: { body: { torrent: File } }) => {
    try {
      const file = body.torrent
      
      if (!file) {
        console.log('No file received')
        return { 
          success: false, 
          error: 'No torrent file provided' 
        }
      }

      console.log('Received file:', {
        name: file.name,
        size: file.size,
        type: file.type
      })

      const arrayBuffer = await file.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      console.log('Buffer created:', {
        size: buffer.length,
        isBuffer: Buffer.isBuffer(buffer)
      })

      // Add await here
      const parsedTorrent = await parseTorrent(buffer) as ParseTorrentResult
      console.log('Raw parsed torrent:', JSON.stringify(parsedTorrent, null, 2))

      if (!parsedTorrent) {
        console.log('Failed to parse torrent')
        return {
          success: false,
          error: 'Invalid torrent file'
        }
      }

      const torrentInfo: ParsedTorrentInfo = {
        name: Array.isArray(parsedTorrent.name) ? parsedTorrent.name.join(', ') : (parsedTorrent.name || ''),
        infoHash: parsedTorrent.infoHash,
        size: parsedTorrent.length || 0,
        files: parsedTorrent.files?.map(file => ({
          name: file.name,
          length: file.length,
          path: Array.isArray(file.path) ? file.path : [file.path]
        })),
        pieceLength: parsedTorrent.pieceLength || 0,
        pieces: parsedTorrent.pieces?.length || 0,
        private: Boolean(parsedTorrent.private || false),
        announce: Array.isArray(parsedTorrent.announce) ? parsedTorrent.announce : 
                 (parsedTorrent.announce ? [parsedTorrent.announce] : []),
        created: parsedTorrent.created || null,
        createdBy: parsedTorrent.createdBy || null,
        comment: parsedTorrent.comment || null
      }

      console.log('Processed torrent info:', JSON.stringify(torrentInfo, null, 2))

      return {
        success: true,
        data: torrentInfo
      }

    } catch (error) {
      console.error('Error parsing torrent:', error)
      return {
        success: false,
        error: 'Error parsing torrent file'
      }
    }
  })