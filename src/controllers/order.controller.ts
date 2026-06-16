import crypto from 'crypto'
import path from 'path'
import fs from 'fs'
import { Request, Response } from 'express'
import { z } from 'zod'
import * as OrderService from '../services/order.service'
import * as UploadService from '../services/upload.service'
import { asyncHandler } from '../utils/asyncHandler'
import { sendSuccess } from '../utils/ApiResponse'
import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'
import { sendMail } from '../utils/mailer'
import { orderCompletedHtml } from '../emails/orderCompleted'
import { feedbackRequestHtml } from '../emails/feedbackRequest'
import { Order } from '../models/Order'
import { Service } from '../models/Service'
import { Customer } from '../models/Customer'
import { Testimonial } from '../models/Testimonial'
import env from '../config/env'

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
  orderStatus: z.enum(['created', 'in_progress', 'on_hold', 'completed', 'awaiting_feedback', 'closed', 'cancelled']),
  note: z.string().optional(),
})

const submitFeedbackSchema = z.object({
  orderNumber: z.string().min(1),
  token: z.string().min(1),
  starRating: z.number().int().min(1).max(5),
  comment: z.string().min(1),
  clientName: z.string().min(1),
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

export const markPaymentAbandoned = asyncHandler(async (req: Request, res: Response) => {
  await OrderService.markPaymentAbandoned(req.params.orderNumber)
  sendSuccess(res, HttpMessage.OK, null, HttpStatus.OK)
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

  // When admin marks an order completed, check if feedback email should be auto-sent
  // (covers consultation-only services that have no output file to upload)
  if (input.orderStatus === 'completed') {
    const order = await Order.findById(req.params.id)
    if (order) {
      const [customer, service] = await Promise.all([
        Customer.findById(order.customerId),
        Service.findById(order.serviceId),
      ])
      if (service?.feedbackEmailEnabled && customer && !order.feedbackToken) {
        const feedbackToken = crypto.randomUUID()
        const frontendOrigin = env.FRONTEND_URL
        const feedbackUrl = `${frontendOrigin}/feedback/${order.orderNumber}?token=${feedbackToken}`

        const from = order.orderStatus
        order.orderStatus = 'awaiting_feedback'
        order.feedbackToken = feedbackToken
        order.feedbackEmailSentAt = new Date()
        const auditNote = ['Marked completed. Feedback request email sent to customer.', input.note].filter(Boolean).join(' | ')
        order.statusHistory.push({ at: new Date(), by: req.user._id, from, to: 'awaiting_feedback', note: auditNote })
        OrderService.logOrderActivity(order, { type: 'status_changed', actor: req.user._id, message: `Status changed: ${from} → awaiting_feedback`, meta: { from, to: 'awaiting_feedback', note: auditNote } })
        OrderService.logOrderActivity(order, { type: 'feedback_requested', actor: req.user._id, message: 'Feedback request email sent', meta: { emailType: 'feedback_request', to: customer.email } })
        await order.save()

        sendMail({
          to: customer.email,
          subject: `How was your ${service.title} experience? — ${order.orderNumber}`,
          html: feedbackRequestHtml({ customerName: customer.name, orderNumber: order.orderNumber, serviceName: service.title, feedbackUrl }),
        }).catch((err) => console.error('[mailer] feedbackRequest failed:', err))

        sendSuccess(res, HttpMessage.UPDATED, order, HttpStatus.OK)
        return
      }
    }
  }

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

export const adminUploadOutputFile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(HttpStatus.UNAUTHORIZED, HttpMessage.UNAUTHORIZED)
  const order = await Order.findById(req.params.id)
  if (!order) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)

  const file = (req.file as Express.Multer.File | undefined)
  if (!file) throw new ApiError(HttpStatus.BAD_REQUEST, 'No file uploaded')

  const outputDir = path.join(env.UPLOAD_DIR, 'output', order.orderNumber)
  fs.mkdirSync(outputDir, { recursive: true })
  const storedPath = path.join(outputDir, file.originalname)
  fs.renameSync(file.path, storedPath)

  order.outputFiles.push({
    originalName: file.originalname,
    storedPath,
    uploadedAt: new Date(),
    uploadedBy: req.user._id,
  })
  await order.save()
  sendSuccess(res, 'Output file uploaded', order, HttpStatus.OK)
})

export const adminSendCompletionEmail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(HttpStatus.UNAUTHORIZED, HttpMessage.UNAUTHORIZED)
  const order = await Order.findById(req.params.id)
  if (!order) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  if (order.outputFiles.length === 0) throw new ApiError(HttpStatus.BAD_REQUEST, 'Upload at least one output file before sending')

  const [customer, service] = await Promise.all([
    Customer.findById(order.customerId),
    Service.findById(order.serviceId),
  ])
  if (!customer) throw new ApiError(HttpStatus.NOT_FOUND, 'Customer not found')
  if (!service) throw new ApiError(HttpStatus.NOT_FOUND, 'Service not found')

  const feedbackEnabled = service.feedbackEmailEnabled
  const feedbackToken = feedbackEnabled ? crypto.randomUUID() : undefined
  const feedbackUrl = feedbackToken ? `${env.FRONTEND_URL}/feedback/${order.orderNumber}?token=${feedbackToken}` : ''

  const attachments = order.outputFiles.map((f) => ({ filename: f.originalName, path: f.storedPath }))

  await sendMail({
    to: customer.email,
    subject: `Your ${service.title} Report is Ready — ${order.orderNumber}`,
    html: orderCompletedHtml({ customerName: customer.name, orderNumber: order.orderNumber, serviceName: service.title }),
    attachments,
  })

  const from = order.orderStatus
  const nextStatus = feedbackEnabled ? 'awaiting_feedback' : 'completed'
  order.orderStatus = nextStatus as typeof order.orderStatus
  const completionNote = feedbackEnabled
    ? 'Completion email sent with PDF attachment. Feedback request email sent to customer.'
    : 'Completion email sent with PDF attachment.'
  order.statusHistory.push({ at: new Date(), by: req.user._id, from, to: order.orderStatus, note: completionNote })
  OrderService.logOrderActivity(order, { type: 'output_files_sent', actor: req.user._id, message: 'Completion email sent with output files', meta: { emailType: 'order_completed', to: customer.email, fileCount: order.outputFiles.length } })
  OrderService.logOrderActivity(order, { type: 'status_changed', actor: req.user._id, message: `Status changed: ${from} → ${order.orderStatus}`, meta: { from, to: order.orderStatus } })

  if (feedbackEnabled && feedbackToken) {
    order.feedbackToken = feedbackToken
    order.feedbackEmailSentAt = new Date()

    sendMail({
      to: customer.email,
      subject: `Share Your Experience — ${order.orderNumber}`,
      html: feedbackRequestHtml({ customerName: customer.name, orderNumber: order.orderNumber, serviceName: service.title, feedbackUrl }),
    }).catch((err) => console.error('[mailer] feedbackRequest failed:', err))
    OrderService.logOrderActivity(order, { type: 'feedback_requested', actor: req.user._id, message: 'Feedback request email sent', meta: { emailType: 'feedback_request', to: customer.email } })
  }

  await order.save()
  sendSuccess(res, 'Completion email sent', order, HttpStatus.OK)
})

