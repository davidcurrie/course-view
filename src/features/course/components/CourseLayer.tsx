import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { Course, Position } from '../../../shared/types'
import { createCourseLayer } from '../services/courseRenderer'
import { latLngToUTM } from '../../../shared/utils/projection'

interface CourseLayerProps {
  map: L.Map | null
  courses: Course[]
  useProjectedCoords: boolean
}

export function CourseLayer({ map, courses, useProjectedCoords }: CourseLayerProps) {
  const layersRef = useRef<Map<string, L.LayerGroup>>(new Map())

  useEffect(() => {
    if (!map) return

    console.log('CourseLayer effect running with', courses.length, 'courses', 'useProjectedCoords:', useProjectedCoords)

    // Log map bounds for debugging
    if (map) {
      const bounds = map.getBounds()
      console.log('Map bounds:', {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest()
      })
    }

    // Create coordinate transform function
    const transform = (pos: Position): [number, number] => {
      if (useProjectedCoords) {
        // Convert WGS84 lat/lng to UTM
        const { x, y } = latLngToUTM(pos)
        const result: [number, number] = [y, x] // Leaflet Simple CRS uses [Y, X] = [northing, easting]
        console.log(`Transform: lat=${pos.lat}, lng=${pos.lng} -> UTM x=${x} (easting), y=${y} (northing) -> Leaflet coords [${result[0]}, ${result[1]}]`)
        return result
      } else {
        // Use lat/lng directly for geographic CRS
        return [pos.lat, pos.lng]
      }
    }

    // Validate map has a container
    try {
      const container = map.getContainer()
      if (!container) {
        console.warn('Map container not found, skipping course rendering')
        return
      }
    } catch (e) {
      console.warn('Error accessing map container:', e)
      return
    }

    const currentLayers = layersRef.current

    // Small delay to ensure map is fully initialized
    const timeoutId = setTimeout(() => {
      console.log('Timeout callback executing, rendering courses...')
      try {
        // Remove layers for courses that are no longer visible
        currentLayers.forEach((layer, courseId) => {
          const course = courses.find(c => c.id === courseId)
          if (!course || !course.visible) {
            console.log('Removing layer for course', courseId)
            layer.remove()
            currentLayers.delete(courseId)
          }
        })

        // Add layers for visible courses that aren't rendered yet
        courses.forEach(course => {
          console.log('Processing course:', course.name, 'visible:', course.visible, 'already rendered:', currentLayers.has(course.id))
          if (course.visible && !currentLayers.has(course.id)) {
            console.log('Creating layer for course:', course.name)
            const layer = createCourseLayer(course, transform)
            console.log('Adding layer to map...')
            layer.addTo(map)
            currentLayers.set(course.id, layer)
            console.log('Layer added successfully')
          }
        })
        console.log('Total layers now:', currentLayers.size)
      } catch (e) {
        console.error('Error rendering courses:', e)
      }
    }, 100) // 100ms delay to ensure map is ready

    // Cleanup on unmount
    return () => {
      clearTimeout(timeoutId)
      currentLayers.forEach(layer => {
        try {
          layer.remove()
        } catch (e) {
          // Ignore errors during cleanup
        }
      })
      currentLayers.clear()
    }
  }, [map, courses, useProjectedCoords])

  return null // This component doesn't render anything itself
}
