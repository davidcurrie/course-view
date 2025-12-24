import L from 'leaflet'
import { Course, Position } from '../../../shared/types'

type CoordinateTransform = (pos: Position) => [number, number]

/**
 * Calculate appropriate line width in pixels for current zoom level
 * Target: 0.35mm on a 1:15,000 scale map = 5.25m on ground
 * @param zoom Current map zoom level
 * @param latitude Latitude for calculating resolution (default 51 for UK)
 */
export function calculateLineWidth(zoom: number, latitude: number = 51): number {
  // Web Mercator resolution: meters per pixel at given zoom and latitude
  const resolution = 156543.04 * Math.cos(latitude * Math.PI / 180) / Math.pow(2, zoom)

  // 0.35mm at 1:15,000 scale = 5.25m on ground
  const targetWidthMeters = 5.25

  // Calculate pixel width
  const pixelWidth = targetWidthMeters / resolution

  // Clamp between 1 and 10 pixels for usability
  return Math.max(1, Math.min(10, pixelWidth))
}

/**
 * Represents a unique control with all courses that visit it
 */
export interface UniqueControl {
  code: string
  position: Position
  courses: Array<{
    courseId: string
    courseName: string
    courseColor: string
    controlNumber: number
  }>
}

/**
 * Extract unique controls from all courses
 */
export function extractUniqueControls(courses: Course[]): UniqueControl[] {
  const controlMap = new Map<string, UniqueControl>()

  courses.forEach(course => {
    course.controls.forEach(control => {
      // Use code + position as unique key
      const key = `${control.code}_${control.position.lat}_${control.position.lng}`

      if (!controlMap.has(key)) {
        controlMap.set(key, {
          code: control.code,
          position: control.position,
          courses: []
        })
      }

      const uniqueControl = controlMap.get(key)!
      uniqueControl.courses.push({
        courseId: course.id,
        courseName: course.name,
        courseColor: course.color,
        controlNumber: control.number
      })
    })
  })

  return Array.from(controlMap.values())
}

/**
 * Create a start marker (equilateral triangle) - always purple
 * Side length: 6mm at 1:15,000 = 90m on ground
 */
export function createStartMarker(
  position: Position,
  courseName: string,
  transform: CoordinateTransform = pos => [pos.lat, pos.lng],
  zoom: number = 15
): L.LayerGroup {
  const coords = transform(position)
  const layerGroup = L.layerGroup()

  // Side length: 6mm at 1:15,000 = 90m
  const sideLength = 90 // meters
  const height = (Math.sqrt(3) / 2) * sideLength // ~77.94m

  // Calculate triangle vertices (equilateral, pointing up)
  const lat = position.lat
  const metersPerDegreeLat = 111320
  const metersPerDegreeLng = 111320 * Math.cos(lat * Math.PI / 180)

  // Top vertex (center top)
  const topLat = coords[0] + (2 * height / 3) / metersPerDegreeLat
  const topLng = coords[1]

  // Bottom left vertex
  const bottomLat = coords[0] - (height / 3) / metersPerDegreeLat
  const bottomLeftLng = coords[1] - (sideLength / 2) / metersPerDegreeLng

  // Bottom right vertex
  const bottomRightLng = coords[1] + (sideLength / 2) / metersPerDegreeLng

  const trianglePoints: L.LatLngExpression[] = [
    [topLat, topLng],
    [bottomLat, bottomRightLng],
    [bottomLat, bottomLeftLng]
  ]

  const triangle = L.polygon(trianglePoints, {
    fillColor: 'transparent',
    fillOpacity: 0,
    color: '#9333ea',
    weight: calculateLineWidth(zoom),
  })
  triangle.addTo(layerGroup)

  // Add popup to triangle
  triangle.bindPopup(`
    <div style="font-family: Arial, sans-serif; min-width: 120px;">
      <div style="font-weight: bold; margin-bottom: 4px;">Start</div>
      <div style="font-size: 12px; color: #666;">Course: ${courseName}</div>
    </div>
  `, {
    closeButton: true,
    minWidth: 120,
  })

  return layerGroup
}

/**
 * Create a control marker (circle only, no label)
 * Shows all courses that visit this control in popup
 * Circle is 75m diameter (37.5m radius) and scales with zoom
 */
