import {
  ExportPayloadSchema,
  type ExportPayload,
  type TimelineEvent,
} from '../types'
import { eventRepository } from '../data/eventRepository'
import { timelineRepository } from '../data/timelineRepository'
import { db, newId, nowIso } from '../data/db'

export type ConflictChoice = 'keep' | 'overwrite'
export type ImportMode = 'merge' | 'create'

export type ImportConflict = {
  imported: {
    id: string
    title: string
    body: string
    year: number
    month?: number
    day?: number
  }
  existing: TimelineEvent
}

export function buildExportPayload(
  timeline: { id: string; title: string; description?: string },
  events: TimelineEvent[],
): ExportPayload {
  return ExportPayloadSchema.parse({
    version: 1,
    exportedAt: nowIso(),
    timeline: {
      id: timeline.id,
      title: timeline.title,
      description: timeline.description ?? '',
    },
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      body: e.body ?? '',
      year: e.year,
      ...(e.month != null ? { month: e.month } : {}),
      ...(e.day != null ? { day: e.day } : {}),
    })),
  })
}

export function parseExportPayload(raw: unknown): ExportPayload {
  return ExportPayloadSchema.parse(raw)
}

export function downloadJson(filename: string, data: unknown): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export async function findImportConflicts(
  timelineId: string,
  payload: ExportPayload,
): Promise<ImportConflict[]> {
  const existing = await eventRepository.listByTimeline(timelineId)
  const byId = new Map(existing.map((e) => [e.id, e]))
  const conflicts: ImportConflict[] = []

  for (const item of payload.events) {
    if (!item.id) continue
    const match = byId.get(item.id)
    if (match) {
      conflicts.push({
        imported: {
          id: item.id,
          title: item.title,
          body: item.body ?? '',
          year: item.year,
          ...(item.month != null ? { month: item.month } : {}),
          ...(item.day != null ? { day: item.day } : {}),
        },
        existing: match,
      })
    }
  }
  return conflicts
}

async function putEventWithId(
  timelineId: string,
  item: {
    id: string
    title: string
    body?: string
    year: number
    month?: number
    day?: number
  },
): Promise<void> {
  const stamp = nowIso()
  await db.events.put({
    id: item.id,
    timelineId,
    title: item.title.trim(),
    body: item.body ?? '',
    year: item.year,
    ...(item.month != null ? { month: item.month } : {}),
    ...(item.day != null && item.month != null ? { day: item.day } : {}),
    createdAt: stamp,
    updatedAt: stamp,
  })
  await timelineRepository.touch(timelineId)
}

export async function importPayload(options: {
  mode: ImportMode
  currentTimelineId?: string
  payload: ExportPayload
  conflictChoices: Record<string, ConflictChoice>
}): Promise<{ timelineId: string }> {
  const { mode, payload, conflictChoices } = options

  let timelineId: string
  if (mode === 'create') {
    const created = await timelineRepository.create({
      title: payload.timeline.title || 'Imported timeline',
      description: payload.timeline.description,
    })
    timelineId = created.id
  } else {
    if (!options.currentTimelineId) {
      throw new Error('currentTimelineId required for merge')
    }
    timelineId = options.currentTimelineId
  }

  for (const item of payload.events) {
    // R3: no id → treat as new event
    if (!item.id) {
      await eventRepository.create({
        timelineId,
        title: item.title,
        body: item.body,
        year: item.year,
        month: item.month,
        day: item.day,
      })
      continue
    }

    const existing = await eventRepository.get(item.id)

    if (existing && existing.timelineId === timelineId) {
      const choice = conflictChoices[item.id] ?? 'keep'
      if (choice === 'overwrite') {
        await eventRepository.update(item.id, {
          title: item.title,
          body: item.body,
          year: item.year,
          month: item.month,
          day: item.day,
        })
      }
      continue
    }

    if (existing && existing.timelineId !== timelineId) {
      // Same id already used elsewhere — create a fresh event
      await eventRepository.create({
        timelineId,
        title: item.title,
        body: item.body,
        year: item.year,
        month: item.month,
        day: item.day,
      })
      continue
    }

    await putEventWithId(timelineId, {
      id: item.id || newId(),
      title: item.title,
      body: item.body,
      year: item.year,
      month: item.month,
      day: item.day,
    })
  }

  return { timelineId }
}
