/**
 * @file tagValidation.ts
 * @description Tag validation
 */

interface TagValidationResult {
  success: boolean
  message?: string
  data?: string[]
}

export function validateTags(tags: string[]): TagValidationResult {
  // Remove duplicates and spaces
  const uniqueTags = [...new Set(tags.map(tag => tag.trim()))]

  // Validate maximum tag length
  if (uniqueTags.length > 20) {
    return {
      success: false,
      message: 'Maximum 20 tags allowed'
    }
  }

  // Validate each tag
  const validTags = uniqueTags.filter(tag => {
    // Length between 2 and 30 characters
    if (tag.length < 2 || tag.length > 30) return false
    
    // Only letters, numbers, hyphens and spaces
    return /^[a-zA-Z0-9\s\-]+$/.test(tag)
  })

  if (validTags.length !== uniqueTags.length) {
    return {
      success: false,
      message: 'Some tags contain invalid characters or incorrect length'
    }
  }

  return {
    success: true,
    data: validTags
  }
} 