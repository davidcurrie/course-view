import { Course } from './course'

export interface Event {
  id: string
  name: string
  date: string
  map: MapData
  courses: Course[]
  createdAt: Date
  isDemo: boolean
  shareUrl?: string
}

export interface MapData {
  imageBlob: Blob
  bounds: LatLngBounds
  georef: GeoReference
  projection?: string
}

export interface GeoReference {
  type: 'worldfile' | 'kmz'
  pixelSizeX: number
  pixelSizeY: number
  rotationX: number
  rotationY: number
  topLeftX: number
  topLeftY: number
}

export interface LatLngBounds {
  north: number
  south: number
  east: number
  west: number
}
