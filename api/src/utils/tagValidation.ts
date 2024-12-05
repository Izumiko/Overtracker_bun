interface TagValidationResult {
  success: boolean
  message?: string
  data?: string[]
}

export function validateTags(tags: string[]): TagValidationResult {
  // Eliminar duplicados y espacios
  const uniqueTags = [...new Set(tags.map(tag => tag.trim()))]

  // Validar longitud máxima de tags
  if (uniqueTags.length > 20) {
    return {
      success: false,
      message: 'Máximo 20 tags permitidos'
    }
  }

  // Validar cada tag
  const validTags = uniqueTags.filter(tag => {
    // Longitud entre 2 y 30 caracteres
    if (tag.length < 2 || tag.length > 30) return false
    
    // Solo letras, números, guiones y espacios
    return /^[a-zA-Z0-9\s\-]+$/.test(tag)
  })

  if (validTags.length !== uniqueTags.length) {
    return {
      success: false,
      message: 'Algunos tags contienen caracteres inválidos o longitud incorrecta'
    }
  }

  return {
    success: true,
    data: validTags
  }
} 