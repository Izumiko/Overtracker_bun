interface CategoryPattern {
  pattern: RegExp;
  category: 'video' | 'audio' | 'applications' | 'games';
}

const CATEGORY_PATTERNS: CategoryPattern[] = [
  // Video patterns
  { pattern: /\.(mkv|mp4|avi|wmv|mov|flv|mpg|mpeg|m4v|webm)$/i, category: 'video' },
  { pattern: /\b(1080p|720p|2160p|4k|8k|bluray|bdrip|dvdrip|webrip|hdtv)\b/i, category: 'video' },
  { pattern: /\b(x264|x265|hevc|xvid|divx)\b/i, category: 'video' },
  
  // Audio patterns
  { pattern: /\.(mp3|flac|m4a|wav|wma|aac|ogg|opus|alac|ape|wv)$/i, category: 'audio' },
  { pattern: /\b(320kbps|192kbps|128kbps|v0|v2|lossless)\b/i, category: 'audio' },
  { pattern: /\b(album|ost|soundtrack|discography|ep|single)\b/i, category: 'audio' },
  
  // Applications patterns
  { pattern: /\.(exe|msi|dmg|pkg|deb|rpm|appimage|apk|ipa)$/i, category: 'applications' },
  { pattern: /\b(windows|macos|linux|android|ios|portable|cracked)\b/i, category: 'applications' },
  { pattern: /\b(x86|x64|arm64|setup|installer)\b/i, category: 'applications' },
  
  // Games patterns
  { pattern: /\b(ps[1-5]|xbox|switch|nintendo|steam|gog|repack|goty)\b/i, category: 'games' },
  { pattern: /\b(rpg|fps|mmorpg|simulator|strategy|action)\b/i, category: 'games' },
  { pattern: /\b(dlc|update|patch|crack|codex|plaza|skidrow)\b/i, category: 'games' }
];

export function detectCategory(filename: string): 'video' | 'audio' | 'applications' | 'games' | 'other' {
  for (const { pattern, category } of CATEGORY_PATTERNS) {
    if (pattern.test(filename)) {
      return category;
    }
  }
  return 'other';
} 