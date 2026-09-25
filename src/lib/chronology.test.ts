import { describe, expect, it } from 'vitest'
import {
  compareEventsChronologically,
  formatEventDate,
  isEventInFocus,
  placementForScale,
  sortEventsChronologically,
  stepFocus,
  eventMatchesQuery,
} from './chronology'

describe('compareEventsChronologically (R2)', () => {
  it('sorts by year then month then day', () => {
    const events = [
      { year: 1815, month: 6, day: 18 },
      { year: 1804 },
      { year: 1815, month: 3 },
      { year: 1815 },
      { year: 1815, month: 6, day: 1 },
    ]
    const sorted = sortEventsChronologically(events)
    expect(sorted.map((e) => formatEventDate(e))).toEqual([
      '1804',
      '1815-03',
      '1815-06-01',
      '1815-06-18',
      '1815',
    ])
  })

  it('places missing month after dated months in same year', () => {
    expect(
      compareEventsChronologically({ year: 1848, month: 3 }, { year: 1848 }),
    ).toBeLessThan(0)
  })
})

describe('placementForScale (R1)', () => {
  it('marks year-only events and defaults month/day to 1', () => {
    const placement = placementForScale({ year: -44 }, 'day')
    expect(placement).toEqual({
      year: -44,
      month: 1,
      day: 1,
      yearOnly: true,
    })
  })

  it('keeps specific dates', () => {
    const placement = placementForScale(
      { year: 1815, month: 6, day: 18 },
      'month',
    )
    expect(placement.yearOnly).toBe(false)
    expect(placement.month).toBe(6)
    expect(placement.day).toBe(18)
  })
})

describe('stepFocus (R4)', () => {
  it('steps months across year boundaries', () => {
    expect(stepFocus({ year: 1848, month: 12, day: 1 }, 'month', 1)).toEqual({
      year: 1849,
      month: 1,
      day: 1,
    })
    expect(stepFocus({ year: 1848, month: 1, day: 1 }, 'month', -1)).toEqual({
      year: 1847,
      month: 12,
      day: 1,
    })
  })

  it('steps days across month boundaries', () => {
    expect(stepFocus({ year: 2024, month: 1, day: 31 }, 'day', 1)).toEqual({
      year: 2024,
      month: 2,
      day: 1,
    })
  })
})

describe('isEventInFocus', () => {
  it('filters by year at month scale', () => {
    expect(
      isEventInFocus({ year: 1848, month: 3 }, 'month', {
        year: 1848,
        month: 1,
        day: 1,
      }),
    ).toBe(true)
    expect(
      isEventInFocus({ year: 1849 }, 'month', {
        year: 1848,
        month: 1,
        day: 1,
      }),
    ).toBe(false)
  })
})

describe('eventMatchesQuery', () => {
  it('matches title and body', () => {
    expect(
      eventMatchesQuery({ title: 'Waterloo', body: 'Napoleon defeated' }, 'napoleon'),
    ).toBe(true)
    expect(
      eventMatchesQuery({ title: 'Harvest', body: 'quiet year' }, 'napoleon'),
    ).toBe(false)
  })
})
