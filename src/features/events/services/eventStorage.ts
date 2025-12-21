import { eventDB } from '../../../db/eventDB'
import { Event, Course } from '../../../shared/types'
import { ParsedMapData } from '../../upload/services/mapProcessor'

/**
 * Generate a unique event ID
 */
function generateEventId(): string {
  return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Generate a shareable URL for an event
 */
function generateShareUrl(eventId: string): string {
  const baseUrl = window.location.origin
  return `${baseUrl}/map/${eventId}`
}

/**
 * Create and save a new event
 */
export async function createEvent(
  name: string,
  date: string,
  mapData: ParsedMapData,
  courses: Course[],
  isDemo: boolean = false
): Promise<Event> {
  const eventId = generateEventId()

  const event: Event = {
    id: eventId,
    name,
    date,
    map: {
      imageBlob: mapData.imageBlob,
      bounds: mapData.bounds,
      georef: mapData.georef,
    },
    courses,
    createdAt: new Date(),
    isDemo,
    shareUrl: generateShareUrl(eventId),
  }

  await eventDB.add(event)

  return event
}

/**
 * Load an event by ID
 */
export async function loadEvent(eventId: string): Promise<Event | null> {
  const event = await eventDB.getById(eventId)
  return event || null
}

/**
 * Get all events
 */
export async function getAllEvents(): Promise<Event[]> {
  return eventDB.getAll()
}

/**
 * Delete an event
 */
export async function deleteEvent(eventId: string): Promise<void> {
  await eventDB.delete(eventId)
}

/**
 * Get storage usage estimate (in bytes)
 */
export async function getStorageUsage(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return estimate.usage || 0
  }
  return 0
}

/**
 * Get storage quota estimate (in bytes)
 */
export async function getStorageQuota(): Promise<number> {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return estimate.quota || 0
  }
  return 0
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}
