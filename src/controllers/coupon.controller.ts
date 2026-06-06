import { Request, Response } from 'express'
import { z } from 'zod'
import * as CouponService from '../services/coupon.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

const createCouponSchema = z.object({
  code: z.string().min(1),
  description: z.string().optional(),
  discountType: z.enum(['percentage', 'flat']),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().min(0).optional(),
  maxUses: z.number().min(0).optional(),
  validFrom: z.string().optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean().optional(),
  applicableCustomerIds: z.array(z.string()).optional(),
  applicableServiceIds: z.array(z.string()).optional(),
  isBirthdayOffer: z.boolean().optional(),
  isAnniversaryOffer: z.boolean().optional(),
})

const validateCouponSchema = z.object({
  code: z.string().min(1),
  serviceId: z.string().min(1),
  customerId: z.string().optional(),
  amount: z.number().positive(),
})

export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const input = validateCouponSchema.parse(req.body)
  const result = await CouponService.validateCoupon(input)
  sendSuccess(res, 'Coupon valid', {
    code: result.coupon.code,
    discountType: result.coupon.discountType,
    discountValue: result.coupon.discountValue,
    discountAmount: result.discountAmount,
    finalAmount: result.finalAmount,
  }, HttpStatus.OK)
})

export const listCoupons = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : undefined
  const limit = req.query.limit ? Number(req.query.limit) : undefined
  const result = await CouponService.listCoupons({ page, limit })
  sendSuccess(res, HttpMessage.OK, result.data, HttpStatus.OK, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  })
})

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const input = createCouponSchema.parse(req.body)
  const coupon = await CouponService.createCoupon(input)
  sendSuccess(res, HttpMessage.CREATED, coupon, HttpStatus.CREATED)
})

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const input = createCouponSchema.partial().parse(req.body)
  const coupon = await CouponService.updateCoupon(req.params.id, input)
  sendSuccess(res, HttpMessage.UPDATED, coupon, HttpStatus.OK)
})

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  await CouponService.deleteCoupon(req.params.id)
  sendSuccess(res, 'Deleted successfully', null, HttpStatus.OK)
})
