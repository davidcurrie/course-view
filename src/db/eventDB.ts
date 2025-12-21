import { db } from './schema'
import { Event } from '../shared/types'

export const eventDB = {
  async getAll(): Promise<Event[]> {
    return db.events.toArray()
  },

  async getById(id: string): Promise<Event | undefined> {
    return db.events.get(id)
  },

  async add(event: Event): Promise<string> {
    return db.events.add(event)
  },

  async update(id: string, changes: Partial<Event>): Promise<number> {
    return db.events.update(id, changes)
  },

  async delete(id: string): Promise<void> {
    await db.events.delete(id)
  },

  async clear(): Promise<void> {
    await db.events.clear()
  },

  async getDemoEvents(): Promise<Event[]> {
    return db.events.where('isDemo').equals(1).toArray()
  },
}
