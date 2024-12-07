/**
 * @file torrents.ts
 * @description Torrents schema
 */

import { pgTable, uuid, varchar, text, timestamp, integer, jsonb, boolean, pgEnum } from 'drizzle-orm/pg-core'
import { users } from './users'

// Enum for the type of BitTorrent
export const torrentVersionEnum = pgEnum('torrent_version', ['v1', 'v2', 'hybrid'])

// Main table for torrents
export const torrents = pgTable('torrents', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  info_hash: varchar('info_hash', { length: 40 }).notNull().unique(),
  info_hash_v2: varchar('info_hash_v2', { length: 64 }),
  version: torrentVersionEnum('version').notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  uploader_id: uuid('uploader_id').notNull().references(() => users.id),
  size: varchar('size', { length: 20 }).notNull(),
  file_count: integer('file_count').notNull(),
  tags: text('tags').array(),
  files: jsonb('files').notNull(),
  piece_length: integer('piece_length').notNull(),
  private: boolean('private').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).defaultNow()
})

// Table for torrent statistics
export const torrentStats = pgTable('torrent_stats', {
  torrent_id: uuid('torrent_id').references(() => torrents.id).primaryKey(),
  seeders: integer('seeders').notNull().default(0),
  leechers: integer('leechers').notNull().default(0),
  completed: integer('completed').notNull().default(0),
  last_updated: timestamp('last_updated', { withTimezone: true }).defaultNow()
})

export type Torrent = typeof torrents.$inferSelect
export type NewTorrent = typeof torrents.$inferInsert
export type TorrentStats = typeof torrentStats.$inferSelect 