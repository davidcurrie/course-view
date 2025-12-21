import JSZip from 'jszip'
import { XMLParser } from 'fast-xml-parser'
import { GeoReference, LatLngBounds } from '../../../shared/types'
import { ParsedMapData } from './mapProcessor'

interface KMLGroundOverlay {
  LatLonBox: {
    north: number
    south: number
    east: number
    west: number
    rotation?: number
  }
  Icon: {
    href: string
  }
}

/**
 * Parse KML to extract ground overlay information
 */
function parseKML(kmlContent: string): KMLGroundOverlay {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
  })

  const kmlData = parser.parse(kmlContent)

  // Navigate KML structure to find GroundOverlay
  const kml = kmlData.kml || kmlData
  const document = kml.Document || kml
  const groundOverlay = document.GroundOverlay || document.Folder?.GroundOverlay

  if (!groundOverlay) {
    throw new Error('No GroundOverlay found in KML file')
  }

  const latLonBox = groundOverlay.LatLonBox
  if (!latLonBox) {
    throw new Error('No LatLonBox found in GroundOverlay')
  }

  const icon = groundOverlay.Icon
  if (!icon || !icon.href) {
    throw new Error('No Icon/href found in GroundOverlay')
  }

  return {
    LatLonBox: {
      north: parseFloat(latLonBox.north),
      south: parseFloat(latLonBox.south),
      east: parseFloat(latLonBox.east),
      west: parseFloat(latLonBox.west),
      rotation: latLonBox.rotation ? parseFloat(latLonBox.rotation) : 0,
    },
    Icon: {
      href: icon.href,
    },
  }
}

/**
 * Convert KML LatLonBox to GeoReference format
 */
function latLonBoxToGeoRef(
  latLonBox: KMLGroundOverlay['LatLonBox'],
  imageWidth: number,
  imageHeight: number
): GeoReference {
  const { north, south, east, west } = latLonBox

  // Calculate pixel sizes
  const pixelSizeX = (east - west) / imageWidth
  const pixelSizeY = (south - north) / imageHeight // Negative because Y increases downward

  return {
    type: 'kmz',
    pixelSizeX,
    pixelSizeY,
    rotationX: 0,
    rotationY: 0,
    topLeftX: west,
    topLeftY: north,
  }
}

/**
 * Get image dimensions from Blob
 */
function getImageDimensionsFromBlob(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(blob)

    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.width, height: img.height })
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image from KMZ'))
    }

    img.src = url
  })
}

/**
 * Process KMZ file
 */
export async function processKmzFile(kmzFile: File): Promise<ParsedMapData> {
  // Unzip KMZ
  const zip = await JSZip.loadAsync(kmzFile)

  // Find KML file (usually doc.kml or similar)
  const kmlFile = Object.keys(zip.files).find(name => name.toLowerCase().endsWith('.kml'))
  if (!kmlFile) {
    throw new Error('No KML file found in KMZ archive')
  }

  // Read KML content
  const kmlContent = await zip.files[kmlFile].async('string')
  const groundOverlay = parseKML(kmlContent)

  // Find and extract image
  const imageFileName = groundOverlay.Icon.href
  const imageFile = zip.files[imageFileName]
  if (!imageFile) {
    throw new Error(`Image file "${imageFileName}" not found in KMZ archive`)
  }

  const imageBlob = await imageFile.async('blob')

  // Get image dimensions
  const { width, height } = await getImageDimensionsFromBlob(imageBlob)

  // Convert LatLonBox to GeoReference
  const georef = latLonBoxToGeoRef(groundOverlay.LatLonBox, width, height)

  // Bounds are directly from LatLonBox
  const bounds: LatLngBounds = {
    north: groundOverlay.LatLonBox.north,
    south: groundOverlay.LatLonBox.south,
    east: groundOverlay.LatLonBox.east,
    west: groundOverlay.LatLonBox.west,
  }

  return {
    imageBlob,
    georef,
    bounds,
  }
}
