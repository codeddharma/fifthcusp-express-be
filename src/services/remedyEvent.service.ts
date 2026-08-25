import { v4 as uuidv4 } from 'uuid'
import { calendar } from '../config/googleCalendar'
import env from '../config/env'
import { RemedyEvent, IRemedyEvent } from '../models/RemedyEvent'
import { Customer } from '../models/Customer'
import { ApiError } from '../utils/ApiError'
import { Types } from 'mongoose'
import { logCustomerActivity } from './customer.service'

interface CreateRemedyInput {
  customerId: string
  orderId?: string
  remedyName: string
  notes?: string
  scheduledAt: Date
  createdBy: string
}

interface UpdateRemedyInput {
  customerId?: string
  orderId?: string
  remedyName?: string
  notes?: string
  scheduledAt?: Date
  // When the reminder already went out, re-arm it so the client is told about the new time.
  resendReminder?: boolean
}

interface ListFilters {
  from?: Date
  to?: Date
  customerId?: string
  page?: number
  limit?: number
  // Set when the requester is an employee — restricts results to remedies they logged.
  createdBy?: Types.ObjectId
}

export async function createRemedyEvent(input: CreateRemedyInput): Promise<IRemedyEvent> {
  const customer = await Customer.findById(input.customerId)
  if (!customer) throw new ApiError(404, 'Customer not found')

  const endTime = new Date(input.scheduledAt.getTime() + 30 * 60 * 1000) // 30-min event

  const calendarResponse = await calendar.events.insert({
    calendarId: env.GOOGLE_REMEDY_CALENDAR_ID,
    sendUpdates: 'none',
    requestBody: {
      summary: `[Remedy] ${input.remedyName} — ${customer.name}`,
      description: input.notes,
      start: { dateTime: input.scheduledAt.toISOString(), timeZone: 'Asia/Kolkata' },
      end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Kolkata' },
    },
  })

  const googleEventId = calendarResponse.data.id!

  const remedy = await RemedyEvent.create({
    customerId: input.customerId,
    orderId: input.orderId ? new Types.ObjectId(input.orderId) : undefined,
    remedyName: input.remedyName,
    notes: input.notes,
    scheduledAt: input.scheduledAt,
    googleEventId,
    createdBy: input.createdBy,
  })

  await logCustomerActivity(input.customerId, {
    type: 'remedy_scheduled',
    message: `Remedy scheduled: ${input.remedyName}`,
    refModel: 'RemedyEvent',
    refId: remedy._id as Types.ObjectId,
    meta: { scheduledAt: input.scheduledAt.toISOString(), notes: input.notes },
  })

  return remedy
}

/**
 * Edit / reschedule an existing remedy. Every field is changeable, including the client —
 * the Google Calendar event is patched in place (never recreated) so the entry the team already
 * sees on the shared calendar simply moves. Mirrors rescheduleConsultationEvent: Google first,
 * DB second, so a Google failure aborts before our records desync.
 */
