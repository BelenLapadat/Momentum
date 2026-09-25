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

async function deleteInvalidEvents(
  rows: Array<{ id: string; timelineId?: string }>,
): Promise<number> {
  if (rows.length === 0) return 0
  const timelineIds = new Set(
    rows.map((row) => row.timelineId).filter((id): id is string => Boolean(id)),
  )
  await db.transaction('rw', db.events, db.timelines, async () => {
    await db.events.bulkDelete(rows.map((row) => row.id))
    for (const timelineId of timelineIds) {
      await timelineRepository.touch(timelineId)
    }
  })
  return rows.length
}

export const eventRepository = {
  /** Remove stored events that fail validation (e.g. Feb 30). */
  async purgeInvalid(): Promise<number> {
    const rows = await db.events.toArray()
    const invalid = rows.filter((row) => !EventSchema.safeParse(row).success)
    return deleteInvalidEvents(invalid)
  },

  async listByTimeline(timelineId: string): Promise<TimelineEvent[]> {
    const rows = await db.events.where('timelineId').equals(timelineId).toArray()
    const valid: TimelineEvent[] = []
    const invalid: Array<{ id: string; timelineId?: string }> = []

    for (const row of rows) {
      const result = EventSchema.safeParse(row)
      if (result.success) {
        valid.push(result.data)
      } else {
        invalid.push(row)
      }
    }

    if (invalid.length > 0) {
      await deleteInvalidEvents(invalid)
    }

    return sortEventsChronologically(valid)
  },

  async get(id: string): Promise<TimelineEvent | undefined> {
    const row = await db.events.get(id)
    if (!row) return undefined
    const result = EventSchema.safeParse(row)
    if (result.success) return result.data
    await deleteInvalidEvents([row])
    return undefined
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

    await db.transaction('rw', db.events, db.timelines, async () => {
      await db.events.put(updated)
      await timelineRepository.touch(existing.timelineId)
    })
    return updated
  },

  async remove(id: string): Promise<void> {
    const row = await db.events.get(id)
    if (!row) return
    await db.transaction('rw', db.events, db.timelines, async () => {
      await db.events.delete(id)
      await timelineRepository.touch(row.timelineId)
    })
  },

  async countByTimeline(timelineId: string): Promise<number> {
    return db.events.where('timelineId').equals(timelineId).count()
  },
}
