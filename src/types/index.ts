import { z } from 'zod'
import { isValidCalendarDay } from '../lib/chronology'

export const ScaleSchema = z.enum(['year', 'month', 'day'])
export type Scale = z.infer<typeof ScaleSchema>

export const OrientationSchema = z.enum(['vertical', 'horizontal'])
export type Orientation = z.infer<typeof OrientationSchema>

export const TimelineSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(''),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type Timeline = z.infer<typeof TimelineSchema>

const EventFieldsSchema = z.object({
  id: z.string().min(1),
  timelineId: z.string().min(1),
  title: z.string().min(1),
  body: z.string().optional().default(''),
  year: z.number().int(),
  month: z.number().int().min(1).max(12).optional(),
  day: z.number().int().min(1).max(31).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const EventSchema = EventFieldsSchema.superRefine((value, ctx) => {
  if (value.day != null && value.month == null) {
    ctx.addIssue({
      code: 'custom',
      message: 'Day requires a month',
      path: ['day'],
    })
    return
  }
  if (!isValidCalendarDay(value.year, value.month, value.day)) {
    ctx.addIssue({
      code: 'custom',
      message: 'Day is not valid for that month and year',
      path: ['day'],
    })
  }
})
export type TimelineEvent = z.infer<typeof EventFieldsSchema>

const ImportEventSchema = z
  .object({
    id: z.string().optional(),
    title: z.string().min(1),
    body: z.string().optional().default(''),
    year: z.number().int(),
    month: z.number().int().min(1).max(12).optional(),
    day: z.number().int().min(1).max(31).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.day != null && value.month == null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Day requires a month',
        path: ['day'],
      })
      return
    }
    if (!isValidCalendarDay(value.year, value.month, value.day)) {
      ctx.addIssue({
        code: 'custom',
        message: 'Day is not valid for that month and year',
        path: ['day'],
      })
    }
  })

export const ExportPayloadSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  timeline: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional().default(''),
  }),
  events: z.array(ImportEventSchema),
})
export type ExportPayload = z.infer<typeof ExportPayloadSchema>
