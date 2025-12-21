import { Position } from './map'

export interface Course {
  id: string
  name: string
  controls: Control[]
  start: Position
  finish: Position
  color: string
  visible: boolean
}

export interface Control {
  id: string
  code: string
  position: Position
  number: number
  description?: string
}
