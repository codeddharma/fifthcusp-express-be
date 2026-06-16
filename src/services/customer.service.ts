import { Types } from 'mongoose'
import { Customer, ICustomer, ICustomerActivityEntry } from '../models/Customer'
import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

/**
 * Append an entry to a customer's activity log (atomic $push, non-throwing).
 * Used by order, consultation booking, and remedy flows to build a unified
 * customer audit trail.
 */
export async function logCustomerActivity(
  customerId: Types.ObjectId | string,
  entry: Omit<ICustomerActivityEntry, 'at'>,
): Promise<void> {
  try {
    await Customer.updateOne(
      { _id: customerId },
      { $push: { activityLog: { at: new Date(), ...entry } } },
    )
  } catch (err) {
    console.error('[customer] logCustomerActivity failed:', err instanceof Error ? err.message : err)
  }
}

export interface UpsertCustomerInput {
  email: string
  name: string
  phone: string
}

export async function upsertCustomer(input: UpsertCustomerInput): Promise<ICustomer> {
  const email = input.email.trim().toLowerCase()
  const existing = await Customer.findOne({ email })
  if (existing) {
    existing.name = input.name.trim()
    existing.phone = input.phone.trim()
    return existing.save()
  }
  const created = new Customer({ email, name: input.name.trim(), phone: input.phone.trim() })
  return created.save()
}

export interface CreateCustomerInput {
  email: string
  name: string
  phone: string
  notes?: string
  birthDate?: string
  anniversaryDate?: string
}

export async function createCustomer(input: CreateCustomerInput): Promise<ICustomer> {
  const email = input.email.trim().toLowerCase()
  const exists = await Customer.findOne({ email })
  if (exists) throw new ApiError(HttpStatus.CONFLICT, 'A customer with this email already exists.')
  const customer = new Customer({
    email,
    name: input.name.trim(),
    phone: input.phone.trim(),
    notes: input.notes?.trim(),
    birthDate: input.birthDate ? new Date(input.birthDate) : undefined,
    anniversaryDate: input.anniversaryDate ? new Date(input.anniversaryDate) : undefined,
  })
  return customer.save()
}

export interface ListCustomersOptions {
  search?: string
  page?: number
  limit?: number
}

export async function listCustomers(opts: ListCustomersOptions): Promise<{ data: ICustomer[]; total: number; page: number; limit: number; totalPages: number }> {
  const page = Math.max(1, opts.page ?? 1)
  const limit = Math.min(100, Math.max(1, opts.limit ?? 20))
  const filter: Record<string, unknown> = {}
  if (opts.search) {
    const rx = new RegExp(opts.search.trim(), 'i')
    filter.$or = [{ email: rx }, { name: rx }, { phone: rx }, { customerId: rx }]
  }
  const [data, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Customer.countDocuments(filter),
  ])
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getCustomerById(id: string): Promise<ICustomer> {
  const c = await Customer.findById(id).populate('orders', 'orderNumber paymentStatus orderStatus createdAt')
  if (!c) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return c
}

export async function updateCustomer(
  id: string,
  data: Partial<Pick<ICustomer, 'name' | 'phone' | 'notes' | 'birthDate' | 'anniversaryDate'>>,
): Promise<ICustomer> {
  const c = await Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  if (!c) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return c
}
