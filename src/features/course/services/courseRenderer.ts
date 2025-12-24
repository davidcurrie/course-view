import L from 'leaflet'
import { Course, Control, Position } from '../../../shared/types'

type CoordinateTransform = (pos: Position) => [number, number]

/**
 * Create a start marker (triangle)
 */
export function createStartMarker(
  position: Position,
  color: string,
  courseName: string,
  transform: CoordinateTransform = pos => [pos.lat, pos.lng]
): L.Marker {
  const icon = L.divIcon({
    className: 'orienteering-start-marker',
    html: `
      <svg width="30" height="30" viewBox="0 0 30 30">
        <polygon points="15,5 25,25 5,25" fill="none" stroke="${color}" stroke-width="3"/>
      </svg>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })

  const coords = transform(position)
  const marker = L.marker(coords, { icon })

  // Add popup
  marker.bindPopup(`
    <div style="font-family: Arial, sans-serif; min-width: 120px;">
      <div style="font-weight: bold; margin-bottom: 4px;">Start</div>
      <div style="font-size: 12px; color: #666;">Course: ${courseName}</div>
    </div>
  `, {
    closeButton: true,
    minWidth: 120,
  })

  return marker
}

/**
 * Create a control marker (circle with number)
 */
export function createControlMarker(
  control: Control,
  position: Position,
  color: string,
  courseName: string,
  transform: CoordinateTransform = pos => [pos.lat, pos.lng]
): L.Marker {
  const icon = L.divIcon({
    className: 'orienteering-control-marker',
    html: `
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="12" fill="none" stroke="${color}" stroke-width="3"/>
        <text x="20" y="20" text-anchor="middle" dominant-baseline="central"
              font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="${color}">
          ${control.number}
        </text>
      </svg>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  })

  const coords = transform(position)
  const marker = L.marker(coords, { icon })

  // Add popup with control information
  const popupContent = `
    <div style="font-family: Arial, sans-serif; min-width: 120px;">
      <div style="font-weight: bold; margin-bottom: 4px;">Control ${control.number}</div>
      <div style="font-size: 12px; color: #666;">Code: ${control.code}</div>
      <div style="font-size: 12px; color: #666; margin-top: 4px;">Course: ${courseName}</div>
    </div>
  `
  marker.bindPopup(popupContent, {
    closeButton: true,
    minWidth: 120,
  })

  return marker
}

/**
 * Create a finish marker (double circle)
 */
export function createFinishMarker(
  position: Position,
  color: string,
  courseName: string,
  transform: CoordinateTransform = pos => [pos.lat, pos.lng]
): L.Marker {
  const icon = L.divIcon({
    className: 'orienteering-finish-marker',
    html: `
      <svg width="30" height="30" viewBox="0 0 30 30">
        <circle cx="15" cy="15" r="10" fill="none" stroke="${color}" stroke-width="3"/>
        <circle cx="15" cy="15" r="6" fill="none" stroke="${color}" stroke-width="3"/>
      </svg>
    `,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  })

  const coords = transform(position)
  const marker = L.marker(coords, { icon })

  // Add popup
  marker.bindPopup(`
    <div style="font-family: Arial, sans-serif; min-width: 120px;">
      <div style="font-weight: bold; margin-bottom: 4px;">Finish</div>
      <div style="font-size: 12px; color: #666;">Course: ${courseName}</div>
    </div>
  `, {
    closeButton: true,
    minWidth: 120,
  })

  return marker
}

/**
 * Calculate point at edge of finish circle
 */
function getFinishEdgePoint(
  lastControl: Position,
  finish: Position,
  transform: CoordinateTransform
): [number, number] {
  const lastControlCoords = transform(lastControl)
  const finishCoords = transform(finish)

  // Calculate direction vector from last control to finish
  const dx = finishCoords[1] - lastControlCoords[1] // X difference
  const dy = finishCoords[0] - lastControlCoords[0] // Y difference
  const distance = Math.sqrt(dx * dx + dy * dy)

  if (distance === 0) return finishCoords

  // Normalize direction vector
  const dirX = dx / distance
  const dirY = dy / distance

  // Move back from finish center by outer circle radius (10 pixels in map units)
  // This is an approximation - ideally we'd use actual map scale
  const radius = 0.00015 // Approximate radius in map degrees (adjust as needed)

  return [
    finishCoords[0] - dirY * radius,
    finishCoords[1] - dirX * radius
  ]
}

/**
 * Create a polyline connecting course controls
 */
export function createCoursePolyline(
  course: Course,
  transform: CoordinateTransform = pos => [pos.lat, pos.lng]
): L.Polyline {
  // Get the finish edge point instead of center
  const lastControl = course.controls[course.controls.length - 1]
  const finishEdge = lastControl
    ? getFinishEdgePoint(lastControl.position, course.finish, transform)
    : transform(course.finish)

  const positions: L.LatLngExpression[] = [
    transform(course.start),
    ...course.controls.map(c => transform(c.position)),
    finishEdge,
  ]

  return L.polyline(positions, {
    color: course.color,
    weight: 3,
    opacity: 0.7,
    lineJoin: 'round',
    lineCap: 'round',
  })
}

/**
 * Create a layer group for a course (without adding to map)
 */
export function createCourseLayer(
  course: Course,
  transform: CoordinateTransform = pos => [pos.lat, pos.lng]
): L.LayerGroup {
  const layerGroup = L.layerGroup()

  // Add course line
  const polyline = createCoursePolyline(course, transform)
  polyline.addTo(layerGroup)

  // Add start marker
  const startMarker = createStartMarker(course.start, course.color, course.name, transform)
  startMarker.addTo(layerGroup)

  // Add control markers
  course.controls.forEach(control => {
    const marker = createControlMarker(control, control.position, course.color, course.name, transform)
    marker.addTo(layerGroup)
  })

  // Add finish marker
  const finishMarker = createFinishMarker(course.finish, course.color, course.name, transform)
  finishMarker.addTo(layerGroup)

  return layerGroup
}
