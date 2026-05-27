import { Customer, ICustomer } from '../models/Customer'
import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

export interface UpsertCustomerInput {
  email: string
  name: string
  phone: string
}

export async function upsertCustomer(input: UpsertCustomerInput): Promise<ICustomer> {
  const email = input.email.trim().toLowerCase()
  const updated = await Customer.findOneAndUpdate(
    { email },
    { $set: { name: input.name.trim(), phone: input.phone.trim() }, $setOnInsert: { email } },
    { new: true, upsert: true, setDefaultsOnInsert: true },
  )
  return updated as ICustomer
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
    filter.$or = [{ email: rx }, { name: rx }, { phone: rx }]
  }
  const [data, total] = await Promise.all([
    Customer.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Customer.countDocuments(filter),
  ])
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getCustomerById(id: string): Promise<ICustomer> {
  const c = await Customer.findById(id).populate('orders')
  if (!c) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return c
}

export async function updateCustomer(id: string, data: Partial<Pick<ICustomer, 'name' | 'phone' | 'notes'>>): Promise<ICustomer> {
  const c = await Customer.findByIdAndUpdate(id, data, { new: true, runValidators: true })
  if (!c) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return c
}
