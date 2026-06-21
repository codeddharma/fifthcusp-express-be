import crypto from 'crypto'
import { Types } from 'mongoose'
import { razorpay } from '../config/razorpay'
import env from '../config/env'
import { PaymentLink, IPaymentLink } from '../models/PaymentLink'
import { Order } from '../models/Order'
import { Customer } from '../models/Customer'
import { Service } from '../models/Service'
import { ApiError } from '../utils/ApiError'
import { HttpMessage, HttpStatus } from '../utils/httpStatus'
import { sendMail } from '../utils/mailer'
import { paymentLinkInviteHtml } from '../emails/paymentLinkInvite'

export interface CreatePaymentLinkInput {
  customerId: string
  serviceId?: string
  customServiceDescription?: string
  amount: number
  description: string
  validUntil: string
  notes?: string
}

export async function createPaymentLink(input: CreatePaymentLinkInput): Promise<IPaymentLink> {
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

  const token = crypto.randomBytes(24).toString('hex')
  const validUntil = new Date(input.validUntil)
  if (validUntil <= new Date()) throw new ApiError(HttpStatus.BAD_REQUEST, 'Valid until must be in the future.')

  return PaymentLink.create({
    token,
    customerId: new Types.ObjectId(input.customerId),
    serviceId: serviceRef,
    customServiceDescription: input.customServiceDescription,
    amount: input.amount,
    description: input.description,
    validUntil,
    notes: input.notes,
    prefillName: customer.name,
    prefillEmail: customer.email,
    prefillPhone: customer.phone,
  })
}

/** Emails the customer the secure /pay/{token} link. Used for direct sends and recurring cycles. */
export async function sendPaymentLinkEmail(link: IPaymentLink): Promise<void> {
  const payUrl = `${env.FRONTEND_URL}/pay/${link.token}`
  await sendMail({
    to: link.prefillEmail,
    subject: `Payment link: ${link.description}`,
    html: paymentLinkInviteHtml({
      customerName: link.prefillName,
      description: link.description,
      amount: link.amount,
      payUrl,
      expiresAt: link.validUntil,
    }),
  })
}

export async function listPaymentLinks(opts: { page?: number; limit?: number }): Promise<{
  data: IPaymentLink[]
  total: number
  page: number
  limit: number
  totalPages: number
}> {
  const page = Math.max(1, opts.page ?? 1)
  const limit = Math.min(100, Math.max(1, opts.limit ?? 20))
  const [data, total] = await Promise.all([
    PaymentLink.find()
      .populate('customerId', 'name email customerId')
      .populate('serviceId', 'title sku')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    PaymentLink.countDocuments(),
  ])
  return { data, total, page, limit, totalPages: Math.ceil(total / limit) }
}

export async function getPaymentLinkById(id: string): Promise<IPaymentLink> {
  const link = await PaymentLink.findById(id)
    .populate('customerId', 'name email customerId phone')
    .populate('serviceId', 'title sku')
    .populate('linkedOrderId', 'orderNumber paymentStatus')
  if (!link) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  return link
}

export async function cancelPaymentLink(id: string): Promise<IPaymentLink> {
  const link = await PaymentLink.findById(id)
  if (!link) throw new ApiError(HttpStatus.NOT_FOUND, HttpMessage.NOT_FOUND)
  if (link.status !== 'pending') throw new ApiError(HttpStatus.BAD_REQUEST, `Cannot cancel a ${link.status} payment link.`)
  link.status = 'cancelled'
  return link.save()
}

// --- Public routes (used by the frontend /pay/[token] page) ---

export async function getPublicLinkByToken(token: string): Promise<IPaymentLink> {
  const link = await PaymentLink.findOne({ token })
    .populate('serviceId', 'title sku')
  if (!link) throw new ApiError(HttpStatus.NOT_FOUND, 'Payment link not found.')

  // Auto-expire if past validUntil
  if (link.status === 'pending' && link.validUntil < new Date()) {
    link.status = 'expired'
    await link.save()
  }

  // Return the link regardless of status — frontend shows the appropriate message
  return link
}

export async function createRazorpayOrderForLink(token: string): Promise<{
  razorpayOrderId: string
  amount: number
  currency: string
  key: string
  prefill: { name: string; email: string; contact: string }
}> {
  const link = await PaymentLink.findOne({ token })
  if (!link) throw new ApiError(HttpStatus.NOT_FOUND, 'Payment link not found.')
  if (link.status !== 'pending') throw new ApiError(HttpStatus.BAD_REQUEST, `Payment link is ${link.status}.`)
  if (link.validUntil < new Date()) {
    link.status = 'expired'
    await link.save()
    throw new ApiError(HttpStatus.GONE, 'Payment link has expired.')
  }

  const rzOrder = await razorpay.orders.create({
    amount: link.amount * 100,
    currency: 'INR',
    receipt: `pl-${token.slice(0, 12)}`,
    notes: { paymentLinkToken: token },
  })

  link.razorpayOrderId = rzOrder.id
  await link.save()

  return {
    razorpayOrderId: rzOrder.id,
    amount: link.amount * 100,
    currency: 'INR',
    key: env.RAZORPAY_KEY_ID,
    prefill: { name: link.prefillName, email: link.prefillEmail, contact: link.prefillPhone },
  }
}

function hmacSha256(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex')
}

export async function verifyAndFulfillLink(
  token: string,
  payload: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string },
): Promise<IPaymentLink> {
  const link = await PaymentLink.findOne({ token })
  if (!link) throw new ApiError(HttpStatus.NOT_FOUND, 'Payment link not found.')
  if (link.status === 'paid') return link
  if (link.status !== 'pending') throw new ApiError(HttpStatus.BAD_REQUEST, `Payment link is ${link.status}.`)

  const expected = hmacSha256(`${payload.razorpay_order_id}|${payload.razorpay_payment_id}`, env.RAZORPAY_KEY_SECRET)
  if (expected !== payload.razorpay_signature) {
    throw new ApiError(HttpStatus.BAD_REQUEST, 'Payment signature verification failed.')
  }

  // Find customer
  const customer = await Customer.findById(link.customerId)
  if (!customer) throw new ApiError(HttpStatus.NOT_FOUND, 'Customer not found.')

  // Create an Order record
  const orderNumber = `PLK-${token.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
  const order = await Order.create({
    orderNumber,
    customerId: customer._id,
    serviceId: link.serviceId ?? customer._id,
    serviceSku: link.serviceId ? 'PAYMENT-LINK' : 'CUSTOM',
    serviceSnapshot: {
      title: link.description,
      type: 'payment_link',
      basePrice: link.amount,
      discountPercentage: 0,
    },
    quantity: 1,
    formResponses: [],
    selectedAddOns: [],
    fileUploads: [],
    pricing: {
      basePrice: link.amount,
      addOnsTotal: 0,
      discountPercentage: 0,
      discountAmount: 0,
      couponDiscount: 0,
      subtotal: link.amount,
      finalAmount: link.amount,
      currency: 'INR',
    },
    razorpayOrderId: payload.razorpay_order_id,
    razorpayPaymentId: payload.razorpay_payment_id,
    razorpaySignature: payload.razorpay_signature,
    paymentStatus: 'paid',
    orderStatus: 'created',
    paymentAttempts: [{ at: new Date(), eventType: 'payment_link:verify:success', raw: payload }],
  })

  // Link order back to customer
  await Customer.findByIdAndUpdate(customer._id, { $push: { orders: order._id } })

  link.status = 'paid'
  link.paidAt = new Date()
  link.linkedOrderId = order._id as Types.ObjectId
  return link.save()
}
