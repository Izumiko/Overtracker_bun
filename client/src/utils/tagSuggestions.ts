type TagFunction = (match: string) => string;

interface TagPattern {
  pattern: RegExp;
  tag: string | TagFunction;
}

export interface TagPatterns {
  video: {
    resolution: TagPattern[];
    format: TagPattern[];
    source: TagPattern[];
    audio: TagPattern[];
    language: TagPattern[];
    series: TagPattern[];
  };
  audio: {
    format: TagPattern[];
    quality: TagPattern[];
    type: TagPattern[];
  };
  applications: {
    platform: TagPattern[];
    type: TagPattern[];
  };
  games: {
    platform: TagPattern[];
    type: TagPattern[];
  };
}

interface DefaultTags {
  [key: string]: string[];
}

// Patrones de reconocimiento por categoría
const TAG_PATTERNS: TagPatterns = {
  video: {
    resolution: [
      { pattern: /\b(4k|2160p)\b/i, tag: '4K' },
      { pattern: /\b(8k|4320p)\b/i, tag: '8K' },
      { pattern: /\b1080p\b/i, tag: '1080p' },
      { pattern: /\b720p\b/i, tag: '720p' },
      { pattern: /\b480p\b/i, tag: '480p' },
      { pattern: /\b360p\b/i, tag: '360p' },
      { pattern: /\b240p\b/i, tag: '240p' }
    ],
    format: [
      { pattern: /\b(x264|h264)\b/i, tag: 'x264' },
      { pattern: /\b(x265|h265|hevc)\b/i, tag: 'x265' },
      { pattern: /\b(xvid)\b/i, tag: 'XviD' },
      // Detecta extensiones de archivo de video comunes (mkv, mp4, avi) y las convierte a mayúsculas,
      // eliminando el punto inicial. Por ejemplo: .mkv -> MKV
      { pattern: /\.(mkv|mp4|avi)\b/i, tag: (match: string) => match.slice(1).toUpperCase() },
      { pattern: /\((mkv|mp4|avi)\)/i, tag: (match: string) => match.slice(1, -1).toUpperCase() },
    ],
    source: [
      { pattern: /\b(bluray|bdrip)\b/i, tag: 'BluRay' },
      { pattern: /\b(web-?dl|webrip)\b/i, tag: 'WEB-DL' },
      { pattern: /\b(dvdrip)\b/i, tag: 'DVDRip' },
      { pattern: /\b(hdtv)\b/i, tag: 'HDTV' }
    ],
    audio: [
      { pattern: /\b(dts|dts-hd)\b/i, tag: 'DTS' },
      { pattern: /\b(dd5\.1|dolby)\b/i, tag: 'Dolby' },
      { pattern: /\b(aac)\b/i, tag: 'AAC' }
    ],
    language: [
      { pattern: /\b(es|esp|spanish|castellano)\b/i, tag: 'Castellano' },
      { pattern: /\b(lat|latino)\b/i, tag: 'Latino' },
      { pattern: /\b(en|eng|english|ingles)\b/i, tag: 'Inglés' },
      { pattern: /\b(fr|français|francés)\b/i, tag: 'Francés' },
      { pattern: /\b(de|deutsch|alemán)\b/i, tag: 'Alemán' },
      { pattern: /\b(it|italiano)\b/i, tag: 'Italiano' },
      { pattern: /\b(ja|japanese|japones)\b/i, tag: 'Japonés' },
      { pattern: /\b(pt|português|portugués)\b/i, tag: 'Portugués' },
      { pattern: /\b(ru|russian|ruso)\b/i, tag: 'Ruso' },
      { pattern: /\b(ar|arabic|árabe)\b/i, tag: 'Árabe' },
      { pattern: /\b(tr|turkish|turco)\b/i, tag: 'Turco' },
      { pattern: /\b(nl|dutch|holandés)\b/i, tag: 'Holandés' },
      { pattern: /\b(pl|polish|polaco)\b/i, tag: 'Polaco' },
      { pattern: /\b(sv|swedish|sueco)\b/i, tag: 'Sueco' },
      { pattern: /\b(no|norwegian|noruego)\b/i, tag: 'Noruego' },
      { pattern: /\b(da|danish|danés)\b/i, tag: 'Danés' },
      { pattern: /\b(fi|finlandés)\b/i, tag: 'Finlandés' },
      { pattern: /\b(hu|hungarian|húngaro)\b/i, tag: 'Húngaro' },
      { pattern: /\b(el|greek|griego)\b/i, tag: 'Griego' }
    ],
    series: [
      { pattern: /\b(complete|completa)\b/i, tag: 'Completa' },
      { pattern: /\b(incomplete|incompleta)\b/i, tag: 'Incompleta' },
      
      // Este patrón detecta números de temporada en diferentes formatos:
      // - s01, s1, etc (formato corto)
      // - season 1, season 01, etc (formato en inglés) 
      // - temporada 1, temporada 01, etc (formato en español)
      // Extrae el número y devuelve "Temporada X" donde X es el número encontrado
      { pattern: /\b(s\d{1,2}|season\s?\d{1,2}|temporada\s?\d{1,2})\b/i, tag: (match: string) => {
        const num = match.match(/\d{1,2}/)?.[0];
        return num ? `Temporada ${num}` : match;
      } }
    ]
  },
  audio: {
    format: [
      { pattern: /\b(flac)\b/i, tag: 'FLAC' },
      { pattern: /\b(mp3)\b/i, tag: 'MP3' },
      { pattern: /\b(m4a|aac)\b/i, tag: 'AAC' },
      { pattern: /\b(wav)\b/i, tag: 'WAV' },
      { pattern: /\b(aiff)\b/i, tag: 'AIFF' },
      { pattern: /\b(ape)\b/i, tag: 'APE' },
      { pattern: /\b(tak)\b/i, tag: 'TAC' },
      { pattern: /\b(wv)\b/i, tag: 'WAVPACK' },
      { pattern: /\b(alac)\b/i, tag: 'ALAC' },
      { pattern: /\b(dts)\b/i, tag: 'DTS' },
      { pattern: /\b(ac3)\b/i, tag: 'AC3' }
    ],
    quality: [
      { pattern: /\b(320|320kbps)\b/i, tag: '320kbps' },
      { pattern: /\b(192|192kbps)\b/i, tag: '192kbps' },
      { pattern: /\b(128|128kbps)\b/i, tag: '128kbps' },
      { pattern: /\b(96|96kbps)\b/i, tag: '96kbps' },
      { pattern: /\b(v0|v2)\b/i, tag: match => match.toUpperCase() },
      { pattern: /\b(lossless)\b/i, tag: 'Lossless' }
    ],
    type: [
      { pattern: /\b(album)\b/i, tag: 'Album' },
      { pattern: /\b(single)\b/i, tag: 'Single' },
      { pattern: /\b(ost|soundtrack)\b/i, tag: 'OST' },
      { pattern: /\b(live)\b/i, tag: 'Live' }
    ]
  },
  applications: {
    platform: [
      { pattern: /\b(windows|win(32|64))\b/i, tag: 'Windows' },
      { pattern: /\b(macos|mac)\b/i, tag: 'macOS' },
      { pattern: /\b(linux)\b/i, tag: 'Linux' },
      { pattern: /\b(android)\b/i, tag: 'Android' }
    ],
    type: [
      { pattern: /\b(portable)\b/i, tag: 'Portable' },
      { pattern: /\b(repack)\b/i, tag: 'Repack' },
      { pattern: /\b(retail)\b/i, tag: 'Retail' }
    ]
  },
  games: {
    platform: [
      { pattern: /\b(pc)\b/i, tag: 'PC' },
      { pattern: /\b(ps[1-5])\b/i, tag: match => match.toUpperCase() },
      { pattern: /\b(switch)\b/i, tag: 'Switch' },
      { pattern: /\b(xbox)\b/i, tag: 'Xbox' }
    ],
    type: [
      { pattern: /\b(repack)\b/i, tag: 'Repack' },
      { pattern: /\b(goty)\b/i, tag: 'GOTY' },
      { pattern: /\b(dlc)\b/i, tag: 'DLC' }
    ]
  }
};

