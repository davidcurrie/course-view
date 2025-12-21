import { XMLParser } from 'fast-xml-parser'
import { Course, Control, Position } from '../../../shared/types'

interface IOFControl {
  '@_id': string
  Position: {
    '@_lat': string
    '@_lng': string
  }
  Code?: string
}

interface IOFCourseControl {
  '@_type': 'Start' | 'Control' | 'Finish'
  Control?: string // Control ID reference
  '@_sequence'?: string
}

interface IOFCourse {
  '@_id'?: string
  Name: string
  CourseControl: IOFCourseControl | IOFCourseControl[]
}

interface IOFData {
  CourseData: {
    RaceCourseData?: {
      Control?: IOFControl | IOFControl[]
      Course?: IOFCourse | IOFCourse[]
    }
  }
}

/**
 * Generate a distinct color for a course
 */
function generateCourseColor(index: number): string {
  const colors = [
    '#FF6B35', // Orange
    '#004E89', // Blue
    '#F7B801', // Yellow
    '#6A0572', // Purple
    '#00C9A7', // Teal
    '#C20114', // Red
    '#6A994E', // Green
    '#BC4B51', // Rose
    '#457B9D', // Steel Blue
    '#F77F00', // Dark Orange
    '#D62828', // Crimson
    '#003049', // Dark Blue
    '#FCBF49', // Gold
    '#8338EC', // Violet
    '#14213D', // Navy
  ]

  // If we have more courses than colors, generate more
  if (index < colors.length) {
    return colors[index]
  }

  // Generate a hue-based color
  const hue = (index * 137.5) % 360 // Golden angle for better distribution
  return `hsl(${hue}, 70%, 50%)`
}

/**
 * Ensure value is an array
 */
function ensureArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

/**
 * Parse IOF XML v3 course data
 */
export async function parseCourseData(xmlContent: string): Promise<Course[]> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseAttributeValue: true,
  })

  const data: IOFData = parser.parse(xmlContent)

  if (!data.CourseData?.RaceCourseData) {
    throw new Error('Invalid IOF XML: No RaceCourseData found')
  }

  const raceData = data.CourseData.RaceCourseData

  // Parse all controls into a map
  const controlsMap = new Map<string, IOFControl>()
  const controls = ensureArray(raceData.Control)

  controls.forEach(control => {
    if (control['@_id']) {
      controlsMap.set(control['@_id'], control)
    }
  })

  // Parse courses
  const iofCourses = ensureArray(raceData.Course)
  const courses: Course[] = []

  iofCourses.forEach((iofCourse, index) => {
    const courseControls = ensureArray(iofCourse.CourseControl)

    let start: Position | null = null
    let finish: Position | null = null
    const controls: Control[] = []

    courseControls.forEach((cc, sequence) => {
      if (cc['@_type'] === 'Start') {
        // Start position
        const controlId = cc.Control
        if (controlId) {
          const control = controlsMap.get(controlId)
          if (control?.Position) {
            start = {
              lat: parseFloat(control.Position['@_lat']),
              lng: parseFloat(control.Position['@_lng']),
            }
          }
        }
      } else if (cc['@_type'] === 'Finish') {
        // Finish position
        const controlId = cc.Control
        if (controlId) {
          const control = controlsMap.get(controlId)
          if (control?.Position) {
            finish = {
              lat: parseFloat(control.Position['@_lat']),
              lng: parseFloat(control.Position['@_lng']),
            }
          }
        }
      } else if (cc['@_type'] === 'Control' || !cc['@_type']) {
        // Regular control
        const controlId = cc.Control
        if (controlId) {
          const control = controlsMap.get(controlId)
          if (control?.Position) {
            controls.push({
              id: controlId,
              code: control.Code || controlId,
              position: {
                lat: parseFloat(control.Position['@_lat']),
                lng: parseFloat(control.Position['@_lng']),
              },
              number: sequence + 1, // Control number in sequence
            })
          }
        }
      }
    })

    // Only add course if it has start, finish, and at least one control
    if (start && finish && controls.length > 0) {
      courses.push({
        id: iofCourse['@_id'] || `course-${index}`,
        name: iofCourse.Name || `Course ${index + 1}`,
        controls,
        start,
        finish,
        color: generateCourseColor(index),
        visible: true, // All courses visible by default
      })
    }
  })

  if (courses.length === 0) {
    throw new Error('No valid courses found in IOF XML')
  }

  return courses
}
