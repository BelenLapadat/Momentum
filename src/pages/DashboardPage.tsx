import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { timelineRepository } from '../data/timelineRepository'
import { eventRepository } from '../data/eventRepository'
import type { Timeline } from '../types'
import { TimelineFormModal } from '../components/TimelineFormModal'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { IconDelete, IconEdit, IconOpen } from '../components/Icons'

function formatUpdated(iso: string): string {
  const date = new Date(iso)
  return date.toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function DashboardPage() {
  const [timelines, setTimelines] = useState<Timeline[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<Timeline | null>(null)
  const [deleting, setDeleting] = useState<Timeline | null>(null)

  const refresh = useCallback(async () => {
    await eventRepository.purgeInvalid()
    const list = await timelineRepository.list()
    setTimelines(list)
    const nextCounts: Record<string, number> = {}
    await Promise.all(
      list.map(async (t) => {
        nextCounts[t.id] = await eventRepository.countByTimeline(t.id)
      }),
    )
    setCounts(nextCounts)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return (
    <div className="app-shell mx-auto max-w-3xl">
      <header className="mb-10">
        <p className="m-0 text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
          Local timelines
        </p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="brand m-0 text-5xl md:text-6xl">Momentum</h1>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setCreating(true)}
          >
            New timeline
          </button>
        </div>
        <p className="mt-3 max-w-xl text-[var(--ink-muted)]">
          Place events in time. See what happens together, and what comes next.
        </p>
      </header>

      {loading ? (
        <p className="text-[var(--ink-muted)]">Loading…</p>
      ) : timelines.length === 0 ? (
        <div className="surface rounded-xl px-6 py-16 text-center">
          <p className="brand m-0 text-2xl">No timelines yet</p>
          <p className="mt-2 text-[var(--ink-muted)]">
            Create one to start placing events in time.
          </p>
          <button
            type="button"
            className="btn btn-primary mt-6"
            onClick={() => setCreating(true)}
          >
            New timeline
          </button>
        </div>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {timelines.map((timeline) => (
            <li key={timeline.id} className="surface rounded-xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="brand m-0 text-2xl">{timeline.title}</h2>
                  {timeline.description ? (
                    <p className="mt-1 text-[var(--ink-muted)]">
                      {timeline.description}
                    </p>
                  ) : null}
                  <p className="mt-2 text-sm text-[var(--ink-muted)]">
                    {counts[timeline.id] ?? 0} events · Updated{' '}
                    {formatUpdated(timeline.updatedAt)}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  <Link
                    className="btn btn-primary btn-icon"
                    to={`/timeline/${timeline.id}`}
                    aria-label={`Open ${timeline.title}`}
                    title="Open"
                  >
                    <IconOpen />
                  </Link>
                  <button
                    type="button"
                    className="btn btn-ghost btn-icon"
                    onClick={() => setEditing(timeline)}
                    aria-label={`Edit ${timeline.title}`}
                    title="Edit"
                  >
                    <IconEdit />
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger btn-icon"
                    onClick={() => setDeleting(timeline)}
                    aria-label={`Delete ${timeline.title}`}
                    title="Delete"
                  >
                    <IconDelete />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {creating ? (
        <TimelineFormModal
          title="New timeline"
          submitLabel="Create"
          onClose={() => setCreating(false)}
          onSubmit={async (values) => {
            await timelineRepository.create(values)
            await refresh()
          }}
        />
      ) : null}

      {editing ? (
        <TimelineFormModal
          title="Edit timeline"
          initialTitle={editing.title}
          initialDescription={editing.description}
          submitLabel="Save"
          onClose={() => setEditing(null)}
          onSubmit={async (values) => {
            await timelineRepository.update(editing.id, values)
            await refresh()
          }}
        />
      ) : null}

      {deleting ? (
        <ConfirmDialog
          title="Delete timeline?"
          message={`Delete “${deleting.title}” and all ${counts[deleting.id] ?? 0} events? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setDeleting(null)}
          onConfirm={async () => {
            await timelineRepository.remove(deleting.id)
            setDeleting(null)
            await refresh()
          }}
        />
      ) : null}
    </div>
  )
}