// Tags predefinidos por categoría
const DEFAULT_TAGS: DefaultTags = {
  video: ['Subbed', 'Dubbed', 'HDR', 'Remux'],
  audio: ['EP', 'Compilation', 'Discography', 'Podcast'],
  applications: ['Cracked', 'Pro', 'Enterprise', 'Update'],
  games: ['RPG', 'Action', 'Strategy', 'Simulation'],
  other: ['Ebook', 'Comic', 'Magazine', 'Course']
};

export function generateTagSuggestions(category: keyof TagPatterns | 'other', name: string): string[] {
  const suggestions = new Set<string>();
  
  if (TAG_PATTERNS[category as keyof TagPatterns]) {
    Object.values(TAG_PATTERNS[category as keyof TagPatterns]).forEach((patterns: TagPattern[]) => {
      patterns.forEach(({ pattern, tag }) => {
        const match = name.match(pattern);
        if (match) {
          suggestions.add(typeof tag === 'function' ? tag(match[0]) : tag);
        }
      });
    });
  }

  const defaultTags = DEFAULT_TAGS[category] || DEFAULT_TAGS.other;
  defaultTags.forEach((tag: string) => {
    if (suggestions.size < 10) {
      suggestions.add(tag);
    }
  });

  return Array.from(suggestions);
} 