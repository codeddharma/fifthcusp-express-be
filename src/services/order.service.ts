import crypto from 'crypto'
import { Types } from 'mongoose'
import env from '../config/env'
import { razorpay } from '../config/razorpay'
import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'
import { generateOrderNumber } from '../utils/generateOrderNumber'
import { buildFormSchema } from '../utils/buildFormSchema'
import { Service, IService, IFormInput } from '../models/Service'
import { Customer } from '../models/Customer'
import { Order, IOrder, IFormResponseEntry, IOrderAddOn, IOrderPricing, OrderStatus } from '../models/Order'
import * as CustomerService from './customer.service'
import * as UploadService from './upload.service'
import * as CouponService from './coupon.service'

interface SelectedAddOnInput {
  key: string
  formResponses?: Record<string, unknown>
}

export interface CreateOrderInput {
  serviceSku: string
  customer: { name: string; email: string; phone: string }
  quantity?: number
  formResponses: Record<string, unknown>
  selectedAddOns?: SelectedAddOnInput[]
  files: Express.Multer.File[]
  couponCode?: string
}

export interface CreateOrderResult {
  orderNumber: string
  razorpayOrderId: string
  amount: number
  currency: string
  key: string
  prefill: { name: string; email: string; contact: string }
}

function buildResponseEntries(inputs: IFormInput[], answers: Record<string, unknown>, addOnKey?: string): IFormResponseEntry[] {
  return inputs.map((f) => ({
    fieldKey: f.fieldKey,
    label: f.label,
    type: f.type,
    value: answers[f.fieldKey],
    ...(addOnKey ? { addOnKey } : {}),
  }))
}

function computePricing(
  service: IService,
  quantity: number,
  addOnsTotal: number,
  couponCode?: string,
  couponDiscount = 0,
): IOrderPricing {
  const basePrice = service.price * quantity
  const subtotal = basePrice + addOnsTotal
  const discountPercentage = service.discountPercentage ?? 0
  const discountAmount = Math.round((subtotal * discountPercentage) / 100)
  const finalAmount = Math.max(0, subtotal - discountAmount - couponDiscount)
  return {
    basePrice,
    addOnsTotal,
    discountPercentage,
    discountAmount,
    couponCode,
    couponDiscount,
    subtotal,
    finalAmount,
    currency: 'INR',
  }
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const service = await Service.findOne({ sku: input.serviceSku.trim().toUpperCase() })
  if (!service) throw new ApiError(HttpStatus.NOT_FOUND, 'Service not found')
  if (!service.isActiveService) throw new ApiError(HttpStatus.BAD_REQUEST, 'Service is not currently available')

  const quantity = Math.max(1, input.quantity ?? 1)
  if (service.repeatableGroup?.enabled) {
    if (quantity > service.repeatableGroup.maxRepeats) {
      throw new ApiError(HttpStatus.BAD_REQUEST, `Max ${service.repeatableGroup.maxRepeats} repeats for this service`)
    }
  } else if (quantity !== 1) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'This service does not support multiple quantities')
  }

  // Validate main form responses
  const baseSchema = buildFormSchema(service.formInputs)
  const parsedBase = baseSchema.safeParse(input.formResponses)
  if (!parsedBase.success) {
    throw new ApiError(HttpStatus.BAD_REQUEST, `Form validation failed: ${parsedBase.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`)
  }

  // Validate selected add-ons and their form responses
  const selectedAddOns = input.selectedAddOns ?? []
  const selectedAddOnKeys = new Set(selectedAddOns.map((a) => a.key))
  const addOnSnapshots: IOrderAddOn[] = []
  const addOnResponses: IFormResponseEntry[] = []
  const addOnFileFields = new Map<string, typeof service.addOns[number]['fileUploads']>()

  for (const sel of selectedAddOns) {
    const def = service.addOns.find((a) => a.key === sel.key)
    if (!def) throw new ApiError(HttpStatus.BAD_REQUEST, `Unknown add-on: ${sel.key}`)
    addOnSnapshots.push({ key: def.key, label: def.label, price: def.price })
    addOnFileFields.set(def.key, def.fileUploads)

    if (def.formInputs.length > 0) {
      const addOnSchema = buildFormSchema(def.formInputs)
      const parsed = addOnSchema.safeParse(sel.formResponses ?? {})
      if (!parsed.success) {
        throw new ApiError(
          HttpStatus.BAD_REQUEST,
          `Add-on ${def.label}: ${parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ')}`,
        )
      }
      addOnResponses.push(...buildResponseEntries(def.formInputs, sel.formResponses ?? {}, def.key))
    }
  }

  // Validate files
  UploadService.validateFilesAgainstService(input.files, service.fileUploads, addOnFileFields, selectedAddOnKeys)

  // Upsert customer
  const customer = await CustomerService.upsertCustomer(input.customer)

  // Compute base pricing
  const addOnsTotal = addOnSnapshots.reduce((sum, a) => sum + a.price, 0)
  let couponValidation: Awaited<ReturnType<typeof CouponService.validateCoupon>> | undefined
  if (input.couponCode) {
    const preTotal = service.price * Math.max(1, input.quantity ?? 1) + addOnsTotal
    couponValidation = await CouponService.validateCoupon({
      code: input.couponCode,
      serviceId: String(service._id),
      customerId: String(customer._id),
      amount: preTotal,
    })
  }
  const pricing = computePricing(
    service,
    quantity,
    addOnsTotal,
    couponValidation ? input.couponCode : undefined,
    couponValidation?.discountAmount ?? 0,
  )

  if (pricing.finalAmount <= 0) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Order total must be greater than zero')
  }

  const orderNumber = generateOrderNumber(service._id as Types.ObjectId)

  // Persist files BEFORE Razorpay so we can roll back cleanly on failure
  let storedFiles: Awaited<ReturnType<typeof UploadService.persistOrderFiles>> = []
  try {
    storedFiles = await UploadService.persistOrderFiles(orderNumber, input.files)
  } catch (err) {
    await UploadService.purgeOrderDir(orderNumber).catch(() => undefined)
    throw err
  }

  // Create Razorpay order
  let razorpayOrder: { id: string; amount: number | string; currency: string }
  try {
    razorpayOrder = await razorpay.orders.create({
      amount: pricing.finalAmount * 100,
      currency: pricing.currency,
      receipt: orderNumber,
      notes: { orderNumber, serviceSku: service.sku },
    })
  } catch (err) {
    await UploadService.purgeOrderDir(orderNumber).catch(() => undefined)
    throw new ApiError(HttpStatus.INTERNAL_ERROR, `Razorpay order creation failed: ${(err as Error).message}`)
  }

  const formResponses: IFormResponseEntry[] = [
    ...buildResponseEntries(service.formInputs, input.formResponses),
    ...addOnResponses,
  ]

  await Order.create({
    orderNumber,
    customerId: customer._id,
    serviceId: service._id,
    serviceSku: service.sku,
    serviceSnapshot: {
      title: service.title,
      type: service.type,
      basePrice: service.price,
      discountPercentage: service.discountPercentage ?? 0,
    },
    quantity,
    formResponses,
    selectedAddOns: addOnSnapshots,
    fileUploads: storedFiles,
    pricing,
    razorpayOrderId: razorpayOrder.id,
    paymentStatus: 'pending',
    orderStatus: 'created',
  })

  if (couponValidation) {
    await CouponService.applyCoupon(couponValidation.coupon._id as Types.ObjectId)
  }

  return {
    orderNumber,
    razorpayOrderId: razorpayOrder.id,
    amount: pricing.finalAmount * 100,
    currency: pricing.currency,
    key: env.RAZORPAY_KEY_ID,
    prefill: { name: customer.name, email: customer.email, contact: customer.phone },
  }
}

