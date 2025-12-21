import { Position } from './map'

export interface GPSState {
  enabled: boolean
  position: Position | null
  accuracy: number | null
  heading: number | null
  timestamp: Date | null
  error: string | null
  autoCentering: boolean
}
