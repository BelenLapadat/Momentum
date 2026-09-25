import type { TimelineEvent } from '../types'

/** R2: missing month/day sort after more-specific dates in the same year/month. */
export function compareEventsChronologically(
  a: Pick<TimelineEvent, 'year' | 'month' | 'day'>,
  b: Pick<TimelineEvent, 'year' | 'month' | 'day'>,
): number {
  if (a.year !== b.year) return a.year - b.year

  const aMonth = a.month ?? Number.POSITIVE_INFINITY
  const bMonth = b.month ?? Number.POSITIVE_INFINITY
  if (aMonth !== bMonth) return aMonth - bMonth

  const aDay = a.day ?? Number.POSITIVE_INFINITY
  const bDay = b.day ?? Number.POSITIVE_INFINITY
  return aDay - bDay
}

export function sortEventsChronologically<T extends Pick<TimelineEvent, 'year' | 'month' | 'day'>>(
  events: T[],
): T[] {
  return [...events].sort(compareEventsChronologically)
}

export type Placement = {
  year: number
  month: number
  day: number
  yearOnly: boolean
}

/** R1: year-only events at Month/Day scale place at month 1 / day 1 with year-only cue. */
export function placementForScale(
  event: Pick<TimelineEvent, 'year' | 'month' | 'day'>,
  _scale: 'year' | 'month' | 'day',
): Placement {
  const yearOnly = event.month == null

  return {
    year: event.year,
    month: event.month ?? 1,
    day: event.day ?? 1,
    yearOnly,
  }
}

export function formatEventDate(
  event: Pick<TimelineEvent, 'year' | 'month' | 'day'>,
): string {
  const parts = [String(event.year)]
  if (event.month != null) {
    parts.push(String(event.month).padStart(2, '0'))
  }
  if (event.day != null && event.month != null) {
    parts.push(String(event.day).padStart(2, '0'))
  }
  return parts.join('-')
}

export function eventMatchesQuery(
  event: Pick<TimelineEvent, 'title' | 'body'>,
  query: string,
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) return true
  return (
    event.title.toLowerCase().includes(q) ||
    (event.body ?? '').toLowerCase().includes(q)
  )
}

export type FocusCursor = {
  year: number
  month: number
  day: number
}

export function stepFocus(
  focus: FocusCursor,
  scale: 'month' | 'day',
  direction: -1 | 1,
): FocusCursor {
  if (scale === 'month') {
    const monthIndex = focus.year * 12 + (focus.month - 1) + direction
    const year = Math.floor(monthIndex / 12)
    const month = ((monthIndex % 12) + 12) % 12
    return { year, month: month + 1, day: 1 }
  }

  let day = focus.day + direction
  let month = focus.month
  let year = focus.year
  const daysInMonth = daysInMonthFor(year, month)

  if (day < 1) {
    month -= 1
    if (month < 1) {
      month = 12
      year -= 1
    }
    day = daysInMonthFor(year, month)
  } else if (day > daysInMonth) {
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
    day = 1
  }

  return { year, month, day }
}

function daysInMonthFor(year: number, month: number): number {
  if (year < 100 || year > 9999) {
    return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 30
  }
  return new Date(year, month, 0).getDate()
}

export function isEventInFocus(
  event: Pick<TimelineEvent, 'year' | 'month' | 'day'>,
  scale: 'year' | 'month' | 'day',
  focus: FocusCursor,
): boolean {
  if (scale === 'year') return true
  const placement = placementForScale(event, scale)
  if (scale === 'month') {
    return placement.year === focus.year
  }
  return placement.year === focus.year && placement.month === focus.month
}
