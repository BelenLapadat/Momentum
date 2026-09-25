import { db, newId, nowIso } from './db'
import type { Timeline } from '../types'
import { TimelineSchema } from '../types'

export type TimelineInput = {
  title: string
  description?: string
}

export const timelineRepository = {
  async list(): Promise<Timeline[]> {
    const rows = await db.timelines.orderBy('updatedAt').reverse().toArray()
    return rows.map((row) => TimelineSchema.parse(row))
  },

  async get(id: string): Promise<Timeline | undefined> {
    const row = await db.timelines.get(id)
    return row ? TimelineSchema.parse(row) : undefined
  },

  async create(input: TimelineInput): Promise<Timeline> {
    const stamp = nowIso()
    const timeline = TimelineSchema.parse({
      id: newId(),
      title: input.title.trim(),
      description: input.description?.trim() ?? '',
      createdAt: stamp,
      updatedAt: stamp,
    })
    await db.timelines.add(timeline)
    return timeline
  },

  async update(
    id: string,
    patch: Partial<Pick<Timeline, 'title' | 'description'>>,
  ): Promise<Timeline> {
    const existing = await this.get(id)
    if (!existing) throw new Error('Timeline not found')
    const updated = TimelineSchema.parse({
      ...existing,
      title: patch.title?.trim() ?? existing.title,
      description:
        patch.description !== undefined
          ? patch.description.trim()
          : existing.description,
      updatedAt: nowIso(),
    })
    await db.timelines.put(updated)
    return updated
  },

  async touch(id: string): Promise<void> {
    const existing = await db.timelines.get(id)
    if (!existing) return
    await db.timelines.put({ ...existing, updatedAt: nowIso() })
  },

  async remove(id: string): Promise<void> {
    await db.transaction('rw', db.timelines, db.events, async () => {
      await db.events.where('timelineId').equals(id).delete()
      await db.timelines.delete(id)
    })
  },
}