export const adminBulkFeedbackEmail = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw new ApiError(HttpStatus.UNAUTHORIZED, HttpMessage.UNAUTHORIZED)

  const completedOrders = await Order.find({ orderStatus: 'completed', paymentStatus: 'paid', feedbackToken: { $exists: false } })

  let sent = 0
  let skipped = 0

  for (const order of completedOrders) {
    const [customer, service] = await Promise.all([
      Customer.findById(order.customerId),
      Service.findById(order.serviceId),
    ])

    if (!customer || !service || !service.feedbackEmailEnabled) {
      skipped++
      continue
    }

    const feedbackToken = crypto.randomUUID()
    const feedbackUrl = `${env.FRONTEND_URL}/feedback/${order.orderNumber}?token=${feedbackToken}`

    const from = order.orderStatus
    order.orderStatus = 'awaiting_feedback'
    order.feedbackToken = feedbackToken
    order.feedbackEmailSentAt = new Date()
    order.statusHistory.push({
      at: new Date(),
      by: req.user._id,
      from,
      to: 'awaiting_feedback',
      note: 'Feedback request email sent via bulk trigger.',
    })
    await order.save()

    sendMail({
      to: customer.email,
      subject: `How was your ${service.title} experience? — ${order.orderNumber}`,
      html: feedbackRequestHtml({ customerName: customer.name, orderNumber: order.orderNumber, serviceName: service.title, feedbackUrl }),
    }).catch((err) => console.error(`[mailer] bulk feedbackRequest failed for ${order.orderNumber}:`, err))

    sent++
  }

  sendSuccess(res, `Feedback emails triggered: ${sent} sent, ${skipped} skipped (no feedback email or already processed).`, { sent, skipped }, HttpStatus.OK)
})

export const adminGetDeadlines = asyncHandler(async (_req: Request, res: Response) => {
  const now = new Date()
  const twoDaysLater = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000)
  const terminalStatuses = ['completed', 'awaiting_feedback', 'closed', 'cancelled']

  const atRisk = await Order.find({
    paymentStatus: 'paid',
    orderStatus: { $nin: terminalStatuses },
    deadline: { $lte: twoDaysLater },
  })
    .populate('customerId', 'name email')
    .populate('serviceId', 'title')
    .sort({ deadline: 1 })
    .limit(100)

  const overdue = atRisk.filter((o) => o.deadline && o.deadline < now)
  const dueSoon = atRisk.filter((o) => o.deadline && o.deadline >= now)

  sendSuccess(res, HttpMessage.OK, { overdue, dueSoon }, HttpStatus.OK)
})

export const submitFeedback = asyncHandler(async (req: Request, res: Response) => {
  const input = submitFeedbackSchema.parse(req.body)
  const order = await Order.findOne({ orderNumber: input.orderNumber }).populate('serviceId', 'title')
  if (!order) throw new ApiError(HttpStatus.NOT_FOUND, 'Order not found')
  if (order.orderStatus !== 'awaiting_feedback') throw new ApiError(HttpStatus.BAD_REQUEST, 'Feedback has already been submitted or is not available for this order')
  if (!order.feedbackToken || order.feedbackToken !== input.token) throw new ApiError(HttpStatus.FORBIDDEN, 'Invalid or expired feedback link')

  const serviceTitle = (order.serviceId as { title?: string })?.title ?? order.serviceSnapshot.title

  await Testimonial.create({
    feedback: input.comment,
    clientName: input.clientName,
    services: [serviceTitle],
    starRating: input.starRating,
    orderId: order._id,
    customerId: order.customerId,
    isApproved: false,
    isRejected: false,
  })

  const from = order.orderStatus
  order.orderStatus = 'closed'
  order.statusHistory.push({ at: new Date(), from, to: 'closed', note: `Customer submitted feedback — ${input.starRating}★ — "${input.comment.slice(0, 80)}${input.comment.length > 80 ? '…' : ''}"` })
  await order.save()

  sendSuccess(res, 'Thank you for your feedback!', {}, HttpStatus.OK)
})
