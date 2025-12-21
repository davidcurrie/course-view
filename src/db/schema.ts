import Dexie, { Table } from 'dexie'
import { Event } from '../shared/types'

export class ForestTeamDB extends Dexie {
  events!: Table<Event, string>

  constructor() {
    super('ForestTeamDB')

    this.version(1).stores({
      events: 'id, name, date, createdAt, isDemo',
    })
  }
}

export const db = new ForestTeamDB()
