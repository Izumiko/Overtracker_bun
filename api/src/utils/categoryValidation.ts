const VALID_CATEGORIES = [
  'movies',
  'tv',
  'music',
  'games',
  'software',
  'books',
  'anime',
  'other'
]

export function validateCategory(category: string): boolean {
  return VALID_CATEGORIES.includes(category.toLowerCase())
} 