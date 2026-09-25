import { Link } from 'react-router-dom'
import type { Orientation, Scale, TimelineEvent } from '../types'
import {
  formatEventDate,
  placementForScale,
  type FocusCursor,
} from '../lib/chronology'

type TimelineViewProps = {
  timelineId: string
  events: TimelineEvent[]
  scale: Scale
  orientation: Orientation
  focus: FocusCursor
  searchQuery: string
}

export function TimelineView({
  timelineId,
  events,
  scale,
  orientation,
  focus,
  searchQuery,
}: TimelineViewProps) {
  if (events.length === 0) {
    return (
      <div className="surface rounded-2xl px-6 py-16 text-center">
        <p className="brand m-0 text-2xl">This timeline has no events yet</p>
        <p className="mt-2 text-[var(--ink-muted)]">
          Add an event to place the first document in time.
        </p>
      </div>
    )
  }

  if (orientation === 'horizontal') {
    return (
      <div className="surface overflow-x-auto rounded-2xl p-6">
        <div className="relative flex min-w-max items-start gap-8 pb-4 pt-8">
          <div className="absolute left-0 right-0 top-10 h-px bg-[var(--line)]" />
          {events.map((event) => (
            <EventMarker
              key={event.id}
              event={event}
              timelineId={timelineId}
              scale={scale}
              focus={focus}
              searchQuery={searchQuery}
              orientation="horizontal"
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="surface rounded-2xl p-6">
      <ol className="relative m-0 list-none space-y-0 p-0">
        <div className="absolute bottom-2 left-[4.75rem] top-2 w-px bg-[var(--line)]" />
        {events.map((event) => (
          <li key={event.id} className="relative">
            <EventMarker
              event={event}
              timelineId={timelineId}
              scale={scale}
              focus={focus}
              searchQuery={searchQuery}
              orientation="vertical"
            />
          </li>
        ))}
      </ol>
    </div>
  )
}

function EventMarker({
  event,
  timelineId,
  scale,
  searchQuery,
  orientation,
}: {
  event: TimelineEvent
  timelineId: string
  scale: Scale
  focus: FocusCursor
  searchQuery: string
  orientation: Orientation
}) {
  const placement = placementForScale(event, scale)
  const matched = searchQuery.trim().length > 0
  const dateLabel = formatEventDate(event)

  if (orientation === 'horizontal') {
    return (
      <div
        className={`relative z-10 flex w-40 flex-col items-center gap-2 rounded-xl px-2 py-2 ${matched ? 'marker-match' : ''}`}
      >
        <span className="text-xs text-[var(--ink-muted)]">{dateLabel}</span>
        <span className="h-3 w-3 rounded-full bg-[var(--accent)] ring-4 ring-[var(--accent-soft)]" />
        <Link
          to={`/timeline/${timelineId}/events/${event.id}`}
          className="text-center text-sm font-medium hover:underline"
        >
          {event.title}
        </Link>
        {placement.yearOnly && scale !== 'year' ? (
          <span className="text-[0.7rem] uppercase tracking-wide text-[var(--ink-muted)]">
            year-only
          </span>
        ) : null}
      </div>
    )
  }

  return (
    <div
      className={`grid grid-cols-[5.5rem_1.5rem_1fr] items-center gap-3 rounded-xl px-2 py-3 ${matched ? 'marker-match' : ''}`}
    >
      <span className="text-right text-sm tabular-nums text-[var(--ink-muted)]">
        {dateLabel}
      </span>
      <span className="relative z-10 mx-auto h-3 w-3 rounded-full bg-[var(--accent)] ring-4 ring-[var(--accent-soft)]" />
      <div className="flex flex-wrap items-baseline gap-2">
        <Link
          to={`/timeline/${timelineId}/events/${event.id}`}
          className="font-medium hover:underline"
        >
          {event.title}
        </Link>
        {placement.yearOnly && scale !== 'year' ? (
          <span className="text-[0.7rem] uppercase tracking-wide text-[var(--ink-muted)]">
            year-only
          </span>
        ) : null}
      </div>
    </div>
  )
}