function hmacSha256(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

async function applyPaymentSuccess(order: IOrder, paymentId: string, signature: string | undefined, eventType: string, raw?: unknown): Promise<void> {
  if (order.paymentStatus === 'paid') {
    // Already applied — just record the duplicate event
    order.paymentAttempts.push({ at: new Date(), eventType: `${eventType}:duplicate`, raw })
    await order.save()
    return
  }

  order.paymentStatus = 'paid'
  order.razorpayPaymentId = paymentId
  if (signature) order.razorpaySignature = signature
  order.paymentAttempts.push({ at: new Date(), eventType, raw })
  await order.save()

  await Promise.all([
    Customer.updateOne({ _id: order.customerId }, { $addToSet: { orders: order._id } }),
    Service.updateOne({ _id: order.serviceId }, { $inc: { soldCount: 1 }, $set: { lastSoldDate: new Date() } }),
  ])
}

export async function verifyPayment(
  orderNumber: string,
  body: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
): Promise<IOrder> {
  const order = await Order.findOne({ orderNumber })
  if (!order) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  if (order.razorpayOrderId !== body.razorpay_order_id) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Razorpay order mismatch')
  }

  const expected = hmacSha256(`${body.razorpay_order_id}|${body.razorpay_payment_id}`, env.RAZORPAY_KEY_SECRET)
  const ok = crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(body.razorpay_signature))
  if (!ok) {
    if (order.paymentStatus === 'pending') {
      order.paymentStatus = 'failed'
      order.paymentAttempts.push({ at: new Date(), eventType: 'verify:bad-signature' })
      await order.save()
    }
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Invalid payment signature')
  }

  await applyPaymentSuccess(order, body.razorpay_payment_id, body.razorpay_signature, 'verify:success')
  return order
}

