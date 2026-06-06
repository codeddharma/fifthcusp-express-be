import { Request, Response } from 'express'
import { z } from 'zod'
import * as PaymentLinkService from '../services/paymentLink.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

const createSchema = z.object({
  customerId: z.string().min(1),
  serviceId: z.string().optional(),
  customServiceDescription: z.string().optional(),
  amount: z.number().positive(),
  description: z.string().min(1),
  validUntil: z.string().min(1),
  notes: z.string().optional(),
})

const verifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

// Admin routes
export const listPaymentLinks = asyncHandler(async (req: Request, res: Response) => {
  const page = req.query.page ? Number(req.query.page) : undefined
  const limit = req.query.limit ? Number(req.query.limit) : undefined
  const result = await PaymentLinkService.listPaymentLinks({ page, limit })
  sendSuccess(res, HttpMessage.OK, result.data, HttpStatus.OK, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  })
})

export const createPaymentLink = asyncHandler(async (req: Request, res: Response) => {
  const input = createSchema.parse(req.body)
  const link = await PaymentLinkService.createPaymentLink(input)
  sendSuccess(res, HttpMessage.CREATED, link, HttpStatus.CREATED)
})

export const getPaymentLink = asyncHandler(async (req: Request, res: Response) => {
  const link = await PaymentLinkService.getPaymentLinkById(req.params.id)
  sendSuccess(res, HttpMessage.OK, link, HttpStatus.OK)
})

export const cancelPaymentLink = asyncHandler(async (req: Request, res: Response) => {
  const link = await PaymentLinkService.cancelPaymentLink(req.params.id)
  sendSuccess(res, 'Payment link cancelled', link, HttpStatus.OK)
})

// Public routes (used by frontend /pay/[token] page)
export const getPublicLink = asyncHandler(async (req: Request, res: Response) => {
  const link = await PaymentLinkService.getPublicLinkByToken(req.params.token)
  sendSuccess(res, HttpMessage.OK, {
    token: link.token,
    status: link.status,
    amount: link.amount,
    description: link.description,
    validUntil: link.validUntil,
    prefillName: link.prefillName,
    prefillEmail: link.prefillEmail,
    prefillPhone: link.prefillPhone,
    service: link.serviceId,
  }, HttpStatus.OK)
})

export const initCheckout = asyncHandler(async (req: Request, res: Response) => {
  const result = await PaymentLinkService.createRazorpayOrderForLink(req.params.token)
  sendSuccess(res, 'Checkout initiated', result, HttpStatus.OK)
})

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const input = verifySchema.parse(req.body)
  const link = await PaymentLinkService.verifyAndFulfillLink(req.params.token, input)
  sendSuccess(res, 'Payment verified', { status: link.status, paidAt: link.paidAt }, HttpStatus.OK)
})
