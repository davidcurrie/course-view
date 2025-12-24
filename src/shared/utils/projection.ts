import proj4 from 'proj4'
import { Position } from '../types'

/**
 * Determine UTM zone from longitude
 */
export function getUTMZone(longitude: number): number {
  return Math.floor((longitude + 180) / 6) + 1
}

/**
 * Get UTM EPSG code for a given zone (assumes northern hemisphere)
 */
export function getUTMEPSG(zone: number): string {
  return `EPSG:326${zone.toString().padStart(2, '0')}`
}

/**
 * Convert WGS84 lat/lng to UTM coordinates
 */
export function latLngToUTM(position: Position): { x: number; y: number } {
  const zone = getUTMZone(position.lng)
  const utmEPSG = getUTMEPSG(zone)

  // Define WGS84 and UTM projections
  const wgs84 = 'EPSG:4326'

  // Convert
  const [x, y] = proj4(wgs84, utmEPSG, [position.lng, position.lat])

  return { x, y }
}

/**
 * Determine if coordinates are geographic (lat/lng) or projected
 */
export function isGeographicCoordinates(
  topLeftX: number,
  topLeftY: number,
  north: number,
  south: number,
  east: number,
  west: number
): boolean {
  return (
    Math.abs(topLeftY) <= 90 &&
    Math.abs(topLeftX) <= 180 &&
    Math.abs(north) <= 90 &&
    Math.abs(south) <= 90 &&
    Math.abs(east) <= 180 &&
    Math.abs(west) <= 180
  )
}
