import { Request, Response } from 'express'
import { z } from 'zod'
import * as CalendarEventService from '../services/calendarEvent.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

// ─── Validation schemas ───────────────────────────────────────────────────────

const createCalendarEventSchema = z.object({
  title: z.string().min(1),
  eventType: z.enum([
    'grahan',
    'solar-eclipse',
    'lunar-eclipse',
    'full-moon',
    'new-moon',
    'festival',
    'other',
  ]),
  date: z.coerce.date(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
})

const updateCalendarEventSchema = createCalendarEventSchema.partial()

// ─── Public controllers ───────────────────────────────────────────────────────

export const getManifestationCalendar = asyncHandler(async (_req: Request, res: Response) => {
  const entries = await CalendarEventService.getPublicCalendar()
  sendSuccess(res, HttpMessage.OK, entries, HttpStatus.OK)
})

// ─── Admin controllers ────────────────────────────────────────────────────────

export const listCalendarEvents = asyncHandler(async (req: Request, res: Response) => {
  const { eventType, isActive, from, to } = req.query
  const filter: Record<string, unknown> = {}
  if (eventType) filter.eventType = eventType as string
  if (isActive !== undefined) filter.isActive = isActive === 'true'
  if (from) filter.from = new Date(from as string)
  if (to) filter.to = new Date(to as string)
  const events = await CalendarEventService.getAllCalendarEvents(filter)
  sendSuccess(res, HttpMessage.OK, events, HttpStatus.OK)
})

export const getCalendarEvent = asyncHandler(async (req: Request, res: Response) => {
  const event = await CalendarEventService.getCalendarEventById(req.params.id)
  sendSuccess(res, HttpMessage.OK, event, HttpStatus.OK)
})

export const createCalendarEvent = asyncHandler(async (req: Request, res: Response) => {
  const input = createCalendarEventSchema.parse(req.body)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userId = (req as any).user?.id
  const event = await CalendarEventService.createCalendarEvent(input, userId)
  sendSuccess(res, HttpMessage.CREATED, event, HttpStatus.CREATED)
})

export const updateCalendarEvent = asyncHandler(async (req: Request, res: Response) => {
  const input = updateCalendarEventSchema.parse(req.body)
  const event = await CalendarEventService.updateCalendarEvent(req.params.id, input)
  sendSuccess(res, HttpMessage.UPDATED, event, HttpStatus.OK)
})

export const deleteCalendarEvent = asyncHandler(async (req: Request, res: Response) => {
  await CalendarEventService.deleteCalendarEvent(req.params.id)
  sendSuccess(res, HttpMessage.DELETED, null, HttpStatus.OK)
})
