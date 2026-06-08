import { calendar } from '../config/googleCalendar'
import env from '../config/env'
import { ConsultationEvent, IConsultationEvent } from '../models/ConsultationEvent'
import { ApiError } from '../utils/ApiError'

interface ListFilters {
  from?: Date
  to?: Date
  customerId?: string
  page?: number
  limit?: number
}

export async function listConsultationEvents(
  filters: ListFilters,
): Promise<{ items: IConsultationEvent[]; total: number }> {
  const { from, to, customerId, page = 1, limit = 20 } = filters
  const query: Record<string, unknown> = {}

  if (from || to) {
    query.startTime = {}
    if (from) (query.startTime as any).$gte = from
    if (to) (query.startTime as any).$lte = to
  }
  if (customerId) query.customerId = customerId

  const [items, total] = await Promise.all([
    ConsultationEvent.find(query)
      .populate('customerId', 'name email')
      .populate('orderId', 'orderNumber')
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    ConsultationEvent.countDocuments(query),
  ])

  return { items, total }
}

export async function deleteConsultationEvent(id: string): Promise<void> {
  const event = await ConsultationEvent.findById(id)
  if (!event) throw new ApiError(404, 'Consultation event not found')

  try {
    await calendar.events.delete({
      calendarId: env.GOOGLE_CONSULTATION_CALENDAR_ID,
      eventId: event.googleEventId,
      sendUpdates: 'all',
    })
  } catch (err: any) {
    // 404 from Google means it was already deleted — safe to continue
    if (err?.code !== 404) throw err
  }

  await event.deleteOne()
}
