import { Types } from 'mongoose'
import { calendar } from '../config/googleCalendar'
import env from '../config/env'
import { ConsultationEvent, IConsultationEvent } from '../models/ConsultationEvent'
import { Order } from '../models/Order'
import { Customer } from '../models/Customer'
import { ApiError } from '../utils/ApiError'
import { sendMail } from '../utils/mailer'
import { consultationRescheduledHtml } from '../emails/consultationRescheduled'
import { logOrderActivity } from './order.service'
import { logCustomerActivity } from './customer.service'

interface ListFilters {
  from?: Date
  to?: Date
  customerId?: string
  page?: number
  limit?: number
  // Set when the requester is an employee — restricts results to their assigned orders.
  assignedTo?: Types.ObjectId
}

export async function listConsultationEvents(
  filters: ListFilters,
): Promise<{ items: IConsultationEvent[]; total: number }> {
  const { from, to, customerId, page = 1, limit = 20, assignedTo } = filters
  const query: Record<string, unknown> = {}

  if (from || to) {
    query.startTime = {}
    if (from) (query.startTime as any).$gte = from
    if (to) (query.startTime as any).$lte = to
  }
  if (customerId) query.customerId = customerId
  if (assignedTo) {
    const orderIds = await Order.find({ assignedTo }).distinct('_id')
    query.orderId = { $in: orderIds }
  }

  const [items, total] = await Promise.all([
    ConsultationEvent.find(query)
      .populate('customerId', 'name email phone')
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

/**
 * Admin-only reschedule of a booked consultation to a new start time (duration unchanged).
 * Moves the existing Google Calendar event (patch — keeps the same Meet link + notifies the
 * attendee), syncs the ConsultationEvent + the order's embedded consultation, emails the client,
 * and records the change on both the order timeline and the customer activity log (audit trail).
 */
export async function rescheduleConsultationEvent(
  id: string,
  newStartIso: string,
  actorUserId: Types.ObjectId,
): Promise<IConsultationEvent> {
  const event = await ConsultationEvent.findById(id)
  if (!event) throw new ApiError(404, 'Consultation event not found')

  const oldStart = event.startTime
  const newStart = new Date(newStartIso)
  const newEnd = new Date(newStart.getTime() + event.durationMinutes * 60_000)

  if (newStart.getTime() <= Date.now()) {
    throw new ApiError(400, 'New consultation time must be in the future')
  }

  // Reject overlaps with any OTHER consultation event (same test as slot generation).
  const conflict = await ConsultationEvent.findOne({
    _id: { $ne: event._id },
    startTime: { $lt: newEnd },
    endTime: { $gt: newStart },
  })
  if (conflict) throw new ApiError(409, 'That time slot overlaps another consultation')

  // Move the Google Calendar event first — if this fails, we abort before touching the DB.
  try {
    await calendar.events.patch({
      calendarId: env.GOOGLE_CONSULTATION_CALENDAR_ID,
      eventId: event.googleEventId,
      sendUpdates: 'all',
      requestBody: {
        start: { dateTime: newStart.toISOString(), timeZone: 'Asia/Kolkata' },
        end: { dateTime: newEnd.toISOString(), timeZone: 'Asia/Kolkata' },
      },
    })
  } catch (err: any) {
    // 404 from Google means the event is gone — surface a clear error rather than silently
    // desyncing the calendar from our records.
    if (err?.code === 404) throw new ApiError(410, 'The calendar event no longer exists')
    throw err
  }

  event.startTime = newStart
  event.endTime = newEnd
  await event.save()

  // Sync the order's embedded consultation + audit trail (mirrors bookSlot).
  const order = await Order.findById(event.orderId)
  if (order) {
    const serviceName = order.serviceSnapshot?.title ?? 'consultation'
    if (order.consultation) {
      order.consultation.scheduledAt = newStart
      order.consultation.endTime = newEnd
    }
    logOrderActivity(order, {
      type: 'consultation_rescheduled',
      actor: actorUserId,
      message: `Consultation rescheduled: ${oldStart.toISOString()} → ${newStart.toISOString()}`,
      meta: {
        from: oldStart.toISOString(),
        to: newStart.toISOString(),
        endTime: newEnd.toISOString(),
      },
    })
    await order.save()

    await logCustomerActivity(order.customerId, {
      type: 'consultation_rescheduled',
      message: `Consultation rescheduled for ${serviceName} (${order.orderNumber})`,
      refModel: 'Order',
      refId: order._id as Types.ObjectId,
      meta: { from: oldStart.toISOString(), to: newStart.toISOString() },
    })

    // Notify the client with the new details (non-fatal).
    try {
      const customer = await Customer.findById(event.customerId)
      if (customer) {
        await sendMail({
          to: customer.email,
          from: env.CONSULTATION_SMTP_FROM,
          subject: `Your ${serviceName} consultation has been rescheduled`,
          html: consultationRescheduledHtml({
            customerName: customer.name,
            orderNumber: order.orderNumber,
            serviceName,
            startTime: newStart,
            endTime: newEnd,
            meetLink: event.meetLink,
          }),
        })
        event.emailSentAt = new Date()
        await event.save()
      }
    } catch (err) {
      console.error('[consultationEvent] Failed to send reschedule email:', err)
    }
  }

  return event
}
