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

const MONTH_ABBREVS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

export function monthAbbrev(month: number): string {
  return MONTH_ABBREVS[month - 1] ?? String(month)
}

export function formatEventDate(
  event: Pick<TimelineEvent, 'year' | 'month' | 'day'>,
): string {
  const parts = [String(event.year)]
  if (event.month != null) {
    parts.push(monthAbbrev(event.month))
  }
  if (event.month != null && event.day != null) {
    parts.push(String(event.day))
  }
  return parts.join(' ')
}

/** Month/day label when the year is already shown by a group header. */
export function formatEventDateWithinYear(
  event: Pick<TimelineEvent, 'month' | 'day'>,
): string {
  if (event.month == null) return ''
  if (event.day != null) {
    return `${monthAbbrev(event.month)} ${event.day}`
  }
  return monthAbbrev(event.month)
}

/** Within a year: unknown-month events first, then chronological month/day. */
export function compareEventsWithinYearDisplay(
  a: Pick<TimelineEvent, 'year' | 'month' | 'day'>,
  b: Pick<TimelineEvent, 'year' | 'month' | 'day'>,
): number {
  const aUnknown = a.month == null
  const bUnknown = b.month == null
  if (aUnknown !== bUnknown) return aUnknown ? -1 : 1
  return compareEventsChronologically(a, b)
}

/** Group already-sorted events by year; unknown-month events rise to the top of each year. */
export function groupEventsByYear<T extends Pick<TimelineEvent, 'year' | 'month' | 'day'>>(
  events: T[],
): Array<{ year: number; events: T[] }> {
  const groups: Array<{ year: number; events: T[] }> = []
  for (const event of events) {
    const last = groups[groups.length - 1]
    if (last && last.year === event.year) {
      last.events.push(event)
    } else {
      groups.push({ year: event.year, events: [event] })
    }
  }
  for (const group of groups) {
    group.events.sort(compareEventsWithinYearDisplay)
  }
  return groups
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
  const daysInMonthCount = daysInMonth(year, month)

  if (day < 1) {
    month -= 1
    if (month < 1) {
      month = 12
      year -= 1
    }
    day = daysInMonth(year, month)
  } else if (day > daysInMonthCount) {
    month += 1
    if (month > 12) {
      month = 1
      year += 1
    }
    day = 1
  }

  return { year, month, day }
}

/** Proleptic Gregorian leap year (works for extreme / negative years). */
export function isGregorianLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

export function daysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) return 0
  if (month === 2) return isGregorianLeapYear(year) ? 29 : 28
  return [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 0
}

export function isValidCalendarDay(
  year: number,
  month: number | undefined,
  day: number | undefined,
): boolean {
  if (day == null) return true
  if (month == null) return false
  if (!Number.isInteger(day) || day < 1) return false
  return day <= daysInMonth(year, month)
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
