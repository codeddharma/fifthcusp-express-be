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