export async function handleWebhookEvent(rawBody: Buffer, signature: string | undefined): Promise<void> {
  if (!signature) throw new ApiError(HttpStatus.BAD_REQUEST, 'Missing webhook signature')
  const expected = hmacSha256(rawBody.toString('utf8'), env.RAZORPAY_WEBHOOK_SECRET)
  const ok = expected.length === signature.length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))
  if (!ok) throw new ApiError(HttpStatus.BAD_REQUEST, 'Invalid webhook signature')

  const event = JSON.parse(rawBody.toString('utf8')) as {
    event: string
    payload: { payment?: { entity: { id: string; order_id: string; status: string } }; order?: { entity: { id: string } } }
  }

  const paymentEntity = event.payload?.payment?.entity
  const razorpayOrderId = paymentEntity?.order_id ?? event.payload?.order?.entity?.id
  if (!razorpayOrderId) return

  const order = await Order.findOne({ razorpayOrderId })
  if (!order) return

  switch (event.event) {
    case 'payment.captured':
    case 'order.paid':
      if (paymentEntity) {
        await applyPaymentSuccess(order, paymentEntity.id, undefined, `webhook:${event.event}`, event)
      }
      break
    case 'payment.failed':
      if (order.paymentStatus === 'pending') {
        order.paymentStatus = 'failed'
      }
      order.paymentAttempts.push({ at: new Date(), eventType: `webhook:${event.event}`, raw: event })
      await order.save()
      break
    default:
      order.paymentAttempts.push({ at: new Date(), eventType: `webhook:${event.event}`, raw: event })
      await order.save()
  }
}

export interface ListOrdersOptions {
  paymentStatus?: string
  orderStatus?: string
  serviceSku?: string
  customerEmail?: string
  from?: string
  to?: string
  page?: number
  limit?: number
}

export async function listOrders(opts: ListOrdersOptions): Promise<{ data: IOrder[]; total: number; page: number; limit: number; totalPages: number }> {
  const page = Math.max(1, opts.page ?? 1)
  const limit = Math.min(100, Math.max(1, opts.limit ?? 20))
  const filter: Record<string, unknown> = {}
  if (opts.paymentStatus) filter.paymentStatus = opts.paymentStatus
  if (opts.orderStatus) filter.orderStatus = opts.orderStatus
  if (opts.serviceSku) filter.serviceSku = opts.serviceSku.toUpperCase()
  if (opts.from || opts.to) {
    const range: Record<string, Date> = {}
    if (opts.from) range.$gte = new Date(opts.from)
    if (opts.to) range.$lte = new Date(opts.to)
    filter.createdAt = range
  }
  if (opts.customerEmail) {
    const c = await Customer.findOne({ email: opts.customerEmail.toLowerCase() })
    if (!c) return { data: [], total: 0, page, limit, totalPages: 0 }
    filter.customerId = c._id
  }
  const [data, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('customerId'),
    Order.countDocuments(filter),
  ])
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getOrderById(id: string): Promise<IOrder> {
  const order = await Order.findById(id).populate('customerId').populate('serviceId')
  if (!order) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return order
}

export async function getOrderStatusByNumber(orderNumber: string): Promise<{ orderNumber: string; paymentStatus: string; orderStatus: string }> {
  const order = await Order.findOne({ orderNumber }, { orderNumber: 1, paymentStatus: 1, orderStatus: 1 })
  if (!order) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return { orderNumber: order.orderNumber, paymentStatus: order.paymentStatus, orderStatus: order.orderStatus }
}

const ORDER_STATUS_VALUES: OrderStatus[] = ['created', 'in_progress', 'on_hold', 'completed', 'cancelled']

export async function updateOrderStatus(id: string, nextStatus: OrderStatus, adminId: Types.ObjectId, note?: string): Promise<IOrder> {
  if (!ORDER_STATUS_VALUES.includes(nextStatus)) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Invalid order status')
  }
  const order = await Order.findById(id)
  if (!order) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  if (order.orderStatus === nextStatus) return order

  const from = order.orderStatus
  order.orderStatus = nextStatus
  order.statusHistory.push({ at: new Date(), by: adminId, from, to: nextStatus, note })

  if (nextStatus === 'cancelled' && !order.filesPurgedAt) {
    await UploadService.purgeOrderDir(order.orderNumber).catch(() => undefined)
    order.filesPurgedAt = new Date()
    order.fileUploads.forEach((f) => {
      f.path = ''
    })
  }

  await order.save()
  return order
}

export async function purgeCompletedOrderFiles(): Promise<number> {
  const cutoff = new Date(Date.now() - env.ORDER_FILES_RETENTION_DAYS * 24 * 60 * 60 * 1000)
  const due = await Order.find({ orderStatus: 'completed', filesPurgedAt: null, updatedAt: { $lt: cutoff } })
  let purged = 0
  for (const order of due) {
    await UploadService.purgeOrderDir(order.orderNumber).catch(() => undefined)
    order.filesPurgedAt = new Date()
    order.fileUploads.forEach((f) => {
      f.path = ''
    })
    await order.save()
    purged++
  }
  return purged
}

export async function getOrderFile(orderId: string, fieldKey: string, addOnKey?: string) {
  const order = await Order.findById(orderId)
  if (!order) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  const match = order.fileUploads.find((f) => f.fieldKey === fieldKey && (addOnKey ? f.addOnKey === addOnKey : !f.addOnKey))
  if (!match) throw new ApiError(HttpStatus.NOT_FOUND, 'File not found')
  if (!match.path) throw new ApiError(HttpStatus.NOT_FOUND, 'File has been purged')
  return { file: match }
}
