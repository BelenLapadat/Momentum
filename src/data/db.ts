import Dexie, { type EntityTable } from 'dexie'
import type { Timeline, TimelineEvent } from '../types'

export class MomentumDB extends Dexie {
  timelines!: EntityTable<Timeline, 'id'>
  events!: EntityTable<TimelineEvent, 'id'>

  constructor() {
    super('momentum')
    this.version(1).stores({
      timelines: 'id, updatedAt, title',
      events: 'id, timelineId, year, [timelineId+year]',
    })
  }
}

export const db = new MomentumDB()

export function nowIso(): string {
  return new Date().toISOString()
}

export function newId(): string {
  return crypto.randomUUID()
}
