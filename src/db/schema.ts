import Dexie, { Table } from 'dexie'
import { Event } from '../shared/types'

export class CourseViewDB extends Dexie {
  events!: Table<Event, string>

  constructor() {
    super('CourseViewDB')

    this.version(1).stores({
      events: 'id, name, date, createdAt, isDemo',
    })
  }
}

export const db = new CourseViewDB()
