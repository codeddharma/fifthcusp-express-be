import { Types } from 'mongoose'
import { Coupon, ICoupon } from '../models/Coupon'
import { Customer } from '../models/Customer'
import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

export interface ValidateCouponInput {
  code: string
  serviceId: string
  customerId?: string
  amount: number
}

export interface CouponValidationResult {
  coupon: ICoupon
  discountAmount: number
  finalAmount: number
}

function isSameDay(d1: Date, d2: Date): boolean {
  return d1.getDate() === d2.getDate() && d1.getMonth() === d2.getMonth()
}

export function computeDiscount(coupon: ICoupon, amount: number): number {
  if (coupon.discountType === 'percentage') {
    return Math.round((amount * coupon.discountValue) / 100)
  }
  return Math.min(coupon.discountValue, amount)
}

export async function validateCoupon(input: ValidateCouponInput): Promise<CouponValidationResult> {
  const coupon = await Coupon.findOne({ code: input.code.toUpperCase().trim() })
  if (!coupon) throw new ApiError(HttpStatus.NOT_FOUND, 'Coupon code not found.')
  if (!coupon.isActive) throw new ApiError(HttpStatus.BAD_REQUEST, 'This coupon is not active.')

  const now = new Date()

  // Compare at day granularity so "valid from June 6" means the whole calendar day,
  // regardless of the server's UTC offset vs the user's timezone.
  const startOfDay = (d: Date) => {
    const s = new Date(d)
    s.setUTCHours(0, 0, 0, 0)
    return s
  }
  const startOfToday = startOfDay(now)

  if (coupon.validFrom && startOfToday < startOfDay(coupon.validFrom)) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'This coupon is not yet valid.')
  }
  if (coupon.expiresAt && startOfToday > startOfDay(coupon.expiresAt)) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'This coupon has expired.')
  }
  if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'This coupon has reached its usage limit.')
  }
  if (input.amount < coupon.minOrderAmount) {
    throw new ApiError(HttpStatus.BAD_REQUEST, `Minimum order amount for this coupon is ₹${coupon.minOrderAmount}.`)
  }

  // Service restriction
  if (coupon.applicableServiceIds.length > 0) {
    const isApplicable = coupon.applicableServiceIds.some(
      (id) => id.toString() === input.serviceId,
    )
    if (!isApplicable) throw new ApiError(HttpStatus.BAD_REQUEST, 'This coupon is not valid for the selected service.')
  }

  // Customer restriction (including birthday/anniversary)
  if (input.customerId) {
    if (coupon.applicableCustomerIds.length > 0) {
      const isApplicable = coupon.applicableCustomerIds.some(
        (id) => id.toString() === input.customerId,
      )
      if (!isApplicable) throw new ApiError(HttpStatus.BAD_REQUEST, 'This coupon is not valid for your account.')
    }

    if (coupon.isBirthdayOffer || coupon.isAnniversaryOffer) {
      const customer = await Customer.findById(input.customerId)
      if (!customer) throw new ApiError(HttpStatus.NOT_FOUND, 'Customer not found.')

      if (coupon.isBirthdayOffer) {
        if (!customer.birthDate) {
          throw new ApiError(HttpStatus.BAD_REQUEST, 'No birth date on file for birthday discount.')
        }
        if (!isSameDay(new Date(customer.birthDate), now)) {
          throw new ApiError(HttpStatus.BAD_REQUEST, 'This birthday coupon is only valid on your birthday.')
        }
      }

      if (coupon.isAnniversaryOffer) {
        if (!customer.anniversaryDate) {
          throw new ApiError(HttpStatus.BAD_REQUEST, 'No anniversary date on file for anniversary discount.')
        }
        if (!isSameDay(new Date(customer.anniversaryDate), now)) {
          throw new ApiError(HttpStatus.BAD_REQUEST, 'This anniversary coupon is only valid on your anniversary.')
        }
      }
    }
  } else if (coupon.applicableCustomerIds.length > 0 || coupon.isBirthdayOffer || coupon.isAnniversaryOffer) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'This coupon requires a customer account.')
  }

  const discountAmount = computeDiscount(coupon, input.amount)
  const finalAmount = Math.max(0, input.amount - discountAmount)

  return { coupon, discountAmount, finalAmount }
}

export async function applyCoupon(couponId: Types.ObjectId | string): Promise<void> {
  await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } })
}

export interface ListCouponsOptions {
  page?: number
  limit?: number
}

export async function listCoupons(opts: ListCouponsOptions): Promise<{ data: ICoupon[]; total: number; page: number; limit: number; totalPages: number }> {
  const page = Math.max(1, opts.page ?? 1)
  const limit = Math.min(100, Math.max(1, opts.limit ?? 20))
  const [data, total] = await Promise.all([
    Coupon.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Coupon.countDocuments(),
  ])
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getCouponById(id: string): Promise<ICoupon> {
  const c = await Coupon.findById(id)
  if (!c) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return c
}

export interface CreateCouponInput {
  code: string
  description?: string
  discountType: 'percentage' | 'flat'
  discountValue: number
  minOrderAmount?: number
  maxUses?: number
  validFrom?: string
  expiresAt?: string
  isActive?: boolean
  applicableCustomerIds?: string[]
  applicableServiceIds?: string[]
  isBirthdayOffer?: boolean
  isAnniversaryOffer?: boolean
}

export async function createCoupon(input: CreateCouponInput): Promise<ICoupon> {
  const exists = await Coupon.findOne({ code: input.code.toUpperCase().trim() })
  if (exists) throw new ApiError(HttpStatus.CONFLICT, 'A coupon with this code already exists.')
  return Coupon.create({
    ...input,
    code: input.code.toUpperCase().trim(),
    validFrom: input.validFrom ? new Date(input.validFrom) : undefined,
    expiresAt: input.expiresAt ? new Date(input.expiresAt) : undefined,
    applicableCustomerIds: input.applicableCustomerIds?.map((id) => new Types.ObjectId(id)) ?? [],
    applicableServiceIds: input.applicableServiceIds?.map((id) => new Types.ObjectId(id)) ?? [],
  })
}

export async function updateCoupon(id: string, input: Partial<CreateCouponInput>): Promise<ICoupon> {
  const update: Record<string, unknown> = { ...input }
  if (input.validFrom !== undefined) update.validFrom = input.validFrom ? new Date(input.validFrom) : null
  if (input.expiresAt !== undefined) update.expiresAt = input.expiresAt ? new Date(input.expiresAt) : null
  if (input.applicableCustomerIds) update.applicableCustomerIds = input.applicableCustomerIds.map((id) => new Types.ObjectId(id))
  if (input.applicableServiceIds) update.applicableServiceIds = input.applicableServiceIds.map((id) => new Types.ObjectId(id))

  const c = await Coupon.findByIdAndUpdate(id, update, { new: true, runValidators: true })
  if (!c) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return c
}

export async function deleteCoupon(id: string): Promise<void> {
  const c = await Coupon.findByIdAndDelete(id)
  if (!c) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
}
