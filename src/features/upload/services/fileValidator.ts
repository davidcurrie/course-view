export interface ValidationResult {
  valid: boolean
  errors: string[]
}

const MAX_MAP_SIZE_MB = 20
const MAX_COURSE_SIZE_MB = 5
const MAX_WORLD_FILE_SIZE_KB = 10

/**
 * Validate file size
 */
function validateFileSize(file: File, maxSizeMB: number): string | null {
  const maxBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxBytes) {
    return `File size (${(file.size / 1024 / 1024).toFixed(2)}MB) exceeds maximum allowed size of ${maxSizeMB}MB`
  }
  return null
}

/**
 * Validate file extension
 */
function validateFileExtension(file: File, allowedExtensions: string[]): string | null {
  const extension = file.name.split('.').pop()?.toLowerCase()
  if (!extension || !allowedExtensions.includes(extension)) {
    return `Invalid file type. Expected: ${allowedExtensions.join(', ')}`
  }
  return null
}

/**
 * Validate JPEG image file
 */
export function validateJpegFile(file: File): ValidationResult {
  const errors: string[] = []

  const extError = validateFileExtension(file, ['jpg', 'jpeg'])
  if (extError) errors.push(extError)

  const sizeError = validateFileSize(file, MAX_MAP_SIZE_MB)
  if (sizeError) errors.push(sizeError)

  // Check MIME type
  if (file.type && !file.type.startsWith('image/jpeg')) {
    errors.push('File must be a JPEG image')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate world file (.jgw)
 */
export function validateWorldFile(file: File): ValidationResult {
  const errors: string[] = []

  const extError = validateFileExtension(file, ['jgw'])
  if (extError) errors.push(extError)

  const maxBytes = MAX_WORLD_FILE_SIZE_KB * 1024
  if (file.size > maxBytes) {
    errors.push(`World file is too large (max ${MAX_WORLD_FILE_SIZE_KB}KB)`)
  }

  if (file.size === 0) {
    errors.push('World file is empty')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate world file content
 */
export async function validateWorldFileContent(file: File): Promise<ValidationResult> {
  const errors: string[] = []

  try {
    const content = await file.text()
    const lines = content.trim().split('\n')

    if (lines.length !== 6) {
      errors.push(`World file must have exactly 6 lines (found ${lines.length})`)
    } else {
      lines.forEach((line, index) => {
        const value = parseFloat(line.trim())
        if (isNaN(value)) {
          errors.push(`Line ${index + 1} is not a valid number: "${line.trim()}"`)
        }
      })
    }
  } catch (error) {
    errors.push('Failed to read world file content')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate KMZ file
 */
export function validateKmzFile(file: File): ValidationResult {
  const errors: string[] = []

  const extError = validateFileExtension(file, ['kmz'])
  if (extError) errors.push(extError)

  const sizeError = validateFileSize(file, MAX_MAP_SIZE_MB)
  if (sizeError) errors.push(sizeError)

  if (file.size === 0) {
    errors.push('KMZ file is empty')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate IOF XML file
 */
export function validateCourseFile(file: File): ValidationResult {
  const errors: string[] = []

  const extError = validateFileExtension(file, ['xml'])
  if (extError) errors.push(extError)

  const sizeError = validateFileSize(file, MAX_COURSE_SIZE_MB)
  if (sizeError) errors.push(sizeError)

  if (file.size === 0) {
    errors.push('XML file is empty')
  }

  // Check MIME type if available
  if (file.type && file.type !== 'text/xml' && file.type !== 'application/xml') {
    // Don't fail on this, just warn
    console.warn('File MIME type is not XML:', file.type)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate course XML content
 */
export async function validateCourseFileContent(file: File): Promise<ValidationResult> {
  const errors: string[] = []

  try {
    const content = await file.text()

    // Basic XML structure check
    if (!content.includes('<CourseData')) {
      errors.push('File does not appear to be an IOF XML course data file')
    }

    if (!content.includes('</CourseData>')) {
      errors.push('XML file is incomplete or malformed')
    }

    // Check for essential elements
    if (!content.includes('<RaceCourseData>')) {
      errors.push('No RaceCourseData found in XML')
    }
  } catch (error) {
    errors.push('Failed to read XML file content')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate complete map upload (JPEG + World File)
 */
export async function validateMapUpload(
  imageFile: File,
  worldFile: File
): Promise<ValidationResult> {
  const errors: string[] = []

  // Validate image file
  const imageValidation = validateJpegFile(imageFile)
  errors.push(...imageValidation.errors)

  // Validate world file
  const worldValidation = validateWorldFile(worldFile)
  errors.push(...worldValidation.errors)

  // Validate world file content
  if (worldValidation.valid) {
    const contentValidation = await validateWorldFileContent(worldFile)
    errors.push(...contentValidation.errors)
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
