import { v4 as uuidv4 } from 'uuid'
import { calendar } from '../config/googleCalendar'
import env from '../config/env'
import { ConsultationBookingToken } from '../models/ConsultationBookingToken'
import { ConsultationEvent } from '../models/ConsultationEvent'
import { AvailabilityWindow } from '../models/AvailabilityWindow'
import { Customer } from '../models/Customer'
import { Order } from '../models/Order'
import { ApiError } from '../utils/ApiError'
import { sendMail } from '../utils/mailer'
import { consultationMeetLinkHtml } from '../emails/consultationMeetLink'
import { logOrderActivity } from './order.service'
import { logCustomerActivity } from './customer.service'

export interface AvailableSlot {
  startTime: string // ISO
  endTime: string   // ISO
  durationMinutes: number
}

/** Find token — throws 404 only if it doesn't exist at all */
async function findToken(token: string) {
  const bookingToken = await ConsultationBookingToken.findOne({ token })
  if (!bookingToken) throw new ApiError(404, 'Booking link not found')
  return bookingToken
}

/** Find token AND assert it is still pending — used for slot queries and booking */
async function requirePendingToken(token: string) {
  const bookingToken = await findToken(token)
  if (bookingToken.status === 'booked') throw new ApiError(409, 'This slot has already been booked')
  if (bookingToken.status === 'expired' || bookingToken.expiresAt < new Date()) {
    throw new ApiError(410, 'This booking link has expired')
  }
  return bookingToken
}

export async function getBookingInfo(token: string) {
  // Uses findToken (not requirePendingToken) so it returns info even for booked/expired tokens
  // — the frontend uses the returned status to show the correct screen
  const bookingToken = await findToken(token)

  // Mark as expired in DB if past the expiry date
  if (bookingToken.status === 'pending' && bookingToken.expiresAt < new Date()) {
    bookingToken.status = 'expired'
    await bookingToken.save()
  }

  const order = await Order.findById(bookingToken.orderId)
  const customer = await Customer.findById(bookingToken.customerId)
  if (!order || !customer) throw new ApiError(404, 'Order or customer not found')

  return {
    status: bookingToken.status,
    customerName: customer.name,
    orderNumber: order.orderNumber,
    serviceName: (order.serviceSnapshot as any)?.title ?? 'Consultation',
    durationMinutes: (order.serviceSnapshot as any)?.consultationDurationMinutes ?? 60,
  }
}

export async function getAvailableSlots(token: string, daysAhead = 30): Promise<AvailableSlot[]> {
  const bookingToken = await requirePendingToken(token)
  const order = await Order.findById(bookingToken.orderId)
  if (!order) throw new ApiError(404, 'Order not found')

  const durationMinutes: number = (order.serviceSnapshot as any)?.consultationDurationMinutes ?? 60

  const windows = await AvailabilityWindow.find({ isActive: true })
  if (windows.length === 0) return []

  // Build a map: dayOfWeek → [{ startHour, endHour }]
  const windowMap: Record<number, { startHour: number; endHour: number }[]> = {}
  for (const w of windows) {
    if (!windowMap[w.dayOfWeek]) windowMap[w.dayOfWeek] = []
    windowMap[w.dayOfWeek].push({ startHour: w.startHour, endHour: w.endHour })
  }

  const now = new Date()
  const rangeEnd = new Date(now)
  rangeEnd.setDate(rangeEnd.getDate() + daysAhead)

  // Fetch already-booked slots in the range
  const bookedEvents = await ConsultationEvent.find({
    startTime: { $gte: now, $lte: rangeEnd },
  })

  const slots: AvailableSlot[] = []

  for (let d = 0; d < daysAhead; d++) {
    const date = new Date(now)
    date.setDate(now.getDate() + d)
    date.setHours(0, 0, 0, 0)

    const dow = date.getDay()
    const dayWindows = windowMap[dow] ?? []

    for (const { startHour, endHour } of dayWindows) {
      let cursor = new Date(date)
      cursor.setHours(startHour, 0, 0, 0)

      const windowEnd = new Date(date)
      windowEnd.setHours(endHour, 0, 0, 0)

      while (cursor.getTime() + durationMinutes * 60 * 1000 <= windowEnd.getTime()) {
        const slotStart = new Date(cursor)
        const slotEnd = new Date(cursor.getTime() + durationMinutes * 60 * 1000)

        // Skip slots in the past
        if (slotStart <= now) {
          cursor = slotEnd
          continue
        }

        // Check for overlap with any booked event
        const isBooked = bookedEvents.some(
          (e) => slotStart < e.endTime && slotEnd > e.startTime,
        )

        if (!isBooked) {
          slots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            durationMinutes,
          })
        }

        cursor = slotEnd
      }
    }
  }

  return slots
}

