import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapUpload } from './MapUpload'
import { CourseUpload } from './CourseUpload'
import { ValidationErrors } from './ValidationErrors'
import { Button } from '../../../shared/components/Button'
import { Loading } from '../../../shared/components/Loading'
import { processJpegWorldFile } from '../services/mapProcessor'
import { processKmzFile } from '../services/kmzProcessor'
import { parseCourseData } from '../services/courseParser'
import {
  validateMapUpload,
  validateKmzFile,
  validateCourseFile,
  validateCourseFileContent,
} from '../services/fileValidator'
import { createEvent } from '../../events/services/eventStorage'

export function UploadPage() {
  const navigate = useNavigate()

  const [eventName, setEventName] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [mapFiles, setMapFiles] = useState<{ image: File; world?: File } | null>(null)
  const [courseFile, setCourseFile] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [errors, setErrors] = useState<string[]>([])

  const handleMapSelect = (imageFile: File, worldFile?: File) => {
    setMapFiles({ image: imageFile, world: worldFile })
    setErrors([])
  }

  const handleCourseSelect = (file: File) => {
    setCourseFile(file)
    setErrors([])
  }

  const handleSubmit = async () => {
    const validationErrors: string[] = []

    // Validate event details
    if (!eventName.trim()) {
      validationErrors.push('Event name is required')
    }

    if (!eventDate) {
      validationErrors.push('Event date is required')
    }

    if (!mapFiles) {
      validationErrors.push('Map file is required')
    }

    if (!courseFile) {
      validationErrors.push('Course file is required')
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsProcessing(true)
    setErrors([])

    try {
      // Validate and process map
      let mapData
      if (mapFiles!.world) {
        // JPEG + World File
        const validation = await validateMapUpload(mapFiles!.image, mapFiles!.world)
        if (!validation.valid) {
          setErrors(validation.errors)
          setIsProcessing(false)
          return
        }
        mapData = await processJpegWorldFile(mapFiles!.image, mapFiles!.world)
      } else {
        // KMZ
        const validation = validateKmzFile(mapFiles!.image)
        if (!validation.valid) {
          setErrors(validation.errors)
          setIsProcessing(false)
          return
        }
        mapData = await processKmzFile(mapFiles!.image)
      }

      // Validate and process course file
      const courseValidation = validateCourseFile(courseFile!)
      if (!courseValidation.valid) {
        setErrors(courseValidation.errors)
        setIsProcessing(false)
        return
      }

      const courseContentValidation = await validateCourseFileContent(courseFile!)
      if (!courseContentValidation.valid) {
        setErrors(courseContentValidation.errors)
        setIsProcessing(false)
        return
      }

      const courseText = await courseFile!.text()
      const courses = await parseCourseData(courseText)

      // Create and save event
      const event = await createEvent(eventName, eventDate, mapData, courses, false)

      // Navigate to map view
      navigate(`/map/${event.id}`)
    } catch (error) {
      console.error('Upload error:', error)
      setErrors([
        error instanceof Error ? error.message : 'An unexpected error occurred during upload',
      ])
      setIsProcessing(false)
    }
  }

  const canSubmit = eventName && eventDate && mapFiles && courseFile && !isProcessing

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-forest-800 text-white py-4 px-6">
        <div className="container mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="px-3 py-2 hover:bg-forest-700 rounded"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-2xl font-bold">Upload Event Data</h1>
            <p className="text-sm text-forest-100">Upload map and course files for a new event</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-6 max-w-3xl">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
          {/* Event Details */}
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">Event Details</h2>

            <div>
              <label htmlFor="eventName" className="block text-sm font-medium text-gray-700 mb-1">
                Event Name *
              </label>
              <input
                type="text"
                id="eventName"
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                placeholder="e.g., Spring Series Event 1"
                disabled={isProcessing}
              />
            </div>

            <div>
              <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                id="eventDate"
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-500 focus:border-transparent"
                disabled={isProcessing}
              />
            </div>
          </section>

          <hr className="border-gray-200" />

          {/* Map Upload */}
          <section>
            <MapUpload onMapSelect={handleMapSelect} />
          </section>

          <hr className="border-gray-200" />

          {/* Course Upload */}
          <section>
            <CourseUpload onCourseSelect={handleCourseSelect} />
          </section>

          {/* Validation Errors */}
          {errors.length > 0 && (
            <div className="pt-4">
              <ValidationErrors errors={errors} />
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button onClick={() => navigate('/')} variant="secondary" disabled={isProcessing}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!canSubmit} className="flex-1">
              {isProcessing ? (
                <div className="flex items-center justify-center gap-2">
                  <Loading size="sm" />
                  <span>Processing...</span>
                </div>
              ) : (
                'Create Event'
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
