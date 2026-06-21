import { Types } from 'mongoose'
import { RecurringOrder, IRecurringOrder, IntervalUnit, RecurringOrderStatus } from '../models/RecurringOrder'
import { Customer } from '../models/Customer'
import { Service } from '../models/Service'
import { createPaymentLink, sendPaymentLinkEmail } from './paymentLink.service'
import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

export interface CreateRecurringOrderInput {
  customerId: string
  serviceId?: string
  customServiceDescription?: string
  amount: number
  description: string
  intervalUnit: IntervalUnit
  intervalCount: number
  linkValidityDays?: number
  notes?: string
  sendFirstNow?: boolean
  createdBy?: Types.ObjectId
}

export function addInterval(from: Date, unit: IntervalUnit, count: number): Date {
  const d = new Date(from)
  if (unit === 'day') d.setDate(d.getDate() + count)
  else if (unit === 'week') d.setDate(d.getDate() + count * 7)
  else if (unit === 'month') d.setMonth(d.getMonth() + count)
  return d
}

/**
 * Generates the next payment link for a recurring order, emails it to the
 * customer, records it, and advances the schedule. Shared by the create flow
 * (immediate first send) and the cron job (each cycle).
 */
export async function runRecurringOrderCycle(recurring: IRecurringOrder): Promise<void> {
  const now = new Date()
  const validUntil = addInterval(now, 'day', recurring.linkValidityDays)

  const link = await createPaymentLink({
    customerId: recurring.customerId.toString(),
    serviceId: recurring.serviceId?.toString(),
    customServiceDescription: recurring.customServiceDescription,
    amount: recurring.amount,
    description: recurring.description,
    validUntil: validUntil.toISOString(),
    notes: recurring.notes,
  })

  await sendPaymentLinkEmail(link)

  recurring.generatedLinks.push(link._id as Types.ObjectId)
  recurring.lastRunAt = now
  recurring.nextRunAt = addInterval(now, recurring.intervalUnit, recurring.intervalCount)
  await recurring.save()
}

export async function createRecurringOrder(input: CreateRecurringOrderInput): Promise<IRecurringOrder> {
  const customer = await Customer.findById(input.customerId)
  if (!customer) throw new ApiError(HttpStatus.NOT_FOUND, 'Customer not found.')

  if (!input.serviceId && !input.customServiceDescription) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Either a service or a custom description is required.')
  }

  let serviceRef: Types.ObjectId | undefined
  if (input.serviceId) {
    const svc = await Service.findById(input.serviceId)
    if (!svc) throw new ApiError(HttpStatus.NOT_FOUND, 'Service not found.')
    serviceRef = svc._id as Types.ObjectId
  }

  const linkValidityDays = input.linkValidityDays ?? 7
  const now = new Date()

  const recurring = await RecurringOrder.create({
    customerId: new Types.ObjectId(input.customerId),
    serviceId: serviceRef,
    customServiceDescription: input.customServiceDescription,
    amount: input.amount,
    description: input.description,
    intervalUnit: input.intervalUnit,
    intervalCount: input.intervalCount,
    linkValidityDays,
    status: 'active',
    // If not sending immediately, the first link goes out at the first cycle.
    nextRunAt: input.sendFirstNow ? now : addInterval(now, input.intervalUnit, input.intervalCount),
    notes: input.notes,
    prefillName: customer.name,
    prefillEmail: customer.email,
    prefillPhone: customer.phone,
    createdBy: input.createdBy,
  })

  if (input.sendFirstNow) {
    await runRecurringOrderCycle(recurring)
  }

  return recurring
}

export async function listRecurringOrders(opts: { page?: number; limit?: number }): Promise<{
  data: IRecurringOrder[]
  total: number
  page: number
  limit: number
  totalPages: number
}> {
  const page = Math.max(1, opts.page ?? 1)
  const limit = Math.min(100, Math.max(1, opts.limit ?? 20))
  const [data, total] = await Promise.all([
    RecurringOrder.find()
      .populate('customerId', 'name email customerId')
      .populate('serviceId', 'title sku')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    RecurringOrder.countDocuments(),
  ])
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getRecurringOrderById(id: string): Promise<IRecurringOrder> {
  const recurring = await RecurringOrder.findById(id)
    .populate('customerId', 'name email customerId phone')
    .populate('serviceId', 'title sku')
    .populate('generatedLinks', 'token status amount validUntil paidAt')
  if (!recurring) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return recurring
}

export async function updateRecurringOrderStatus(
  id: string,
  status: RecurringOrderStatus,
): Promise<IRecurringOrder> {
  const recurring = await RecurringOrder.findById(id)
  if (!recurring) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  if (recurring.status === 'cancelled') {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Cannot change a cancelled recurring order.')
  }
  recurring.status = status
  return recurring.save()
}
