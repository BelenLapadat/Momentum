import { db, newId, nowIso } from './db'
import { timelineRepository } from './timelineRepository'
import type { TimelineEvent } from '../types'
import { EventSchema } from '../types'
import { sortEventsChronologically } from '../lib/chronology'

export type EventInput = {
  timelineId: string
  title: string
  body?: string
  year: number
  month?: number
  day?: number
}

function toStoredEvent(event: TimelineEvent): TimelineEvent {
  const stored: TimelineEvent = {
    id: event.id,
    timelineId: event.timelineId,
    title: event.title,
    body: event.body ?? '',
    year: event.year,
    createdAt: event.createdAt,
    updatedAt: event.updatedAt,
  }
  if (event.month != null) stored.month = event.month
  if (event.month != null && event.day != null) stored.day = event.day
  return stored
}

export const eventRepository = {
  async listByTimeline(timelineId: string): Promise<TimelineEvent[]> {
    const rows = await db.events.where('timelineId').equals(timelineId).toArray()
    const parsed = rows.map((row) => EventSchema.parse(row))
    return sortEventsChronologically(parsed)
  },

  async get(id: string): Promise<TimelineEvent | undefined> {
    const row = await db.events.get(id)
    return row ? EventSchema.parse(row) : undefined
  },

  async create(input: EventInput): Promise<TimelineEvent> {
    const stamp = nowIso()
    const event = toStoredEvent(
      EventSchema.parse({
        id: newId(),
        timelineId: input.timelineId,
        title: input.title.trim(),
        body: input.body ?? '',
        year: input.year,
        ...(input.month != null ? { month: input.month } : {}),
        ...(input.month != null && input.day != null ? { day: input.day } : {}),
        createdAt: stamp,
        updatedAt: stamp,
      }),
    )
    await db.transaction('rw', db.events, db.timelines, async () => {
      await db.events.add(event)
      await timelineRepository.touch(input.timelineId)
    })
    return event
  },

  async update(
    id: string,
    patch: Partial<Omit<EventInput, 'timelineId'>>,
  ): Promise<TimelineEvent> {
    const existing = await this.get(id)
    if (!existing) throw new Error('Event not found')

    const year = patch.year ?? existing.year
    const month = 'month' in patch ? patch.month : existing.month
    const day =
      month == null
        ? undefined
        : 'day' in patch
          ? patch.day
          : existing.day

    const updated = toStoredEvent(
      EventSchema.parse({
        ...existing,
        title: patch.title?.trim() ?? existing.title,
        body: patch.body !== undefined ? patch.body : existing.body,
        year,
        ...(month != null ? { month } : {}),
        ...(month != null && day != null ? { day } : {}),
        updatedAt: nowIso(),
      }),
    )

    // Ensure cleared month/day are removed from IndexedDB
    await db.transaction('rw', db.events, db.timelines, async () => {
      await db.events.put(updated)
      await timelineRepository.touch(existing.timelineId)
    })
    return updated
  },

  async remove(id: string): Promise<void> {
    const existing = await this.get(id)
    if (!existing) return
    await db.transaction('rw', db.events, db.timelines, async () => {
      await db.events.delete(id)
      await timelineRepository.touch(existing.timelineId)
    })
  },

  async countByTimeline(timelineId: string): Promise<number> {
    return db.events.where('timelineId').equals(timelineId).count()
  },
}