export async function bookSlot(token: string, startTimeIso: string) {
  const bookingToken = await requirePendingToken(token)

  const startTime = new Date(startTimeIso)
  const order = await Order.findById(bookingToken.orderId)
  const customer = await Customer.findById(bookingToken.customerId)
  if (!order || !customer) throw new ApiError(404, 'Order or customer not found')

  const durationMinutes: number = (order.serviceSnapshot as any)?.consultationDurationMinutes ?? 60
  const endTime = new Date(startTime.getTime() + durationMinutes * 60 * 1000)
  const serviceName: string = (order.serviceSnapshot as any)?.title ?? 'Consultation'

  // Atomic race condition guard: mark token as booked first
  const claimed = await ConsultationBookingToken.findOneAndUpdate(
    { _id: bookingToken._id, status: 'pending' },
    { $set: { status: 'booked' } },
    { new: true },
  )
  if (!claimed) throw new ApiError(409, 'This booking link has already been used')

  // Re-check the slot is still free
  const conflict = await ConsultationEvent.findOne({
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
  })
  if (conflict) {
    // Roll back token status
    await ConsultationBookingToken.findByIdAndUpdate(bookingToken._id, { status: 'pending' })
    throw new ApiError(409, 'This time slot is no longer available. Please choose another.')
  }

  // Workspace mode (production): auto-generate a unique Google Meet link and invite
  // the customer as an attendee. Requires Domain-Wide Delegation + impersonation.
  //
  // Consumer mode (dev): a service account on a plain Gmail account cannot create
  // Meet conferences or invite attendees, so we create a plain event and fall back
  // to CONSULTATION_FALLBACK_MEET_LINK (a permanent room link) in the email.
  const workspaceMode = env.GOOGLE_WORKSPACE_MODE

  const calendarResponse = await calendar.events.insert({
    calendarId: env.GOOGLE_CONSULTATION_CALENDAR_ID,
    ...(workspaceMode ? { conferenceDataVersion: 1, sendUpdates: 'all' as const } : {}),
    requestBody: {
      summary: `${serviceName} — ${customer.name}`,
      description: `Consultation for order #${order.orderNumber}\nClient: ${customer.name} (${customer.email})`,
      start: { dateTime: startTime.toISOString(), timeZone: 'Asia/Kolkata' },
      end: { dateTime: endTime.toISOString(), timeZone: 'Asia/Kolkata' },
      ...(workspaceMode
        ? {
            attendees: [{ email: customer.email }],
            conferenceData: {
              createRequest: {
                requestId: uuidv4(),
                conferenceSolutionKey: { type: 'hangoutsMeet' },
              },
            },
          }
        : {}),
    },
  })

  const googleEventId = calendarResponse.data.id!
  const generatedMeetLink =
    calendarResponse.data.hangoutLink ?? calendarResponse.data.conferenceData?.entryPoints?.[0]?.uri ?? ''
  const meetLink = generatedMeetLink || env.CONSULTATION_FALLBACK_MEET_LINK

  const consultationEvent = await ConsultationEvent.create({
    orderId: bookingToken.orderId,
    customerId: bookingToken.customerId,
    bookingTokenId: bookingToken._id,
    title: `${serviceName} — ${customer.name}`,
    startTime,
    endTime,
    durationMinutes,
    googleEventId,
    meetLink,
  })

  // Send confirmation email
  try {
    await sendMail({
      to: customer.email,
      from: env.CONSULTATION_SMTP_FROM,
      subject: `Your ${serviceName} consultation is confirmed`,
      html: consultationMeetLinkHtml({
        customerName: customer.name,
        orderNumber: order.orderNumber,
        serviceName,
        startTime,
        endTime,
        meetLink,
      }),
    })
    consultationEvent.emailSentAt = new Date()
    await consultationEvent.save()
  } catch (err) {
    console.error('[consultationBooking] Failed to send confirmation email:', err)
  }

  // Reflect the booking on the order: store the session, advance status to "scheduled", audit.
  order.consultation = { scheduledAt: startTime, endTime, meetLink, googleEventId, bookedAt: new Date() }
  if (order.orderStatus === 'created' && order.paymentStatus === 'paid') {
    const from = order.orderStatus
    order.orderStatus = 'scheduled'
    order.statusHistory.push({ at: new Date(), from, to: 'scheduled', note: 'Consultation booked by customer' })
    logOrderActivity(order, { type: 'status_changed', actor: 'customer', message: `Status changed: ${from} → scheduled`, meta: { from, to: 'scheduled' } })
  }
  logOrderActivity(order, {
    type: 'consultation_scheduled',
    actor: 'customer',
    message: 'Consultation booked',
    meta: { meetLink, startTime: startTime.toISOString(), endTime: endTime.toISOString() },
  })
  logOrderActivity(order, { type: 'email_sent', actor: 'system', message: 'Consultation confirmation sent', meta: { emailType: 'consultation_meet_link', to: customer.email } })
  await order.save()

  await logCustomerActivity(order.customerId, {
    type: 'consultation_scheduled',
    message: `Consultation booked for ${serviceName} (${order.orderNumber})`,
    refModel: 'Order',
    refId: order._id as any,
    meta: { meetLink, startTime: startTime.toISOString() },
  })

  return consultationEvent
}
