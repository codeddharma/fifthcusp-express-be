import { Request, Response } from 'express'
import { z } from 'zod'
import * as OrderService from '../services/order.service'
import * as UploadService from '../services/upload.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'

const customerInputSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(7).max(20),
})

const selectedAddOnSchema = z.object({
  key: z.string().min(1),
  formResponses: z.record(z.unknown()).optional(),
})

const createOrderBodySchema = z.object({
  serviceSku: z.string().min(1),
  customer: customerInputSchema,
  quantity: z.coerce.number().int().min(1).optional(),
  formResponses: z.record(z.unknown()).default({}),
  selectedAddOns: z.array(selectedAddOnSchema).optional().default([]),
  couponCode: z.string().optional(),
})

const verifyPaymentSchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
})

const updateStatusSchema = z.object({
  orderStatus: z.enum(['created', 'in_progress', 'on_hold', 'completed', 'cancelled']),
  note: z.string().optional(),
})

function parseJsonField<T>(raw: unknown, fallback: T): T {
  if (raw === undefined || raw === null || raw === '') return fallback
  if (typeof raw !== 'string') return raw as T
  try {
    return JSON.parse(raw) as T
  } catch {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Invalid JSON in multipart field')
  }
}

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const body = {
    serviceSku: req.body.serviceSku,
    customer: parseJsonField<Record<string, unknown>>(req.body.customer, {}),
    quantity: req.body.quantity ? Number(req.body.quantity) : undefined,
    formResponses: parseJsonField<Record<string, unknown>>(req.body.formResponses, {}),
    selectedAddOns: parseJsonField<unknown[]>(req.body.selectedAddOns, []),
    couponCode: req.body.couponCode ?? undefined,
  }
  const input = createOrderBodySchema.parse(body)
  const files = (req.files as Express.Multer.File[] | undefined) ?? []

  const result = await OrderService.createOrder({ ...input, files })
  sendSuccess(res, HttpMessage.CREATED, result, HttpStatus.CREATED)
})

export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const input = verifyPaymentSchema.parse(req.body)
  const order = await OrderService.verifyPayment(req.params.orderNumber, input)
  sendSuccess(res, 'Payment verified', {
    orderNumber: order.orderNumber,
    paymentStatus: order.paymentStatus,
    orderStatus: order.orderStatus,
  }, HttpStatus.OK)
})

export const getOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const status = await OrderService.getOrderStatusByNumber(req.params.orderNumber)
  sendSuccess(res, HttpMessage.OK, status, HttpStatus.OK)
})

// ─── Admin ────────────────────────────────────────────────────────────────────

export const adminListOrders = asyncHandler(async (req: Request, res: Response) => {
  const result = await OrderService.listOrders({
    paymentStatus: typeof req.query.paymentStatus === 'string' ? req.query.paymentStatus : undefined,
    orderStatus: typeof req.query.orderStatus === 'string' ? req.query.orderStatus : undefined,
    serviceSku: typeof req.query.serviceSku === 'string' ? req.query.serviceSku : undefined,
    customerEmail: typeof req.query.customerEmail === 'string' ? req.query.customerEmail : undefined,
    from: typeof req.query.from === 'string' ? req.query.from : undefined,
    to: typeof req.query.to === 'string' ? req.query.to : undefined,
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  })
  sendSuccess(res, HttpMessage.OK, result.data, HttpStatus.OK, {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  })
})

export const adminGetOrder = asyncHandler(async (req: Request, res: Response) => {
  const order = await OrderService.getOrderById(req.params.id)
  sendSuccess(res, HttpMessage.OK, order, HttpStatus.OK)
})

export const adminUpdateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
  const input = updateStatusSchema.parse(req.body)
  if (!req.user) throw new ApiError(HttpStatus.UNAUTHORIZED, HttpMessage.UNAUTHORIZED)
  const order = await OrderService.updateOrderStatus(req.params.id, input.orderStatus, req.user._id, input.note)
  sendSuccess(res, HttpMessage.UPDATED, order, HttpStatus.OK)
})

export const adminDownloadOrderFile = asyncHandler(async (req: Request, res: Response) => {
  const fieldKey = req.params.fieldKey
  const addOnKey = typeof req.query.addOnKey === 'string' ? req.query.addOnKey : undefined
  const { file } = await OrderService.getOrderFile(req.params.id, fieldKey, addOnKey)
  res.setHeader('Content-Type', file.mimeType)
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`)
  UploadService.fileReadStream(file.path, file.compression).pipe(res)
})

export const adminPurgeOrderFiles = asyncHandler(async (_req: Request, res: Response) => {
  const purged = await OrderService.purgeCompletedOrderFiles()
  sendSuccess(res, HttpMessage.OK, { purged }, HttpStatus.OK)
})