export function createControlMarker(
  uniqueControl: UniqueControl,
  transform: CoordinateTransform = pos => [pos.lat, pos.lng],
  zoom: number = 15
): L.Circle {
  const coords = transform(uniqueControl.position)

  // Create circle with 37.5m radius (75m diameter)
  const circle = L.circle(coords, {
    radius: 37.5, // 75m diameter
    fillColor: 'transparent',
    fillOpacity: 0,
    color: '#9333ea', // Purple
    weight: calculateLineWidth(zoom), // Match line width scaling
    interactive: true, // Allow clicks for popup
  })

  // Add popup with all courses visiting this control
  const coursesList = uniqueControl.courses
    .map(c => `
      <div style="display: flex; align-items: center; gap: 8px; margin: 4px 0;">
        <div style="width: 12px; height: 12px; background-color: ${c.courseColor}; border-radius: 2px;"></div>
        <span style="font-size: 12px;">${c.courseName} - Control ${c.controlNumber}</span>
      </div>
    `)
    .join('')

  const popupContent = `
    <div style="font-family: Arial, sans-serif; min-width: 180px;">
      <div style="font-weight: bold; margin-bottom: 8px;">Control ${uniqueControl.code}</div>
      <div style="font-size: 11px; color: #666; margin-bottom: 6px;">Courses:</div>
      ${coursesList}
    </div>
  `

  circle.bindPopup(popupContent, {
    closeButton: true,
    minWidth: 180,
  })

  return circle
}

/**
 * Create a finish marker (double circle) - always purple
 * Outer circle: 6mm at 1:15,000 = 90m diameter (45m radius)
 * Inner circle: 4mm at 1:15,000 = 60m diameter (30m radius)
 */
export function createFinishMarker(
  position: Position,
  courseName: string,
  transform: CoordinateTransform = pos => [pos.lat, pos.lng],
  zoom: number = 15
): L.LayerGroup {
  const coords = transform(position)
  const layerGroup = L.layerGroup()

  // Outer circle: 6mm at 1:15,000 = 90m diameter (45m radius)
  const outerCircle = L.circle(coords, {
    radius: 45,
    fillColor: 'transparent',
    fillOpacity: 0,
    color: '#9333ea',
    weight: calculateLineWidth(zoom),
  })
  outerCircle.addTo(layerGroup)

  // Inner circle: 4mm at 1:15,000 = 60m diameter (30m radius)
  const innerCircle = L.circle(coords, {
    radius: 30,
    fillColor: 'transparent',
    fillOpacity: 0,
    color: '#9333ea',
    weight: calculateLineWidth(zoom),
  })
  innerCircle.addTo(layerGroup)

  // Add popup to outer circle
  outerCircle.bindPopup(`
    <div style="font-family: Arial, sans-serif; min-width: 120px;">
      <div style="font-weight: bold; margin-bottom: 4px;">Finish</div>
      <div style="font-size: 12px; color: #666;">Course: ${courseName}</div>
    </div>
  `, {
    closeButton: true,
    minWidth: 120,
  })

  return layerGroup
}

/**
 * Calculate point at edge of a circle
 * @param from The point the line is coming from
 * @param center The center of the circle
 * @param radiusMeters The radius of the circle in meters
 * @param transform Coordinate transformation function
 */
function getCircleEdgePoint(
  from: Position,
  center: Position,
  radiusMeters: number,
  transform: CoordinateTransform
): [number, number] {
  const fromCoords = transform(from)
  const centerCoords = transform(center)

  // Calculate direction vector in METERS (not degrees)
  const centerLat = center.lat
  const metersPerDegreeLat = 111320 // Constant for latitude
  const metersPerDegreeLng = 111320 * Math.cos(centerLat * Math.PI / 180) // Varies with latitude

  // Convert lat/lng differences to meters
  const dxMeters = (centerCoords[1] - fromCoords[1]) * metersPerDegreeLng  // Longitude to meters
  const dyMeters = (centerCoords[0] - fromCoords[0]) * metersPerDegreeLat  // Latitude to meters
  const distanceMeters = Math.sqrt(dxMeters * dxMeters + dyMeters * dyMeters)

  if (distanceMeters === 0) return centerCoords

  // Normalize direction vector in meters
  const dirXMeters = dxMeters / distanceMeters
  const dirYMeters = dyMeters / distanceMeters

  // Move back from center by radius in meters
  const offsetXMeters = dirXMeters * radiusMeters
  const offsetYMeters = dirYMeters * radiusMeters

  // Convert offset from meters back to degrees
  const offsetLng = offsetXMeters / metersPerDegreeLng
  const offsetLat = offsetYMeters / metersPerDegreeLat

  // Move back from center by the offset
  return [
    centerCoords[0] - offsetLat,  // Latitude
    centerCoords[1] - offsetLng   // Longitude
  ]
}

