import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { Course } from '../../../shared/types'
import { createCourseLayer } from '../services/courseRenderer'

interface CourseLayerProps {
  map: L.Map | null
  courses: Course[]
}

export function CourseLayer({ map, courses }: CourseLayerProps) {
  const layersRef = useRef<Map<string, L.LayerGroup>>(new Map())

  useEffect(() => {
    if (!map) return

    console.log('CourseLayer effect running with', courses.length, 'courses')

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
            const layer = createCourseLayer(course)
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
  }, [map, courses])

  return null // This component doesn't render anything itself
}
