import mongoose from 'mongoose'
import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'
import { CalendarEvent, ICalendarEvent, CalendarEventType } from '../models/CalendarEvent'

// ─── Utilities ──────────────────────────────────────────────────────────────

function toYmd(d: Date): string {
  return new Date(d).toISOString().slice(0, 10)
}

// ─── Public ───────────────────────────────────────────────────────────────────

export interface PublicCalendarEntry {
  date: string
  label: string
  eventType: CalendarEventType
  description?: string
}

export async function getPublicCalendar(): Promise<PublicCalendarEntry[]> {
  const events = await CalendarEvent.find({ isActive: true }).sort({ date: 1 })
  return events.map((e) => ({
    date: toYmd(e.date),
    label: e.title,
    eventType: e.eventType,
    description: e.description,
  }))
}

// ─── Admin CRUD ─────────────────────────────────────────────────────────────

type CalendarEventFilter = {
  eventType?: CalendarEventType
  isActive?: boolean
  from?: Date
  to?: Date
}

export async function getAllCalendarEvents(filter: CalendarEventFilter = {}) {
  const query: Record<string, unknown> = {}
  if (filter.eventType) query.eventType = filter.eventType
  if (filter.isActive !== undefined) query.isActive = filter.isActive
  if (filter.from || filter.to) {
    const range: Record<string, Date> = {}
    if (filter.from) range.$gte = filter.from
    if (filter.to) range.$lte = filter.to
    query.date = range
  }
  return CalendarEvent.find(query).sort({ date: 1 })
}

export async function getCalendarEventById(id: string) {
  const event = await CalendarEvent.findById(id)
  if (!event) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return event
}

type CreateCalendarEventInput = {
  title: string
  eventType: CalendarEventType
  date: Date
  description?: string
  isActive?: boolean
}

export async function createCalendarEvent(data: CreateCalendarEventInput, userId?: string) {
  return CalendarEvent.create({
    ...data,
    ...(userId ? { createdBy: new mongoose.Types.ObjectId(userId) } : {}),
  })
}

export async function updateCalendarEvent(id: string, data: Partial<CreateCalendarEventInput>) {
  const event = await CalendarEvent.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  if (!event) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return event
}

export async function deleteCalendarEvent(id: string) {
  const event = await CalendarEvent.findByIdAndDelete(id)
  if (!event) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

type SeedEvent = Pick<ICalendarEvent, 'title' | 'eventType' | 'date'> & { description?: string }

const SEED_EVENTS: SeedEvent[] = [
  {
    title: 'Surya Grahan (Annular Solar Eclipse)',
    eventType: 'solar-eclipse',
    date: new Date('2026-02-17'),
    description:
      '<p>An annular solar eclipse where the Moon covers the Sun’s centre, leaving a bright ring. A <strong>potent window for release and re-setting intentions</strong>:</p><ul><li><em>Fast</em> or eat light through the day</li><li>Chant your <em>ishta devata</em> mantra</li><li>Turn inward rather than starting new ventures</li></ul>',
  },
  {
    title: 'Chandra Grahan (Total Lunar Eclipse)',
    eventType: 'lunar-eclipse',
    date: new Date('2026-03-03'),
    description:
      '<p>A total lunar eclipse turning the full Moon a deep coppery red. <strong>Emotionally charged and revealing</strong> — ideal for:</p><ul><li>Honest <u>self-reflection</u></li><li>Letting go of what no longer serves you</li><li>Protective practices and grounding rituals</li></ul>',
  },
  {
    title: 'Surya Grahan (Total Solar Eclipse)',
    eventType: 'solar-eclipse',
    date: new Date('2026-08-12'),
    description:
      '<p>A total solar eclipse — one of the <strong>most powerful manifestation thresholds</strong> of the year. A reset point for long-term goals:</p><ul><li>Sit in <em>stillness</em></li><li>Chant with full presence</li><li>Plant the seed of a single, clear intention</li></ul>',
  },
  {
    title: 'Chandra Grahan (Partial Lunar Eclipse)',
    eventType: 'lunar-eclipse',
    date: new Date('2026-08-28'),
    description:
      '<p>A partial lunar eclipse that gently surfaces what needs adjusting. A <u>softer release point</u>:</p><ul><li>Review the intentions set earlier in the year</li><li>Course-correct with <em>compassion</em>, not judgement</li></ul>',
  },
  {
    title: 'Guru Purnima',
    eventType: 'full-moon',
    date: new Date('2026-07-29'),
    description:
      '<p>The full Moon dedicated to <strong>gratitude for teachers and guides</strong>. A high-energy day for:</p><ul><li>Expressing thanks</li><li>Deepening your practice</li><li>Aligning with <em>abundance</em></li></ul>',
  },
  {
    title: 'Sharad Purnima',
    eventType: 'full-moon',
    date: new Date('2026-10-25'),
    description:
      '<p>The harvest full Moon, said to shower <strong>nectar-like (amrit) energy</strong>. Traditionally a night for:</p><ul><li><em>Moonlight meditation</em></li><li>Manifesting prosperity</li><li>Charging water or intentions under the Moon</li></ul>',
  },
]

export async function seedCalendarEvents(): Promise<void> {
  for (const event of SEED_EVENTS) {
    await CalendarEvent.findOneAndUpdate(
      { title: event.title, date: event.date },
      { $setOnInsert: event },
      { upsert: true },
    )
  }
  console.log(`Seeded ${SEED_EVENTS.length} calendar events`)
}
