import { Document, model, Schema, Types } from 'mongoose'
import { FieldType } from './Service'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type OrderStatus = 'created' | 'in_progress' | 'on_hold' | 'completed' | 'awaiting_feedback' | 'closed' | 'cancelled'
export type FileCompression = 'none' | 'sharp-jpeg' | 'sharp-webp' | 'gzip'

export interface IFormResponseEntry {
  fieldKey: string
  label: string
  type: FieldType
  value: unknown
  addOnKey?: string
}

export interface IOrderAddOn {
  key: string
  label: string
  price: number
}

export interface IOrderFile {
  fieldKey: string
  addOnKey?: string
  originalName: string
  storedName: string
  mimeType: string
  originalSizeBytes: number
  storedSizeBytes: number
  compression: FileCompression
  path: string
  uploadedAt: Date
}

export interface IOutputFile {
  originalName: string
  storedPath: string
  uploadedAt: Date
  uploadedBy: Types.ObjectId
}

export interface IOrderPricing {
  basePrice: number
  addOnsTotal: number
  discountPercentage: number
  discountAmount: number
  couponCode?: string
  couponDiscount: number
  subtotal: number
  finalAmount: number
  currency: string
}

export interface IServiceSnapshot {
  title: string
  type: string
  basePrice: number
  discountPercentage: number
}

export interface IPaymentAttempt {
  at: Date
  eventType: string
  raw?: unknown
}

export interface IStatusHistoryEntry {
  at: Date
  by?: Types.ObjectId
  from: OrderStatus
  to: OrderStatus
  note?: string
}

export interface IOrder extends Document {
  orderNumber: string
  customerId: Types.ObjectId
  serviceId: Types.ObjectId
  serviceSku: string
  serviceSnapshot: IServiceSnapshot
  quantity: number
  formResponses: IFormResponseEntry[]
  selectedAddOns: IOrderAddOn[]
  fileUploads: IOrderFile[]
  pricing: IOrderPricing
  razorpayOrderId?: string
  razorpayPaymentId?: string
  razorpaySignature?: string
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  paymentAttempts: IPaymentAttempt[]
  statusHistory: IStatusHistoryEntry[]
  filesPurgedAt?: Date
  // Delivery & feedback tracking
  deadline?: Date
  outputFiles: IOutputFile[]
  feedbackToken?: string
  feedbackEmailSentAt?: Date
  createdAt: Date
  updatedAt: Date
}

const FormResponseEntrySchema = new Schema<IFormResponseEntry>(
  {
    fieldKey: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
    value: { type: Schema.Types.Mixed },
    addOnKey: { type: String },
  },
  { _id: false },
)

const OrderAddOnSchema = new Schema<IOrderAddOn>(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: false },
)

const OrderFileSchema = new Schema<IOrderFile>(
  {
    fieldKey: { type: String, required: true },
    addOnKey: { type: String },
    originalName: { type: String, required: true },
    storedName: { type: String, required: true },
    mimeType: { type: String, required: true },
    originalSizeBytes: { type: Number, required: true },
    storedSizeBytes: { type: Number, required: true },
    compression: { type: String, enum: ['none', 'sharp-jpeg', 'sharp-webp', 'gzip'], required: true },
    path: { type: String, required: true },
    uploadedAt: { type: Date, required: true },
  },
  { _id: false },
)

const OrderPricingSchema = new Schema<IOrderPricing>(
  {
    basePrice: { type: Number, required: true, min: 0 },
    addOnsTotal: { type: Number, required: true, min: 0, default: 0 },
    discountPercentage: { type: Number, required: true, min: 0, max: 100, default: 0 },
    discountAmount: { type: Number, required: true, min: 0, default: 0 },
    couponCode: { type: String },
    couponDiscount: { type: Number, min: 0, default: 0 },
    subtotal: { type: Number, required: true, min: 0 },
    finalAmount: { type: Number, required: true, min: 0 },
    currency: { type: String, required: true, default: 'INR' },
  },
  { _id: false },
)

const ServiceSnapshotSchema = new Schema<IServiceSnapshot>(
  {
    title: { type: String, required: true },
    type: { type: String, required: true },
    basePrice: { type: Number, required: true },
    discountPercentage: { type: Number, required: true, default: 0 },
  },
  { _id: false },
)

const PaymentAttemptSchema = new Schema<IPaymentAttempt>(
  {
    at: { type: Date, required: true },
    eventType: { type: String, required: true },
    raw: { type: Schema.Types.Mixed },
  },
  { _id: false },
)

const OutputFileSchema = new Schema<IOutputFile>(
  {
    originalName: { type: String, required: true },
    storedPath: { type: String, required: true },
    uploadedAt: { type: Date, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { _id: false },
)

const StatusHistoryEntrySchema = new Schema<IStatusHistoryEntry>(
  {
    at: { type: Date, required: true },
    by: { type: Schema.Types.ObjectId, ref: 'User' },
    from: { type: String, required: true },
    to: { type: String, required: true },
    note: { type: String },
  },
  { _id: false },
)

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    serviceSku: { type: String, required: true },
    serviceSnapshot: { type: ServiceSnapshotSchema, required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    formResponses: { type: [FormResponseEntrySchema], default: [] },
    selectedAddOns: { type: [OrderAddOnSchema], default: [] },
    fileUploads: { type: [OrderFileSchema], default: [] },
    pricing: { type: OrderPricingSchema, required: true },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    orderStatus: {
      type: String,
      enum: ['created', 'in_progress', 'on_hold', 'completed', 'awaiting_feedback', 'closed', 'cancelled'],
      default: 'created',
    },
    paymentAttempts: { type: [PaymentAttemptSchema], default: [] },
    statusHistory: { type: [StatusHistoryEntrySchema], default: [] },
    filesPurgedAt: { type: Date },
    deadline: { type: Date },
    outputFiles: { type: [OutputFileSchema], default: [] },
    feedbackToken: { type: String },
    feedbackEmailSentAt: { type: Date },
  },
  { timestamps: true },
)

OrderSchema.index({ customerId: 1, createdAt: -1 })
OrderSchema.index({ paymentStatus: 1, orderStatus: 1 })
OrderSchema.index({ orderStatus: 1, paymentStatus: 1, filesPurgedAt: 1 })
OrderSchema.index({ deadline: 1, paymentStatus: 1, orderStatus: 1 })

export const Order = model<IOrder>('Order', OrderSchema)