/**
 * Calculate point at edge of finish circle
 */
function getFinishEdgePoint(
  lastControl: Position,
  finish: Position,
  transform: CoordinateTransform
): [number, number] {
  // Finish outer circle has 45m radius (6mm at 1:15,000)
  return getCircleEdgePoint(lastControl, finish, 45, transform)
}

/**
 * Create polyline segments connecting course controls
 * Each segment stops at control circle edges, creating gaps at controls
 * Returns an array of polylines
 */
export function createCoursePolylines(
  course: Course,
  transform: CoordinateTransform = pos => [pos.lat, pos.lng],
  zoom: number = 15
): L.Polyline[] {
  const polylines: L.Polyline[] = []
  const controlRadius = 37.5 // Control circle radius in meters

  const polylineOptions: L.PolylineOptions = {
    color: course.color,
    weight: calculateLineWidth(zoom),
    opacity: 0.7,
    lineJoin: 'round' as const,
    lineCap: 'round' as const,
  }

  if (course.controls.length === 0) {
    // No controls, just start to finish
    const positions = [
      transform(course.start),
      transform(course.finish)
    ]
    polylines.push(L.polyline(positions, polylineOptions))
    return polylines
  }

  // Segment 1: Start to first control
  const firstControlEntry = getCircleEdgePoint(
    course.start,
    course.controls[0].position,
    controlRadius,
    transform
  )
  polylines.push(L.polyline([
    transform(course.start),
    firstControlEntry
  ], polylineOptions))

  // Segments between controls
  for (let i = 0; i < course.controls.length - 1; i++) {
    const currentControl = course.controls[i]
    const nextControl = course.controls[i + 1]

    // Exit edge of current control (toward next control)
    const exitEdge = getCircleEdgePoint(
      nextControl.position,
      currentControl.position,
      controlRadius,
      transform
    )

    // Entry edge of next control (from current control)
    const entryEdge = getCircleEdgePoint(
      currentControl.position,
      nextControl.position,
      controlRadius,
      transform
    )

    polylines.push(L.polyline([exitEdge, entryEdge], polylineOptions))
  }

  // Last segment: Last control to finish
  const lastControl = course.controls[course.controls.length - 1]
  const lastControlExit = getCircleEdgePoint(
    course.finish,
    lastControl.position,
    controlRadius,
    transform
  )
  const finishEntry = getFinishEdgePoint(lastControl.position, course.finish, transform)

  polylines.push(L.polyline([lastControlExit, finishEntry], polylineOptions))

  return polylines
}

/**
 * Create a layer group for a course (without adding to map)
 * Only includes course-specific elements: start, finish, and polyline segments
 * Controls are rendered separately in ControlsLayer
 */
export function createCourseLayer(
  course: Course,
  transform: CoordinateTransform = pos => [pos.lat, pos.lng],
  zoom: number = 15
): L.LayerGroup {
  const layerGroup = L.layerGroup()

  // Add course line segments (with gaps at controls)
  const polylines = createCoursePolylines(course, transform, zoom)
  polylines.forEach(polyline => polyline.addTo(layerGroup))

  // Add start marker
  const startMarker = createStartMarker(course.start, course.name, transform, zoom)
  startMarker.addTo(layerGroup)

  // Add finish marker
  const finishMarker = createFinishMarker(course.finish, course.name, transform, zoom)
  finishMarker.addTo(layerGroup)

  return layerGroup
}

/**
 * Create a layer group for all unique controls (always visible)
 */
export function createControlsLayer(
  uniqueControls: UniqueControl[],
  transform: CoordinateTransform = pos => [pos.lat, pos.lng],
  zoom: number = 15
): L.LayerGroup {
  const layerGroup = L.layerGroup()

  uniqueControls.forEach(uniqueControl => {
    const marker = createControlMarker(uniqueControl, transform, zoom)
    marker.addTo(layerGroup)
  })

  return layerGroup
}
