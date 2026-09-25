import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { timelineRepository } from '../data/timelineRepository'
import { eventRepository } from '../data/eventRepository'
import type { Orientation, Scale, Timeline, TimelineEvent } from '../types'
import {
  eventMatchesQuery,
  isEventInFocus,
  monthAbbrev,
  stepFocus,
  type FocusCursor,
} from '../lib/chronology'
import { loadOrientation, loadScale, saveOrientation, saveScale } from '../lib/prefs'
import {
  OrientationControl,
  ScaleControl,
} from '../components/TimelineControls'
import { TimelineView } from '../components/TimelineView'

export function TimelinePage() {
  const { timelineId = '' } = useParams()
  const navigate = useNavigate()
  const [timeline, setTimeline] = useState<Timeline | null>(null)
  const [events, setEvents] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [scale, setScale] = useState<Scale>(() => loadScale())
  const [orientation, setOrientation] = useState<Orientation>(() =>
    loadOrientation(),
  )
  const [searchQuery, setSearchQuery] = useState('')
  const [focus, setFocus] = useState<FocusCursor>(() => {
    const now = new Date()
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1,
      day: now.getDate(),
    }
  })
  const [focusYearInput, setFocusYearInput] = useState(String(focus.year))
  const didInitFocus = useRef(false)

  const refresh = useCallback(async () => {
    const t = await timelineRepository.get(timelineId)
    if (!t) {
      setTimeline(null)
      setLoading(false)
      return
    }
    setTimeline(t)
    const list = await eventRepository.listByTimeline(timelineId)
    setEvents(list)
    if (!didInitFocus.current && list.length > 0) {
      const mid = list[Math.floor(list.length / 2)]!
      setFocus((prev) => ({
        year: mid.year,
        month: mid.month ?? prev.month,
        day: mid.day ?? prev.day,
      }))
      setFocusYearInput(String(mid.year))
      didInitFocus.current = true
    }
    setLoading(false)
  }, [timelineId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  const visibleEvents = useMemo(() => {
    return events.filter((event) => {
      if (!eventMatchesQuery(event, searchQuery)) return false
      if (scale === 'year') return true
      return isEventInFocus(event, scale, focus)
    })
  }, [events, searchQuery, scale, focus])

  function handleScaleChange(next: Scale) {
    setScale(next)
    saveScale(next)
  }

  function handleOrientationChange(next: Orientation) {
    setOrientation(next)
    saveOrientation(next)
  }

  if (loading) {
    return (
      <div className="app-shell">
        <p className="text-[var(--ink-muted)]">Loading…</p>
      </div>
    )
  }

  if (!timeline) {
    return (
      <div className="app-shell mx-auto max-w-xl">
        <p>Timeline not found.</p>
        <Link className="btn btn-ghost mt-4 inline-flex" to="/">
          Back to dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="app-shell mx-auto max-w-5xl">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            to="/"
            className="text-sm text-[var(--ink-muted)] hover:text-[var(--ink)]"
          >
            ← Dashboard
          </Link>
          <h1 className="brand m-0 mt-2 text-4xl md:text-5xl">
            {timeline.title}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            className="btn btn-primary"
            to={`/timeline/${timeline.id}/events/new`}
          >
            Add event
          </Link>
          <Link
            className="btn btn-ghost"
            to={`/timeline/${timeline.id}/settings`}
          >
            Settings
          </Link>
        </div>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <ScaleControl scale={scale} onChange={handleScaleChange} />
        <OrientationControl
          orientation={orientation}
          onChange={handleOrientationChange}
        />
        <div className="field min-w-[12rem] flex-1">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <input
            id="search"
            placeholder="Search title or body…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {scale !== 'year' ? (
        <div className="mb-4 flex flex-wrap items-end gap-2">
          <div className="field w-32">
            <label htmlFor="focus-year">Focus year</label>
            <input
              id="focus-year"
              inputMode="numeric"
              value={focusYearInput}
              onChange={(e) => setFocusYearInput(e.target.value)}
              onBlur={() => {
                const year = Number.parseInt(focusYearInput, 10)
                if (!Number.isNaN(year)) {
                  setFocus((prev) => ({ ...prev, year }))
                  setFocusYearInput(String(year))
                } else {
                  setFocusYearInput(String(focus.year))
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  ;(e.target as HTMLInputElement).blur()
                }
              }}
            />
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              const next = stepFocus(
                focus,
                scale === 'month' ? 'month' : 'day',
                -1,
              )
              setFocus(next)
              setFocusYearInput(String(next.year))
            }}
          >
            ← Prev
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => {
              const next = stepFocus(
                focus,
                scale === 'month' ? 'month' : 'day',
                1,
              )
              setFocus(next)
              setFocusYearInput(String(next.year))
            }}
          >
            Next →
          </button>
          <p className="m-0 text-sm text-[var(--ink-muted)]">
            {scale === 'month'
              ? `Showing ${focus.year}`
              : `Showing ${monthAbbrev(focus.month)} ${focus.year}`}
          </p>
        </div>
      ) : null}

      <TimelineView
        timelineId={timeline.id}
        events={visibleEvents}
        scale={scale}
        orientation={orientation}
        focus={focus}
        searchQuery={searchQuery}
      />

      {events.length === 0 ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate(`/timeline/${timeline.id}/events/new`)}
          >
            Add event
          </button>
        </div>
      ) : null}
    </div>
  )
}
