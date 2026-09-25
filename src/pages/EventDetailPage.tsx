import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useBlocker, useNavigate, useParams } from 'react-router-dom'
import { eventRepository } from '../data/eventRepository'
import { timelineRepository } from '../data/timelineRepository'
import type { Timeline, TimelineEvent } from '../types'
import { ConfirmDialog } from '../components/ConfirmDialog'
import { downloadEventDocx } from '../lib/docxExport'

export function EventDetailPage() {
  const { timelineId = '', eventId } = useParams()
  const isNew = eventId === undefined || eventId === 'new'
  const navigate = useNavigate()

  const [timeline, setTimeline] = useState<Timeline | null>(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [initial, setInitial] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [existing, setExisting] = useState<TimelineEvent | null>(null)

  useEffect(() => {
    async function load() {
      const t = await timelineRepository.get(timelineId)
      setTimeline(t ?? null)
      if (!isNew && eventId) {
        const event = await eventRepository.get(eventId)
        if (event && event.timelineId === timelineId) {
          setExisting(event)
          setTitle(event.title)
          setBody(event.body ?? '')
          setYear(String(event.year))
          setMonth(event.month != null ? String(event.month) : '')
          setDay(event.day != null ? String(event.day) : '')
          setInitial(
            snapshot({
              title: event.title,
              body: event.body ?? '',
              year: String(event.year),
              month: event.month != null ? String(event.month) : '',
              day: event.day != null ? String(event.day) : '',
            }),
          )
        }
      } else {
        setInitial(snapshot({ title: '', body: '', year: '', month: '', day: '' }))
      }
      setLoading(false)
    }
    void load()
  }, [timelineId, eventId, isNew])

  const currentSnap = useMemo(
    () => snapshot({ title, body, year, month, day }),
    [title, body, year, month, day],
  )
  const dirty = currentSnap !== initial

  const blocker = useBlocker(dirty && !saving)

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setError(null)
    const yearNum = Number.parseInt(year, 10)
    if (!title.trim()) {
      setError('Title is required')
      return
    }
    if (Number.isNaN(yearNum)) {
      setError('Year must be an integer')
      return
    }
    const monthNum = month.trim() === '' ? undefined : Number.parseInt(month, 10)
    const dayNum = day.trim() === '' ? undefined : Number.parseInt(day, 10)
    if (monthNum != null && (monthNum < 1 || monthNum > 12 || Number.isNaN(monthNum))) {
      setError('Month must be 1–12')
      return
    }
    if (dayNum != null && monthNum == null) {
      setError('Day requires a month')
      return
    }
    if (dayNum != null && (dayNum < 1 || dayNum > 31 || Number.isNaN(dayNum))) {
      setError('Day must be 1–31')
      return
    }

    setSaving(true)
    try {
      if (isNew) {
        await eventRepository.create({
          timelineId,
          title: title.trim(),
          body,
          year: yearNum,
          month: monthNum,
          day: dayNum,
        })
      } else if (eventId) {
        await eventRepository.update(eventId, {
          title: title.trim(),
          body,
          year: yearNum,
          month: monthNum,
          day: dayNum,
        })
      }
      setInitial(currentSnap)
      navigate(`/timeline/${timelineId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="app-shell">
        <p className="text-[var(--ink-muted)]">Loading…</p>
      </div>
    )
  }

  if (!timeline || (!isNew && !existing)) {
    return (
      <div className="app-shell mx-auto max-w-xl">
        <p>Event not found.</p>
        <Link className="btn btn-ghost mt-4 inline-flex" to={`/timeline/${timelineId}`}>
          Back to timeline
        </Link>
      </div>
    )
  }

  return (
    <div className="app-shell mx-auto max-w-2xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/timeline/${timelineId}`}
          className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
          onClick={(e) => {
            if (dirty) {
              e.preventDefault()
              if (
                window.confirm(
                  'You have unsaved changes. Leave without saving?',
                )
              ) {
                navigate(`/timeline/${timelineId}`)
              }
            }
          }}
        >
          ← Timeline
        </Link>
        <div className="flex flex-wrap gap-2">
          {!isNew ? (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                const yearNum = Number.parseInt(year, 10)
                const monthNum =
                  month.trim() === ''
                    ? undefined
                    : Number.parseInt(month, 10)
                const dayNum =
                  day.trim() === '' ? undefined : Number.parseInt(day, 10)
                void downloadEventDocx({
                  id: existing?.id ?? 'draft',
                  timelineId,
                  title: title.trim() || 'Untitled',
                  body,
                  year: Number.isNaN(yearNum) ? 0 : yearNum,
                  ...(monthNum != null && !Number.isNaN(monthNum)
                    ? { month: monthNum }
                    : {}),
                  ...(dayNum != null &&
                  monthNum != null &&
                  !Number.isNaN(dayNum)
                    ? { day: dayNum }
                    : {}),
                  createdAt: existing?.createdAt ?? new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                })
              }}
            >
              Export .docx
            </button>
          ) : null}
          {!isNew ? (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => setConfirmDelete(true)}
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>

      <form className="surface rounded-2xl p-6" onSubmit={handleSave}>
        <h1 className="brand m-0 mb-6 text-3xl">
          {isNew ? 'New event' : 'Edit event'}
        </h1>

        <div className="flex flex-col gap-4">
          <div className="field">
            <label htmlFor="event-title">Title</label>
            <input
              id="event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="field">
              <label htmlFor="event-year">Year</label>
              <input
                id="event-year"
                inputMode="numeric"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
                placeholder="1848"
              />
            </div>
            <div className="field">
              <label htmlFor="event-month">Month</label>
              <input
                id="event-month"
                inputMode="numeric"
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                placeholder="optional"
              />
            </div>
            <div className="field">
              <label htmlFor="event-day">Day</label>
              <input
                id="event-day"
                inputMode="numeric"
                value={day}
                onChange={(e) => setDay(e.target.value)}
                placeholder="optional"
              />
            </div>
          </div>

          <div className="field">
            <label htmlFor="event-body">Body</label>
            <textarea
              id="event-body"
              rows={12}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write the document…"
            />
          </div>

          {error ? (
            <p className="m-0 text-sm text-[var(--danger)]">{error}</p>
          ) : null}

          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                if (
                  !dirty ||
                  window.confirm(
                    'You have unsaved changes. Leave without saving?',
                  )
                ) {
                  navigate(`/timeline/${timelineId}`)
                }
              }}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              Save
            </button>
          </div>
        </div>
      </form>

      {confirmDelete && eventId ? (
        <ConfirmDialog
          title="Delete event?"
          message={`Delete “${title || 'this event'}”? This cannot be undone.`}
          confirmLabel="Delete"
          danger
          onCancel={() => setConfirmDelete(false)}
          onConfirm={async () => {
            await eventRepository.remove(eventId)
            navigate(`/timeline/${timelineId}`)
          }}
        />
      ) : null}

      {blocker.state === 'blocked' ? (
        <ConfirmDialog
          title="Unsaved changes"
          message="You have unsaved changes. Leave without saving?"
          confirmLabel="Leave"
          danger
          onCancel={() => blocker.reset?.()}
          onConfirm={() => blocker.proceed?.()}
        />
      ) : null}
    </div>
  )
}

function snapshot(values: {
  title: string
  body: string
  year: string
  month: string
  day: string
}): string {
  return JSON.stringify(values)
}
