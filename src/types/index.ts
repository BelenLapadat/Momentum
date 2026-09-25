import { z } from 'zod'

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

export const EventSchema = z.object({
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
export type TimelineEvent = z.infer<typeof EventSchema>

export const ExportPayloadSchema = z.object({
  version: z.literal(1),
  exportedAt: z.string(),
  timeline: z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional().default(''),
  }),
  events: z.array(
    z.object({
      id: z.string().optional(),
      title: z.string().min(1),
      body: z.string().optional().default(''),
      year: z.number().int(),
      month: z.number().int().min(1).max(12).optional(),
      day: z.number().int().min(1).max(31).optional(),
    }),
  ),
})
export type ExportPayload = z.infer<typeof ExportPayloadSchema>
