import { GeoReference, LatLngBounds } from '../../../shared/types'

export interface ParsedMapData {
  imageBlob: Blob
  georef: GeoReference
  bounds: LatLngBounds
}

/**
 * Parse a JPEG World File (.jgw)
 * Format (6 lines):
 * 1. Pixel size in X direction
 * 2. Rotation about Y axis
 * 3. Rotation about X axis
 * 4. Pixel size in Y direction (negative)
 * 5. X coordinate of upper left pixel center
 * 6. Y coordinate of upper left pixel center
 */
export async function parseWorldFile(worldFileContent: string): Promise<GeoReference> {
  const lines = worldFileContent.trim().split('\n')

  if (lines.length !== 6) {
    throw new Error('Invalid world file format: expected 6 lines')
  }

  const values = lines.map(line => parseFloat(line.trim()))

  if (values.some(v => isNaN(v))) {
    throw new Error('Invalid world file format: all lines must contain valid numbers')
  }

  const [pixelSizeX, rotationY, rotationX, pixelSizeY, topLeftX, topLeftY] = values

  return {
    type: 'worldfile',
    pixelSizeX,
    pixelSizeY,
    rotationX,
    rotationY,
    topLeftX,
    topLeftY,
  }
}

/**
 * Calculate geographic bounds from world file parameters and image dimensions
 */
function calculateBounds(
  georef: GeoReference,
  imageWidth: number,
  imageHeight: number
): LatLngBounds {
  const { pixelSizeX, pixelSizeY, topLeftX, topLeftY } = georef

  // Calculate corners
  const west = topLeftX
  const north = topLeftY
  const east = topLeftX + pixelSizeX * imageWidth
  const south = topLeftY + pixelSizeY * imageHeight

  return {
    north: Math.max(north, south),
    south: Math.min(north, south),
    east: Math.max(east, west),
    west: Math.min(east, west),
  }
}

/**
 * Get image dimensions from a File
 */
function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Process JPEG + World File
 */
export async function processJpegWorldFile(
  imageFile: File,
  worldFile: File
): Promise<ParsedMapData> {
  // Read world file
  const worldFileText = await worldFile.text()
  const georef = await parseWorldFile(worldFileText)

  // Get image dimensions
  const { width, height } = await getImageDimensions(imageFile)

  // Calculate bounds
  const bounds = calculateBounds(georef, width, height)

  return {
    imageBlob: imageFile,
    georef,
    bounds,
  }
}
