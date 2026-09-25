import { Link } from 'react-router-dom'
import type { Orientation, Scale, TimelineEvent } from '../types'
import {
  formatEventDateWithinYear,
  groupEventsByYear,
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

function splitYearEvents(events: TimelineEvent[]) {
  const undated: TimelineEvent[] = []
  const dated: TimelineEvent[] = []
  for (const event of events) {
    if (event.month == null) undated.push(event)
    else dated.push(event)
  }
  return { undated, dated }
}

export function TimelineView({
  timelineId,
  events,
  orientation,
  searchQuery,
}: TimelineViewProps) {
  if (events.length === 0) {
    return (
      <div className="surface rounded-xl px-6 py-16 text-center">
        <p className="brand m-0 text-2xl">This timeline has no events yet</p>
        <p className="mt-2 text-[var(--ink-muted)]">
          Add an event to place the first document in time.
        </p>
      </div>
    )
  }

  const groups = groupEventsByYear(events)
  const matched = searchQuery.trim().length > 0

  if (orientation === 'horizontal') {
    return (
      <div className="surface overflow-x-auto rounded-xl p-6">
        <div className="relative flex min-w-max items-start gap-10 pb-4 pt-2">
          <div className="absolute left-0 right-0 top-[2.85rem] h-px bg-[color-mix(in_srgb,var(--accent)_35%,var(--line))]" />
          {groups.map((group) => {
            const { undated, dated } = splitYearEvents(group.events)
            const showSometimeHeading =
              undated.length > 0 && group.events.length > 1

            return (
              <div
                key={group.year}
                className="relative z-10 flex min-w-[10rem] flex-col items-center gap-3"
              >
                <div className="flex flex-col items-center gap-2">
                  <span className="brand text-lg tabular-nums text-[var(--ink)]">
                    {group.year}
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-[var(--accent)] ring-[3px] ring-[var(--accent-soft)]" />
                </div>
                <div className="flex w-full flex-col gap-3">
                  {undated.length > 0 ? (
                    <div className="text-center">
                      {showSometimeHeading ? (
                        <h3 className="brand m-0 mb-1 text-sm font-medium text-[var(--ink-muted)]">
                          sometime this year
                        </h3>
                      ) : null}
                      <ul className="m-0 flex list-none flex-col gap-1 p-0">
                        {undated.map((event) => (
                          <li
                            key={event.id}
                            className={`rounded-lg px-2 py-1 ${matched ? 'marker-match' : ''}`}
                          >
                            <Link
                              to={`/timeline/${timelineId}/events/${event.id}`}
                              className="text-sm font-medium hover:underline"
                            >
                              {event.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {dated.length > 0 ? (
                    <ul className="m-0 flex list-none flex-col gap-2 p-0">
                      {dated.map((event) => (
                        <li
                          key={event.id}
                          className={`rounded-lg px-2 py-1.5 text-center ${matched ? 'marker-match' : ''}`}
                        >
                          <div className="text-[0.7rem] text-[var(--ink-muted)]">
                            {formatEventDateWithinYear(event)}
                          </div>
                          <Link
                            to={`/timeline/${timelineId}/events/${event.id}`}
                            className="text-sm font-medium hover:underline"
                          >
                            {event.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="surface rounded-xl p-6">
      <ol className="relative m-0 list-none space-y-8 p-0">
        <div className="pointer-events-none absolute bottom-4 left-[2.4rem] top-4 w-px bg-[color-mix(in_srgb,var(--accent)_40%,var(--line))]" />
        {groups.map((group) => {
          const { undated, dated } = splitYearEvents(group.events)
          const showSometimeHeading =
            undated.length > 0 && group.events.length > 1

          return (
            <li key={group.year} className="relative">
              <div className="grid grid-cols-[4.8rem_1fr] items-start gap-4">
                <div className="relative z-10 flex justify-center pt-0.5">
                  <span className="year-marker">{group.year}</span>
                </div>
                <div className="flex min-w-0 flex-col gap-3 pt-1">
                  {undated.length > 0 ? (
                    <div>
                      {showSometimeHeading ? (
                        <h3 className="brand m-0 mb-1 text-base font-medium text-[var(--ink-muted)]">
                          sometime this year
                        </h3>
                      ) : null}
                      <ul className="m-0 flex list-none flex-col gap-1 p-0">
                        {undated.map((event) => (
                          <li
                            key={event.id}
                            className={`rounded-lg px-2 py-1.5 ${matched ? 'marker-match' : ''}`}
                          >
                            <Link
                              to={`/timeline/${timelineId}/events/${event.id}`}
                              className="font-medium hover:underline"
                            >
                              {event.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {dated.length > 0 ? (
                    <ul className="m-0 flex list-none flex-col gap-1 p-0">
                      {dated.map((event) => (
                        <li
                          key={event.id}
                          className={`grid grid-cols-[5.5rem_1fr] items-baseline gap-3 rounded-lg px-2 py-2 ${matched ? 'marker-match' : ''}`}
                        >
                          <span className="text-sm text-[var(--ink-muted)]">
                            {formatEventDateWithinYear(event)}
                          </span>
                          <Link
                            to={`/timeline/${timelineId}/events/${event.id}`}
                            className="font-medium hover:underline"
                          >
                            {event.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