export async function updateRemedyEvent(
  id: string,
  input: UpdateRemedyInput,
  actor: { _id: Types.ObjectId; role: string },
): Promise<IRemedyEvent> {
  const event = await RemedyEvent.findById(id)
  if (!event) throw new ApiError(404, 'Remedy event not found')

  // Employees only see remedies they logged (see adminListRemedyEvents) — hold the same line here.
  if (actor.role === 'employee' && event.createdBy.toString() !== actor._id.toString()) {
    throw new ApiError(403, 'You can only edit remedies you created')
  }

  const previousCustomerId = event.customerId.toString()
  const nextCustomerId = input.customerId ?? previousCustomerId
  const customer = await Customer.findById(nextCustomerId)
  if (!customer) throw new ApiError(404, 'Customer not found')

  const remedyName = input.remedyName ?? event.remedyName
  const notes = input.notes !== undefined ? input.notes : event.notes
  const previousScheduledAt = event.scheduledAt
  const scheduledAt = input.scheduledAt ?? event.scheduledAt
  const endTime = new Date(scheduledAt.getTime() + 30 * 60 * 1000) // 30-min event, same as create

  // Patch the calendar first — if this fails, we abort before touching the DB. The summary embeds
  // the client name, so a client or remedy-name change has to re-send it too.
  try {
    await calendar.events.patch({
      calendarId: env.GOOGLE_REMEDY_CALENDAR_ID,
      eventId: event.googleEventId,
      sendUpdates: 'none',
      requestBody: {
        summary: `[Remedy] ${remedyName} — ${customer.name}`,
        description: notes,
        start: { dateTime: scheduledAt.toISOString(), timeZone: 'Asia/Kolkata' },
        end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Kolkata' },
      },
    })
  } catch (err: any) {
    // 404 from Google means the event is gone — surface a clear error rather than silently
    // desyncing the calendar from our records.
    if (err?.code === 404) throw new ApiError(410, 'The calendar event no longer exists')
    throw err
  }

  event.customerId = new Types.ObjectId(nextCustomerId)
  // An omitted orderId leaves the link alone; an explicit empty string clears it.
  if (input.orderId !== undefined) {
    event.set('orderId', input.orderId ? new Types.ObjectId(input.orderId) : undefined)
  }
  event.remedyName = remedyName
  event.notes = notes
  event.scheduledAt = scheduledAt
  await event.save()

  // The cron finds due reminders with `reminderSentAt: { $exists: false }`, so assigning undefined
  // is not enough — the field has to actually go away for the reminder to fire again.
  const resent = Boolean(input.resendReminder && event.reminderSentAt && scheduledAt > new Date())
  if (resent) {
    await RemedyEvent.updateOne({ _id: event._id }, { $unset: { reminderSentAt: 1 } })
    event.reminderSentAt = undefined
  }

  const meta = {
    from: previousScheduledAt.toISOString(),
    to: scheduledAt.toISOString(),
    resent,
  }
  await logCustomerActivity(nextCustomerId, {
    type: 'remedy_updated',
    message: `Remedy updated: ${remedyName}`,
    refModel: 'RemedyEvent',
    refId: event._id as Types.ObjectId,
    meta,
  })
  // Reassigned to a different client — leave a trail on the old one too, or their timeline
  // would still claim the remedy is theirs.
  if (nextCustomerId !== previousCustomerId) {
    await logCustomerActivity(previousCustomerId, {
      type: 'remedy_updated',
      message: `Remedy reassigned to another client: ${remedyName}`,
      refModel: 'RemedyEvent',
      refId: event._id as Types.ObjectId,
      meta,
    })
  }

  return event
}

export async function listRemedyEvents(
  filters: ListFilters,
): Promise<{ items: IRemedyEvent[]; total: number }> {
  const { from, to, customerId, page = 1, limit = 20, createdBy } = filters
  const query: Record<string, unknown> = {}

  if (from || to) {
    query.scheduledAt = {}
    if (from) (query.scheduledAt as any).$gte = from
    if (to) (query.scheduledAt as any).$lte = to
  }
  if (customerId) query.customerId = customerId
  if (createdBy) query.createdBy = createdBy

  const [items, total] = await Promise.all([
    RemedyEvent.find(query)
      .populate('customerId', 'name email')
      .populate('orderId', 'orderNumber')
      .sort({ scheduledAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    RemedyEvent.countDocuments(query),
  ])

  return { items, total }
}

export async function deleteRemedyEvent(id: string): Promise<void> {
  const event = await RemedyEvent.findById(id)
  if (!event) throw new ApiError(404, 'Remedy event not found')

  try {
    await calendar.events.delete({
      calendarId: env.GOOGLE_REMEDY_CALENDAR_ID,
      eventId: event.googleEventId,
    })
  } catch (err: any) {
    if (err?.code !== 404) throw err
  }

  await event.deleteOne()
}
