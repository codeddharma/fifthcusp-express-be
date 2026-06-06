import { Document, model, Schema, Types } from 'mongoose'

export type PaymentLinkStatus = 'pending' | 'paid' | 'cancelled' | 'expired'

export interface IPaymentLink extends Document {
  token: string
  customerId: Types.ObjectId
  serviceId?: Types.ObjectId
  customServiceDescription?: string
  amount: number
  description: string
  validUntil: Date
  status: PaymentLinkStatus
  notes?: string
  paidAt?: Date
  linkedOrderId?: Types.ObjectId
  prefillName: string
  prefillEmail: string
  prefillPhone: string
  razorpayOrderId?: string
  createdAt: Date
  updatedAt: Date
}

const PaymentLinkSchema = new Schema<IPaymentLink>(
  {
    token: { type: String, required: true, unique: true, trim: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
    customServiceDescription: { type: String, trim: true },
    amount: { type: Number, required: true, min: 1 },
    description: { type: String, required: true, trim: true },
    validUntil: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'paid', 'cancelled', 'expired'], default: 'pending' },
    notes: { type: String, trim: true },
    paidAt: { type: Date },
    linkedOrderId: { type: Schema.Types.ObjectId, ref: 'Order' },
    prefillName: { type: String, required: true, trim: true },
    prefillEmail: { type: String, required: true, trim: true, lowercase: true },
    prefillPhone: { type: String, required: true, trim: true },
    razorpayOrderId: { type: String, index: true },
  },
  { timestamps: true },
)

PaymentLinkSchema.index({ token: 1 }, { unique: true })
PaymentLinkSchema.index({ customerId: 1, createdAt: -1 })
PaymentLinkSchema.index({ status: 1, validUntil: 1 })

export const PaymentLink = model<IPaymentLink>('PaymentLink', PaymentLinkSchema)
