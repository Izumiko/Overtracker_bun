import type { Instance } from 'parse-torrent'

// Definición de tipos específicos para parse-torrent
interface TorrentFileInfo {
  name: string;
  length: number;
  path: string | string[];
}

interface ParseTorrentResult {
  name: string | string[];
  infoHash: string;
  length: number;
  files?: TorrentFileInfo[];
  pieceLength: number;
  pieces: Buffer[];
  private?: boolean;
  announce?: string | string[];
  created?: Date;
  createdBy?: string;
  comment?: string;
}

export interface TorrentFile {
  name: string;
  length: number;
  path: string[];
}

export interface ParsedTorrentInfo {
  name: string;
  infoHash: string;
  size: number;
  files?: TorrentFile[];
  pieceLength: number;
  pieces: number;
  private: boolean;
  announce: string[];
  created: Date | null;
  createdBy: string | null;
  comment: string | null;
}

export interface TorrentUploadResponse {
  success: boolean;
  data?: ParsedTorrentInfo;
  error?: string;
}

export type { ParseTorrentResult }